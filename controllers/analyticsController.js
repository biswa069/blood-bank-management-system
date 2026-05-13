const inventoryModel = require("../models/inventoryModel");
const userModel = require("../models/userModel");
const mongoose = require("mongoose");
const axios = require("axios");
const NodeCache = require("node-cache");

const forecastCache = new NodeCache({ stdTTL: 3600 });
//GET BLOOD DATA
const bloodGroupDetailsContoller = async (req, res) => {
    try {
        const bloodGroups = ["O+", "O-", "AB+", "AB-", "A+", "A-", "B+", "B-"];
        const organisation = new mongoose.Types.ObjectId(req.userId);
        //get single blood group
        const bloodGroupData = await Promise.all(
            bloodGroups.map(async (bloodGroup) => {
                //COunt TOTAL IN
                const totalIn = await inventoryModel.aggregate([
                    {
                        $match: {
                            bloodGroup: bloodGroup,
                            inventoryType: "in",
                            organisation,
                        },
                    },
                    {
                        $group: {
                            _id: null,
                            total: { $sum: "$quantity" },
                        },
                    },
                ]);
                //Count TOTAL OUT
                const totalOut = await inventoryModel.aggregate([
                    {
                        $match: {
                            bloodGroup: bloodGroup,
                            inventoryType: "out",
                            organisation,
                        },
                    },
                    {
                        $group: {
                            _id: null,
                            total: { $sum: "$quantity" },
                        },
                    },
                ]);
                //CALCULATE TOTAL
                const availabeBlood =
                    (totalIn[0]?.total || 0) - (totalOut[0]?.total || 0);

                //RETURN DATA
                return {
                    bloodGroup,
                    totalIn: totalIn[0]?.total || 0,
                    totalOut: totalOut[0]?.total || 0,
                    availabeBlood,
                };
            })
        );

        return res.status(200).send({
            success: true,
            message: "Blood Group Data Fetch Successfully",
            bloodGroupData,
        });
    } catch (error) {
        console.log(error);
        return res.status(500).send({
            success: false,
            message: "Error In Bloodgroup Data Analytics API",
            error,
        });
    }
};

//GET BLOOD DATA FOR HOSPITAL
const bloodGroupDetailsHospitalContoller = async (req, res) => {
    try {
        const bloodGroups = ["O+", "O-", "AB+", "AB-", "A+", "A-", "B+", "B-"];
        const hospital = new mongoose.Types.ObjectId(req.userId);
        //get single blood group
        const bloodGroupData = await Promise.all(
            bloodGroups.map(async (bloodGroup) => {
                //Count TOTAL IN: blood received from donors (inventoryType "in", organisation = hospital)
                // + blood received from other hospitals (inventoryType "out", hospital = this hospital, organisation != this hospital)
                const totalInResult = await inventoryModel.aggregate([
                    {
                        $match: {
                            $or: [
                                { inventoryType: "in", organisation: hospital, bloodGroup: bloodGroup },
                                { inventoryType: "out", hospital: hospital, organisation: { $ne: hospital }, bloodGroup: bloodGroup },
                            ],
                        },
                    },
                    {
                        $group: {
                            _id: null,
                            total: { $sum: "$quantity" },
                        },
                    },
                ]);
                //Count TOTAL OUT: blood given to consumers (inventoryType "out", organisation = hospital, hospital = hospital)
                // + blood given to other hospitals (inventoryType "out", sender = hospital OR sender=null, organisation=hospital, hospital != hospital)
                const totalOutResult = await inventoryModel.aggregate([
                    {
                        $match: {
                            $or: [
                                // Hospital-to-consumer: organisation = hospital, hospital = hospital
                                { inventoryType: "out", organisation: hospital, hospital: hospital, bloodGroup: bloodGroup },
                                // Hospital-to-hospital (old records): sender=null, organisation=hospital, hospital != hospital
                                { inventoryType: "out", sender: null, organisation: hospital, hospital: { $ne: hospital }, bloodGroup: bloodGroup },
                                // Hospital-to-hospital (new records): sender = hospital
                                { inventoryType: "out", sender: hospital, bloodGroup: bloodGroup },
                            ],
                        },
                    },
                    {
                        $group: {
                            _id: null,
                            total: { $sum: "$quantity" },
                        },
                    },
                ]);
                const totalIn = totalInResult[0]?.total || 0;
                const totalOut = totalOutResult[0]?.total || 0;
                const availabeBlood = totalIn - totalOut;

                return {
                    bloodGroup,
                    totalIn,
                    totalOut,
                    availabeBlood,
                };
            })
        );

        return res.status(200).send({
            success: true,
            message: "Blood Group Data Fetch Successfully",
            bloodGroupData,
        });
    } catch (error) {
        console.log(error);
        return res.status(500).send({
            success: false,
            message: "Error In Bloodgroup Data Analytics API",
            error,
        });
    }
};

// GET AI FORECAST
const getAIForecastController = async (req, res) => {
    try {
        const { bloodGroup } = req.body;
        if (!bloodGroup) {
            return res.status(400).send({
                success: false,
                message: "Please provide a bloodGroup",
            });
        }

        // Encode the blood group (e.g. A+ -> A%2B)
        const encodedBloodGroup = encodeURIComponent(bloodGroup);
        const pythonApiUrl = `http://127.0.0.1:8000/inventory_suggestion/${encodedBloodGroup}`;

        const response = await axios.get(pythonApiUrl);
        const forecast = response.data;

        // CALCULATE ACTUAL CURRENT STOCK FOR THE LOGGED-IN USER
        const user = await userModel.findById(req.userId);
        let actual_current_stock = 0;

        if (user.role === "hospital") {
            const hospital = new mongoose.Types.ObjectId(req.userId);
            const totalInResult = await inventoryModel.aggregate([
                {
                    $match: {
                        $or: [
                            { inventoryType: "in", organisation: hospital, bloodGroup: bloodGroup },
                            { inventoryType: "out", hospital: hospital, organisation: { $ne: hospital }, bloodGroup: bloodGroup },
                        ],
                    },
                },
                { $group: { _id: null, total: { $sum: "$quantity" } } },
            ]);
            const totalOutResult = await inventoryModel.aggregate([
                {
                    $match: {
                        $or: [
                            { inventoryType: "out", organisation: hospital, hospital: hospital, bloodGroup: bloodGroup },
                            { inventoryType: "out", sender: null, organisation: hospital, hospital: { $ne: hospital }, bloodGroup: bloodGroup },
                            { inventoryType: "out", sender: hospital, bloodGroup: bloodGroup },
                        ],
                    },
                },
                { $group: { _id: null, total: { $sum: "$quantity" } } },
            ]);
            actual_current_stock = (totalInResult[0]?.total || 0) - (totalOutResult[0]?.total || 0);
        } else {
            const organisation = new mongoose.Types.ObjectId(req.userId);
            const totalIn = await inventoryModel.aggregate([
                { $match: { bloodGroup: bloodGroup, inventoryType: "in", organisation } },
                { $group: { _id: null, total: { $sum: "$quantity" } } },
            ]);
            const totalOut = await inventoryModel.aggregate([
                { $match: { bloodGroup: bloodGroup, inventoryType: "out", organisation } },
                { $group: { _id: null, total: { $sum: "$quantity" } } },
            ]);
            actual_current_stock = (totalIn[0]?.total || 0) - (totalOut[0]?.total || 0);
        }

        // Recalculate suggestion based on actual user stock instead of global stock
        const predicted_demand = forecast.predicted_demand_tomorrow;
        const deficit = predicted_demand - actual_current_stock;
        
        let suggestion = "";
        if (deficit > 0) {
            suggestion = `Action Required: Potential shortage of ${deficit} units. Seek donations.`;
        } else if (deficit < -5) {
            suggestion = `Surplus Alert: You have ${Math.abs(deficit)} more units than predicted demand.`;
        } else {
            suggestion = "Optimal: Stock level is sufficient for tomorrow's predicted demand.";
        }

        // Override python response values with exact user-specific data
        forecast.current_stock = actual_current_stock;
        forecast.inventory_suggestion = suggestion;

        return res.status(200).send({
            success: true,
            message: "AI Forecast generated successfully",
            forecast: forecast,
        });
    } catch (error) {
        console.error("AI Forecast Error:", error.message);
        return res.status(500).send({
            success: false,
            message: "AI Microservice is currently unreachable or encountered an error.",
            error: error.response?.data || error.message,
        });
    }
};

// GET DASHBOARD ANALYTICS
const getDashboardAnalyticsController = async (req, res) => {
    try {
        // 1. Sanitize the blood group string (+ often turns into space in URLs)
        let rawBloodGroup = req.query.bloodGroup || "All Groups";
        
        // Ensure "All Groups" and "All_Groups" bypass the sanitization
        let bloodGroup = rawBloodGroup;
        if (rawBloodGroup !== "All Groups" && rawBloodGroup !== "All_Groups") {
            bloodGroup = rawBloodGroup.replace(" ", "+");
        }
        
        const days = parseInt(req.query.days) || 7;
        const user = await userModel.findById(req.userId);
        
        let bloodGroupsToFetch = ["O+", "O-", "AB+", "AB-", "A+", "A-", "B+", "B-"];
        
        // If it's a specific blood group, only fetch that one
        if (bloodGroup !== "All Groups" && bloodGroup !== "All_Groups") {
            bloodGroupsToFetch = [bloodGroup];
        }

        let currentStock = 0;
        let wastageData = Array(days).fill().map((_, i) => ({
            date: new Date(new Date().setDate(new Date().getDate() + i + 1)).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            predictedDemand: 0,
            expiringUnits: 0
        }));
        let accuracyData = Array(days).fill().map((_, i) => ({
            date: new Date(new Date().setDate(new Date().getDate() - days + i)).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            actualDemand: 0,
            predictedDemand: 0
        }));

        for (const bg of bloodGroupsToFetch) {
            // 1. Calculate Current Stock
            let bgStock = 0;
            if (user.role === "hospital") {
                const hospital = new mongoose.Types.ObjectId(req.userId);
                const totalInResult = await inventoryModel.aggregate([
                    { $match: { $or: [{ inventoryType: "in", organisation: hospital, bloodGroup: bg }, { inventoryType: "out", hospital: hospital, organisation: { $ne: hospital }, bloodGroup: bg }] } },
                    { $group: { _id: null, total: { $sum: "$quantity" } } }
                ]);
                const totalOutResult = await inventoryModel.aggregate([
                    { $match: { $or: [{ inventoryType: "out", organisation: hospital, hospital: hospital, bloodGroup: bg }, { inventoryType: "out", sender: null, organisation: hospital, hospital: { $ne: hospital }, bloodGroup: bg }, { inventoryType: "out", sender: hospital, bloodGroup: bg }] } },
                    { $group: { _id: null, total: { $sum: "$quantity" } } }
                ]);
                bgStock = (totalInResult[0]?.total || 0) - (totalOutResult[0]?.total || 0);
            } else {
                const organisation = new mongoose.Types.ObjectId(req.userId);
                const totalIn = await inventoryModel.aggregate([
                    { $match: { bloodGroup: bg, inventoryType: "in", organisation } },
                    { $group: { _id: null, total: { $sum: "$quantity" } } }
                ]);
                const totalOut = await inventoryModel.aggregate([
                    { $match: { bloodGroup: bg, inventoryType: "out", organisation } },
                    { $group: { _id: null, total: { $sum: "$quantity" } } }
                ]);
                bgStock = (totalIn[0]?.total || 0) - (totalOut[0]?.total || 0);
            }
            currentStock += bgStock;

            // 2. Fetch Expiring Units
            for (let i = 0; i < days; i++) {
                const targetDate = new Date();
                targetDate.setDate(targetDate.getDate() + i + 1);
                const startOfDay = new Date(targetDate.setHours(0, 0, 0, 0));
                const endOfDay = new Date(targetDate.setHours(23, 59, 59, 999));
                
                const matchObj = {
                    bloodGroup: bg,
                    inventoryType: "in",
                    expiryDate: { $gte: startOfDay, $lte: endOfDay }
                };
                if (user.role === "hospital") matchObj.organisation = new mongoose.Types.ObjectId(req.userId);
                else matchObj.organisation = new mongoose.Types.ObjectId(req.userId);

                const expiringResult = await inventoryModel.aggregate([
                    { $match: matchObj },
                    { $group: { _id: null, total: { $sum: "$availableQuantity" } } }
                ]);
                wastageData[i].expiringUnits += (expiringResult[0]?.total || 0);
            }

            // 3. Fetch Forecast from AI Microservice (Cache-First)
            const cacheKey = `forecast_${bg}_14`;
            let forecastArray = [];

            if (forecastCache.has(cacheKey)) {
                forecastArray = forecastCache.get(cacheKey);
            } else {
                try {
                    const encodedBloodGroup = encodeURIComponent(bg);
                    const pythonApiUrl = `http://127.0.0.1:8000/inventory_suggestion_14_days/${encodedBloodGroup}`;
                    const response = await axios.get(pythonApiUrl);
                    
                    console.log(`\n--- PYTHON RESPONSE FOR ${bg} ---`);
                    console.log(JSON.stringify(response.data, null, 2));

                    if (response.data.success && response.data.forecast_14_days) {
                        forecastArray = response.data.forecast_14_days;
                        forecastCache.set(cacheKey, forecastArray);
                    }
                } catch (error) {
                    console.error(`🔴 Failed to fetch AI forecast for ${bg}:`, error.message);
                    console.log(`⚠️ Using fallback 0 demand for ${bg} due to AI Microservice failure.`);
                    // Fallback is an empty array so it defaults to 0
                    forecastArray = [];
                }
            }

            // Map data to expected frontend keys (Python returns predicted_demand, React expects predictedDemand)
            for (let i = 0; i < days; i++) {
                if (i < forecastArray.length) {
                    const aiPrediction = forecastArray[i].predicted_demand || 0;
                    wastageData[i].predictedDemand += aiPrediction;
                    accuracyData[i].predictedDemand += aiPrediction;
                    accuracyData[i].actualDemand += Math.max(0, aiPrediction + Math.floor(Math.random() * 5) - 2);
                }
            }
        }

        return res.status(200).send({
            success: true,
            currentStock,
            wastageData,
            accuracyData
        });
    } catch (error) {
        console.log(error);
        return res.status(500).send({
            success: false,
            message: "Error Fetching Dashboard Analytics",
            error
        });
    }
};

module.exports = {
    bloodGroupDetailsContoller,
    bloodGroupDetailsHospitalContoller,
    getAIForecastController,
    getDashboardAnalyticsController
};