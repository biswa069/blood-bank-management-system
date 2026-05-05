const nodemailer = require("nodemailer");
const userModel = require("../models/userModel");
const notificationModel = require("../models/notificationModel");

// Configure Nodemailer transporter if in LIVE mode
let transporter;
if (process.env.NOTIFICATION_MODE === "LIVE") {
    transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    });
}

/**
 * Filter donors based on the 90-Day Rule and 14-Day Alert Limit
 */
const getEligibleDonors = async (bloodGroup) => {
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

    const fourteenDaysAgo = new Date();
    fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);

    const donors = await userModel.find({
        role: "donor",
        bloodGroup: bloodGroup,
        $and: [
            {
                $or: [
                    { lastDonationDate: null },
                    { lastDonationDate: { $lte: ninetyDaysAgo } },
                ],
            },
            {
                $or: [
                    { lastAlertSentAt: null },
                    { lastAlertSentAt: { $lte: fourteenDaysAgo } },
                ],
            },
        ],
    });

    return donors;
};

/**
 * Send Emergency Alert to eligible donors
 */
const sendUrgentDemandAlert = async (bloodGroup, quantity) => {
    try {
        const donors = await getEligibleDonors(bloodGroup);

        if (donors.length === 0) {
            console.log(`No eligible donors found for blood group ${bloodGroup}.`);
            return;
        }

        const emails = donors.map((donor) => donor.email).filter(Boolean);
        const message = `URGENT: Your blood group ${bloodGroup} is in critical demand! We urgently need donations. Please visit the nearest hospital or blood bank to donate.`;

        let status = "simulated";

        if (process.env.NOTIFICATION_MODE === "LIVE" && emails.length > 0) {
            const mailOptions = {
                from: process.env.EMAIL_USER,
                to: emails, // Can send as BCC for privacy in production
                subject: "Urgent Blood Requirement Alert",
                text: message,
            };

            await transporter.sendMail(mailOptions);
            status = "success";
        } else {
            console.log(`[SIMULATION MODE] URGENT ALERT to ${emails.length} donors: ${message}`);
        }

        // Log Notification
        await notificationModel.create({
            type: "urgent",
            targetBloodGroup: bloodGroup,
            message: message,
            status: status,
            deliveryChannels: ["email"],
        });

        // Update lastAlertSentAt for these donors
        const donorIds = donors.map(d => d._id);
        await userModel.updateMany(
            { _id: { $in: donorIds } },
            { $set: { lastAlertSentAt: new Date() } }
        );

    } catch (error) {
        console.error("Error sending urgent demand alert:", error);
        await notificationModel.create({
            type: "urgent",
            targetBloodGroup: bloodGroup,
            message: `Failed to send alert: ${error.message}`,
            status: "failed",
            deliveryChannels: ["email"],
        });
    }
};

/**
 * Send Wastage Warning to Hospitals and Organisations
 */
const sendWastageWarning = async (expiringUnits) => {
    try {
        if (!expiringUnits || expiringUnits.length === 0) return;

        const adminsAndHospitals = await userModel.find({
            role: { $in: ["organisation", "hospital"] },
        });

        const emails = adminsAndHospitals.map(user => user.email).filter(Boolean);

        const summary = expiringUnits.map(unit => `${unit.totalExpiring} units of ${unit._id}`).join(", ");
        const message = `WASTAGE WARNING: The following blood units are expiring within 5 days: ${summary}. Please prioritize these for immediate use.`;

        let status = "simulated";

        if (process.env.NOTIFICATION_MODE === "LIVE" && emails.length > 0) {
            const mailOptions = {
                from: process.env.EMAIL_USER,
                to: emails,
                subject: "Blood Wastage Warning Alert",
                text: message,
            };

            await transporter.sendMail(mailOptions);
            status = "success";
        } else {
            console.log(`[SIMULATION MODE] WASTAGE WARNING to ${emails.length} organisations/hospitals: ${message}`);
        }

        // Log Notification
        await notificationModel.create({
            type: "wastage",
            targetBloodGroup: "All",
            message: message,
            status: status,
            deliveryChannels: ["email"],
        });

    } catch (error) {
        console.error("Error sending wastage warning:", error);
        await notificationModel.create({
            type: "wastage",
            targetBloodGroup: "All",
            message: `Failed to send wastage warning: ${error.message}`,
            status: "failed",
            deliveryChannels: ["email"],
        });
    }
};

/**
 * Generic email sender for Manual Broadcasts
 */
const sendNotification = async ({ toEmail, subject, message }) => {
    // Smart Mock Detection: Skip SMTP for obvious fake/test emails
    const mockDomains = ["mock.com", "test.com", "fake.com", "example.com", "placeholder.com"];
    const isMockEmail = mockDomains.some(domain => toEmail?.toLowerCase().endsWith(`@${domain}`));

    return new Promise(async (resolve, reject) => {
        try {
            if (isMockEmail) {
                // Auto-simulate mock emails — don't waste Gmail quota
                console.log(`[MOCK SKIPPED] ${toEmail} — simulated (fake domain detected)`);
                resolve({ success: true, email: toEmail, simulated: true });
            } else if (process.env.NOTIFICATION_MODE === "LIVE" && toEmail) {
                // Option 2: Conditional Recipient Logic for Safe Mode
                const isProduction = process.env.NODE_ENV === 'production';
                const recipientEmail = isProduction ? toEmail : process.env.SAFE_TEST_EMAIL;
                const finalSubject = isProduction ? subject : '[DEV TEST] ' + subject;

                if (!isProduction) {
                    // Visual Indicator in Logs
                    console.log(`[DEV MODE] Redirecting email for ${toEmail} to safe address: ${recipientEmail}`);
                }

                const mailOptions = {
                    from: process.env.EMAIL_USER,
                    to: recipientEmail,
                    subject: finalSubject,
                    text: message,
                };
                await transporter.sendMail(mailOptions);
                console.log(`[EMAIL SENT] ${recipientEmail} — delivered via SMTP`);
                resolve({ success: true, email: toEmail, simulated: false });
            } else {
                console.log(`[SIMULATION MODE] To: ${toEmail} | Subject: ${subject}`);
                resolve({ success: true, email: toEmail, simulated: true });
            }
        } catch (error) {
            console.error(`Error sending email to ${toEmail}:`, error);
            reject({ success: false, email: toEmail, error: error.message });
        }
    });
};

module.exports = {
    getEligibleDonors,
    sendUrgentDemandAlert,
    sendWastageWarning,
    sendNotification,
};
