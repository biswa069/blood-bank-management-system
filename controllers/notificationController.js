const notificationModel = require("../models/notificationModel");
const userModel = require("../models/userModel");
const inventoryModel = require("../models/inventoryModel");
const { sendUrgentDemandAlert, sendNotification } = require("../services/notificationService");

// Get all notification logs
const getNotificationLogsController = async (req, res) => {
    try {
        const logs = await notificationModel.find({}).sort({ createdAt: -1 });
        return res.status(200).send({
            success: true,
            message: "Notification logs fetched successfully",
            logs,
        });
    } catch (error) {
        console.error("Error fetching notification logs:", error);
        return res.status(500).send({
            success: false,
            message: "Error fetching notification logs",
            error,
        });
    }
};

// Broadcast an alert manually
const broadcastAlertController = async (req, res) => {
    try {
        const { bloodGroup, message } = req.body;
        
        if (!bloodGroup) {
            return res.status(400).send({
                success: false,
                message: "Blood group is required",
            });
        }

        // We will trigger the urgent alert logic directly
        await sendUrgentDemandAlert(bloodGroup, null);

        // Alternatively, we could log this explicitly as a "broadcast"
        await notificationModel.create({
            type: "broadcast",
            targetBloodGroup: bloodGroup,
            message: message || `MANUAL BROADCAST: Urgent requirement for ${bloodGroup}`,
            status: "success", // or "simulated" based on actual logic, but the service handles it mostly. Actually, the service logs it as "urgent". We can add another log here if we want.
            deliveryChannels: ["email"],
        });

        return res.status(200).send({
            success: true,
            message: "Broadcast alert triggered successfully",
        });

    } catch (error) {
        console.error("Error broadcasting alert:", error);
        return res.status(500).send({
            success: false,
            message: "Error broadcasting alert",
            error,
        });
    }
};

// Dispatch a manual broadcast to targeted users
const sendManualNotification = async (req, res) => {
    console.log("\n\n🚀🚀🚀 [API HIT] - ENTERING EMAIL BROADCAST CONTROLLER 🚀🚀🚀\n\n");
    try {
        const { targetRole, targetBloodGroup, targetCity, subject, message } = req.body;

        if (!targetRole || !subject || !message) {
            return res.status(400).send({
                success: false,
                message: "Target role, subject, and message are required.",
            });
        }

        // Build query
        let query = { role: targetRole };

        if (targetRole === "donor") {
            // Strict Validation for Donors
            if (!targetBloodGroup || targetBloodGroup === "All" || !targetCity || targetCity === "All Cities") {
                 return res.status(400).send({
                     success: false,
                     message: "Target Blood Group and Target City are strictly required for donor broadcasts."
                 });
            }

            // The Loyalty Check: Find users who have previously donated to this specific organization
            const loyalDonorsResult = await inventoryModel.distinct("donor", {
                organisation: req.userId,
                inventoryType: "in"
            });

            query.bloodGroup = targetBloodGroup;
            query.$or = [
                { address: targetCity },
                { city: targetCity },
                { _id: { $in: loyalDonorsResult } }
            ];
        } else {
            // Fallback for non-donor broadcasts
            if (targetBloodGroup && targetBloodGroup !== "All") {
                query.bloodGroup = targetBloodGroup;
            }
            if (targetCity) {
                query.address = targetCity;
            }
        }

        const users = await userModel.find(query);
        const emails = users.map((user) => user.email).filter(Boolean);

        // 1. Implement Regex Filtering
        const validEmails = emails.filter(email => !/@mock\.com$|@test\.com$|@example\.com$/i.test(email));
        
        // 2. Logging & Transparency
        console.log(`[QUOTA PROTECT] Filtered out ${emails.length - validEmails.length} mock accounts. Proceeding with ${validEmails.length} real donors.`);

        if (validEmails.length === 0) {
            return res.status(404).send({
                success: false,
                message: "No eligible real donors found for this criteria after filtering mock accounts.",
            });
        }

        // 3. Integration: Dispatch emails using Promise.allSettled with validEmails
        const promises = validEmails.map((email) => 
            sendNotification({ toEmail: email, subject, message })
        );

        const results = await Promise.allSettled(promises);
        
        const successCount = results.filter((r) => r.status === "fulfilled").length;
        const failedResults = results.filter((r) => r.status === "rejected");
        const failedCount = failedResults.length;

        // Aggressive Nodemailer Error Logging
        if (failedCount > 0) {
            console.error(`\n🔴 EMAIL DISPATCH FAILURES (${failedCount}):`);
            failedResults.forEach((rejection, index) => {
                const err = rejection.reason;
                const smtpCode = err?.responseCode || err?.code || 'UNKNOWN';
                const smtpResponse = err?.response || err?.message || JSON.stringify(err);
                console.error(`[Error ${index + 1}] SMTP Code: ${smtpCode}, Response: ${smtpResponse}`);
            });
            console.error("--------------------------------------------------\n");
        }

        // Log the manual broadcast
        await notificationModel.create({
            type: "broadcast",
            targetBloodGroup: targetRole === "donor" ? (targetBloodGroup || "All") : "All",
            message: `[${targetRole.toUpperCase()}] ${subject}: ${message}`,
            status: failedCount === 0 ? "success" : (successCount > 0 ? "simulated" : "failed"), // Partial success handled as well
            deliveryChannels: ["email"],
        });

        console.log(`✅ BROADCAST COMPLETE. Success: ${successCount} Failed: ${failedCount}`);

        return res.status(200).json({
            success: true,
            totalFound: validEmails.length,
            successfullySent: successCount,
            failedToSend: failedCount
        });

    } catch (error) {
        console.error("🔥 FATAL CONTROLLER ERROR:", error);
        return res.status(500).json({ 
            success: false, 
            message: "Internal Server Error", 
            error: error.message 
        });
    }
};

module.exports = {
    getNotificationLogsController,
    broadcastAlertController,
    sendManualNotification,
};
