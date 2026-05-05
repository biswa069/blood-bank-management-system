const cron = require('node-cron');
const axios = require('axios');
const mongoose = require('mongoose');
const inventoryModel = require('../models/inventoryModel');
const userModel = require('../models/userModel');
const { sendNotification } = require('../services/notificationService');

const initWastageCronJob = () => {
    // 0 2 * * * - Runs every day at 2:00 AM
    // * * * * * - Runs every minute (for testing)
    cron.schedule('0 2 * * *', async () => {
        console.log('Running Predictive Wastage Prevention cron job...');
        try {
            const fourteenDaysFromNow = new Date();
            fourteenDaysFromNow.setDate(fourteenDaysFromNow.getDate() + 14);

            // Step 1: Find Expiring Stock
            // Find all "in" inventory records where expiryDate is within 14 days and we still have stock
            const expiringStock = await inventoryModel.aggregate([
                {
                    $match: {
                        inventoryType: 'in',
                        availableQuantity: { $gt: 0 },
                        expiryDate: { $lte: fourteenDaysFromNow }
                    }
                },
                {
                    $group: {
                        _id: {
                            organisation: "$organisation",
                            bloodGroup: "$bloodGroup"
                        },
                        totalExpiringUnits: { $sum: "$availableQuantity" }
                    }
                }
            ]);

            for (const group of expiringStock) {
                const orgId = group._id.organisation;
                const bloodGroup = group._id.bloodGroup;
                const totalExpiringUnits = group.totalExpiringUnits;

                const org = await userModel.findById(orgId);
                if (!org) continue;

                let predictedDemand = 0;

                // Step 2: Fetch AI Forecast
                try {
                    const encodedBloodGroup = encodeURIComponent(bloodGroup);
                    // Hit the python microservice. The URL structure handles future enhancements.
                    const aiResponse = await axios.get(`http://127.0.0.1:8000/api/forecast/14-days/${encodedBloodGroup}?org=${orgId}`);
                    
                    if (aiResponse.data && aiResponse.data.predictedDemand !== undefined) {
                        predictedDemand = aiResponse.data.predictedDemand;
                        console.log(`[AI Forecast] ${org.organisationName} - ${bloodGroup}: ${predictedDemand} units expected in 14 days.`);
                    } else {
                        throw new Error('Invalid response format from AI');
                    }
                } catch (error) {
                    console.warn(`[Fallback] AI microservice failed for ${bloodGroup}. Using 14-day mathematical average. Error: ${error.message}`);
                    
                    // Fallback: Mathematical average of 'out' transactions over the past 14 days
                    const past14Days = new Date();
                    past14Days.setDate(past14Days.getDate() - 14);

                    const pastUsage = await inventoryModel.aggregate([
                        {
                            $match: {
                                organisation: new mongoose.Types.ObjectId(orgId),
                                bloodGroup: bloodGroup,
                                inventoryType: 'out',
                                createdAt: { $gte: past14Days }
                            }
                        },
                        {
                            $group: {
                                _id: null,
                                totalOut: { $sum: "$quantity" }
                            }
                        }
                    ]);

                    predictedDemand = pastUsage.length > 0 ? pastUsage[0].totalOut : 0;
                    console.log(`[Fallback] ${org.organisationName} - ${bloodGroup}: Mathematical 14-day historical usage is ${predictedDemand} units.`);
                }

                // Step 3: The Smart Comparison & Routing Engine
                if (totalExpiringUnits > predictedDemand) {
                    const surplusUnits = totalExpiringUnits - predictedDemand;
                    console.log(`[Surplus Detected] ${org.organisationName} has ${surplusUnits} surplus units of ${bloodGroup} expiring soon.`);

                    if (org.city) {
                        // Decentralized Routing: Find neighboring hospitals in the exact same city
                        const neighboringHospitals = await userModel.find({
                            role: 'hospital',
                            city: { $regex: new RegExp(`^${org.city.trim()}$`, 'i') }, // Case-insensitive exact match
                            _id: { $ne: orgId } // Prevent alerting themselves if role is weird
                        });

                        // Step 4: Dispatch alerts
                        for (const hospital of neighboringHospitals) {
                            if (hospital.email) {
                                const subject = `URGENT Surplus Available: ${surplusUnits} units of ${bloodGroup} expiring soon`;
                                const message = `Hello ${hospital.hospitalName || 'Hospital Admin'},\n\n${org.organisationName || 'An organisation'} in your city has a projected surplus of ${surplusUnits} units of ${bloodGroup} that will expire within 14 days. If you are experiencing a shortage, please contact them immediately at ${org.phone || 'their registered number'} to arrange an inter-hospital transfer.\n\nThank you,\nBlood Bank Management System`;

                                await sendNotification({
                                    toEmail: hospital.email,
                                    subject: subject,
                                    message: message
                                });
                                console.log(`[Routing] Alert sent to ${hospital.hospitalName} (${hospital.email}) regarding ${org.organisationName}'s surplus.`);
                            }
                        }
                    } else {
                         console.log(`[Routing skipped] ${org.organisationName} has no city configured.`);
                    }
                }
            }
            console.log('Predictive Wastage Prevention cron job completed.');
        } catch (error) {
            console.error('Error in Predictive Wastage Prevention cron job:', error);
        }
    });
};

module.exports = { initWastageCronJob };
