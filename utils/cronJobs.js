const cron = require('node-cron');
const axios = require('axios');
const inventoryModel = require('../models/inventoryModel');
const userModel = require('../models/userModel');
const { sendNotification } = require('../services/notificationService');

const DEFAULT_MINIMUM_STOCK_THRESHOLD = 10;

// Schedule: Set it to run daily at 8:00 AM (0 8 * * *). 
// (Note: Add a comment with * * * * * so I can easily swap it for testing).
const initCronJobs = () => {
    // 0 8 * * * - Runs every day at 8:00 AM
    // * * * * * - Runs every minute (for testing)
    cron.schedule('0 8 * * *', async () => {
        console.log('Running Low Stock Alert cron job with AI Dynamic Thresholds...');
        try {
            // 1. Fetch AI Predicted Demand
            let predictedDemand = {};
            try {
                const aiResponse = await axios.get('http://localhost:8000/api/predict-demand');
                if (aiResponse.data) {
                    predictedDemand = aiResponse.data;
                    console.log('Successfully fetched AI predicted demand:', predictedDemand);
                }
            } catch (aiError) {
                console.warn(`AI Microservice offline or failed. Falling back to default threshold of ${DEFAULT_MINIMUM_STOCK_THRESHOLD}. Error:`, aiError.message);
            }

            // 2. Aggregation pipeline to calculate available stock (Total IN - Total OUT)
            // grouped by bloodGroup and organisation.
            const stockLevels = await inventoryModel.aggregate([
                {
                    $group: {
                        _id: {
                            organisation: "$organisation",
                            bloodGroup: "$bloodGroup"
                        },
                        totalIn: {
                            $sum: {
                                $cond: [{ $eq: ["$inventoryType", "in"] }, "$quantity", 0]
                            }
                        },
                        totalOut: {
                            $sum: {
                                $cond: [{ $eq: ["$inventoryType", "out"] }, "$quantity", 0]
                            }
                        }
                    }
                },
                {
                    $project: {
                        _id: 0,
                        organisation: "$_id.organisation",
                        bloodGroup: "$_id.bloodGroup",
                        availableStock: { $subtract: ["$totalIn", "$totalOut"] }
                    }
                }
                // Note: Filter stage ($match) is removed from DB aggregation as filtering uses dynamic thresholds per blood type now.
            ]);

            let alertCount = 0;

            for (const stock of stockLevels) {
                // Determine threshold: use AI prediction if available, else fallback to 10
                const threshold = predictedDemand[stock.bloodGroup] !== undefined 
                                  ? predictedDemand[stock.bloodGroup] 
                                  : DEFAULT_MINIMUM_STOCK_THRESHOLD;

                // Smart Comparison: Only alert if stock is greater than 0 but below the threshold
                if (stock.availableStock > 0 && stock.availableStock < threshold) {
                    // Find the organisation admin details
                    const orgAdmin = await userModel.findById(stock.organisation);
                    if (orgAdmin && orgAdmin.email) {
                        const predictedMsg = predictedDemand[stock.bloodGroup] !== undefined 
                            ? `Our AI forecasting model predicts a demand of ${threshold} units for this blood type over the next 7 days.` 
                            : `The minimum required safe threshold is ${threshold} units.`;

                        const subject = `LOW STOCK ALERT: ${stock.bloodGroup}`;
                        const message = `Hello ${orgAdmin.organisationName},\n\nYour current stock of ${stock.bloodGroup} is ${stock.availableStock} units. ${predictedMsg} Please arrange a donation drive immediately.\n\nThank you,\nBlood Bank Management System`;

                        await sendNotification({
                            toEmail: orgAdmin.email,
                            subject: subject,
                            message: message
                        });
                        alertCount++;
                    }
                }
            }
            console.log(`Low Stock Alert completed. Checked and notified for ${alertCount} low stock items.`);
        } catch (error) {
            console.error('Error in Low Stock Alert cron job:', error);
        }
    });
};

module.exports = { initCronJobs };
