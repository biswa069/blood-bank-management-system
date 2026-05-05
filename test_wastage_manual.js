const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const { initWastageCronJob } = require('./utils/wastagePreventionCron');

async function testCron() {
    console.log("Connecting to DB...");
    await mongoose.connect(process.env.MONGO_URL);
    
    console.log("Triggering Wastage Prevention Logic manually...");
    
    // We can extract the logic from the cron to run immediately, but since node-cron 
    // requires waiting, we'll recreate the exact logic here for the manual test,
    // but we'll set the expiry check to 40 days so it catches your existing DB records!
    
    const axios = require('axios');
    const inventoryModel = require('./models/inventoryModel');
    const userModel = require('./models/userModel');
    const { sendNotification } = require('./services/notificationService');

    try {
        const testDaysFromNow = new Date();
        // Setting to 40 days to catch your existing records (which expire in June)
        testDaysFromNow.setDate(testDaysFromNow.getDate() + 40);

        const expiringStock = await inventoryModel.aggregate([
            {
                $match: {
                    inventoryType: 'in',
                    availableQuantity: { $gt: 0 },
                    expiryDate: { $lte: testDaysFromNow }
                }
            },
            {
                $group: {
                    _id: { organisation: "$organisation", bloodGroup: "$bloodGroup" },
                    totalExpiringUnits: { $sum: "$availableQuantity" }
                }
            }
        ]);

        console.log(`Found ${expiringStock.length} expiring stock groups.`);

        for (const group of expiringStock) {
            const orgId = group._id.organisation;
            const bloodGroup = group._id.bloodGroup;
            const totalExpiringUnits = group.totalExpiringUnits;

            const org = await userModel.findById(orgId);
            if (!org) continue;

            let predictedDemand = 0;

            try {
                const encodedBloodGroup = encodeURIComponent(bloodGroup);
                const aiResponse = await axios.get(`http://127.0.0.1:8000/api/forecast/14-days/${encodedBloodGroup}?org=${orgId}`);
                if (aiResponse.data && aiResponse.data.predictedDemand !== undefined) {
                    predictedDemand = aiResponse.data.predictedDemand;
                } else {
                    throw new Error('Invalid response');
                }
            } catch (error) {
                console.log(`[Test] AI offline or returned 404 for ${bloodGroup}. Using Fallback...`);
                predictedDemand = 0; // Simplified fallback for test
            }

            if (totalExpiringUnits > predictedDemand) {
                const surplusUnits = totalExpiringUnits - predictedDemand;
                console.log(`[Test] ${org.organisationName} has ${surplusUnits} surplus units of ${bloodGroup}.`);

                if (org.city) {
                    const neighboringHospitals = await userModel.find({
                        role: 'hospital',
                        city: { $regex: new RegExp(`^${org.city.trim()}$`, 'i') },
                        _id: { $ne: orgId }
                    });

                    for (const hospital of neighboringHospitals) {
                        console.log(`[Test] Simulating email sent to ${hospital.hospitalName || hospital.email} for ${bloodGroup} surplus.`);
                    }
                }
            }
        }
        console.log("Manual Test Complete.");
    } catch (err) {
        console.error(err);
    }
    process.exit(0);
}

testCron();
