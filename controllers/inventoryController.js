// const mongoose = require("mongoose");
// const inventoryModel = require("../models/inventoryModel");
// const userModel = require("../models/userModel");

// // CREATE INVENTORY
// const createInventoryController = async (req, res) => {
//     try {
//         const { email } = req.body;
//         //validation
//         const user = await userModel.findOne({ email });
//         if (!user) {
//             throw new Error("User Not Found");
//         }
//         // if (inventoryType === "in" && user.role !== "donor") {
//         //     throw new Error("Not a donor account");
//         // }
//         // if (inventoryType === "out" && user.role !== "hospital") {
//         //     throw new Error("Not a hospital");
//         // }

//         if (req.body.inventoryType == "out") {
//             const requestedBloodGroup = req.body.bloodGroup;
//             const requestedQuantityOfBlood = req.body.quantity;
//             const organisation = new mongoose.Types.ObjectId(req.body.organisation);
//             //calculate Blood Quanitity
//             const totalInOfRequestedBlood = await inventoryModel.aggregate([
//                 {
//                     $match: {
//                         organisation,
//                         inventoryType: "in",
//                         bloodGroup: requestedBloodGroup,
//                     },
//                 },
//                 {
//                     $group: {
//                         _id: "$bloodGroup",
//                         total: { $sum: "$quantity" },
//                     },
//                 },
//             ]);
//             // console.log("Total In", totalInOfRequestedBlood);
//             const totalIn = totalInOfRequestedBlood[0]?.total || 0;
//             //calculate OUT Blood Quanitity

//             const totalOutOfRequestedBloodGroup = await inventoryModel.aggregate([
//                 {
//                     $match: {
//                         organisation,
//                         inventoryType: "out",
//                         bloodGroup: requestedBloodGroup,
//                     },
//                 },
//                 {
//                     $group: {
//                         _id: "$bloodGroup",
//                         total: { $sum: "$quantity" },
//                     },
//                 },
//             ]);
//             const totalOut = totalOutOfRequestedBloodGroup[0]?.total || 0;

//             //in & Out Calc
//             const availableQuanityOfBloodGroup = totalIn - totalOut;
//             //quantity validation
//             if (availableQuanityOfBloodGroup < requestedQuantityOfBlood) {
//                 return res.status(500).send({
//                     success: false,
//                     message: `Only ${availableQuanityOfBloodGroup}ML of ${requestedBloodGroup.toUpperCase()} is available`,
//                 });
//             }
//             req.body.hospital = user?._id;
//         }
//         else {
//             req.body.donor = user?._id;
//         }

//         //save record
//         const inventory = new inventoryModel(req.body);
//         await inventory.save();
//         return res.status(201).send({
//             success: true,
//             message: "New Blood Record Added",
//         });
//     } catch (error) {
//         console.log(error);
//         return res.status(500).send({
//             success: false,
//             message: "Error In Create Inventory API",
//             error,
//         });
//     }
// };

// // GET ALL BLOOD RECORDS
// const getInventoryController = async (req, res) => {
//     try {
//         const inventory = await inventoryModel
//             .find({
//                 organisation: req.userId,
//             })
//             .populate("donor")
//             .populate("hospital")
//             .sort({ createdAt: -1 });;
//         return res.status(200).send({
//             success: true,
//             messaage: "get all records successfully",
//             inventory,
//         });
//     } catch (error) {
//         console.log(error);
//         return res.status(500).send({
//             success: false,
//             message: "Error In Get All Inventory",
//             error,
//         });
//     }
// };

// // GET Hospital BLOOD RECORDS
// const getInventoryHospitalController = async (req, res) => {
//     try {
//         const inventory = await inventoryModel
//             .find(req.body.filters)
//             .populate("donor")
//             .populate("hospital")
//             .populate("organisation")
//             .sort({ createdAt: -1 });
//         return res.status(200).send({
//             success: true,
//             messaage: "get hospital comsumer records successfully",
//             inventory,
//         });
//     } catch (error) {
//         console.log(error);
//         return res.status(500).send({
//             success: false,
//             message: "Error In Get consumer Inventory",
//             error,
//         });
//     }
// };

// // GET DONOR RECORDS
// const getDonorsController = async (req, res) => {
//     try {
//         const organisation = req.userId;
//         //find donars
//         const donorId = await inventoryModel.distinct("donor", {
//             organisation,
//         });
//         // console.log(donorId);
//         const donors = await userModel.find({ _id: { $in: donorId } });

//         return res.status(200).send({
//             success: true,
//             message: "Donor Record Fetched Successfully",
//             donors,
//         });
//     } catch (error) {
//         console.log(error);
//         return res.status(500).send({
//             success: false,
//             message: "Error in Donor records",
//             error,
//         });
//     }
// };

// const getHospitalController = async (req, res) => {
//     try {
//         const organisation = req.userId;
//         //GET HOSPITAL ID
//         const hospitalId = await inventoryModel.distinct("hospital", {
//             organisation,
//         });
//         //FIND HOSPITAL
//         const hospitals = await userModel.find({
//             _id: { $in: hospitalId },
//         });
//         return res.status(200).send({
//             success: true,
//             message: "Hospitals Data Fetched Successfully",
//             hospitals,
//         });
//     } catch (error) {
//         console.log(error);
//         return res.status(500).send({
//             success: false,
//             message: "Error In get Hospital API",
//             error,
//         });
//     }
// };

// const getOrganisationController = async (req, res) => {
//     try {
//         const donor = req.userId;
//         const orgId = await inventoryModel.distinct("organisation", { donor });
//         //find org
//         const organisations = await userModel.find({
//             _id: { $in: orgId },
//         });
//         return res.status(200).send({
//             success: true,
//             message: "Org Data Fetched Successfully",
//             organisations,
//         });
//     } catch (error) {
//         console.log(error);
//         return res.status(500).send({
//             success: false,
//             message: "Error In ORG API",
//             error,
//         });
//     }
// };

// const getOrganisationForHospitalController = async (req, res) => {
//     try {
//         const hospital = req.userId;
//         const orgId = await inventoryModel.distinct("organisation", { hospital });
//         //find org
//         const organisations = await userModel.find({
//             _id: { $in: orgId },
//         });
//         return res.status(200).send({
//             success: true,
//             message: "Hospital Org Data Fetched Successfully",
//             organisations,
//         });
//     } catch (error) {
//         console.log(error);
//         return res.status(500).send({
//             success: false,
//             message: "Error In Hospital ORG API",
//             error,
//         });
//     }
// };

// const getRecentInventoryController = async (req, res) => {
//     try {
//         const inventory = await inventoryModel
//             .find({
//                 organisation: req.userId,
//             })
//             .limit(3)
//             .sort({ createdAt: -1 });
//         return res.status(200).send({
//             success: true,
//             message: "recent Invenotry Data",
//             inventory,
//         });
//     } catch (error) {
//         console.log(error);
//         return res.status(500).send({
//             success: false,
//             message: "Error In Recent Inventory API",
//             error,
//         });
//     }
// };

// module.exports = {
//     createInventoryController,
//     getInventoryController,
//     getDonorsController,
//     getHospitalController,
//     getOrganisationController,
//     getOrganisationForHospitalController,
//     getInventoryHospitalController,
//     getRecentInventoryController
// };

const mongoose = require("mongoose");
const inventoryModel = require("../models/inventoryModel");
const userModel = require("../models/userModel");
const csv = require("csv-parser");
const { Readable } = require("stream");

const { sendNotification } = require("../services/notificationService");

const createInventoryController = async (req, res) => {
    try {
        const { email, inventoryType } = req.body;
        
        // 1. Validation - Return specific error instead of throwing to catch block
        const user = await userModel.findOne({ email });
        if (!user) {
            return res.status(404).send({
                success: false,
                message: "User not found. Please check the email address.",
            });
        }
        // Blood group validation for inventory "in" (donation)
        if (inventoryType === "in") {
            // --- NEW SECURITY RULE ---
            // A human can only donate 1 unit at a time.
            req.body.quantity = 1;
            req.body.donor = user?._id;

            const requestedBloodGroup = req.body.bloodGroup;
            const donorBloodGroup = user.bloodGroup;

            if (!donorBloodGroup) {
                throw new Error("Donor blood group not found. Please contact support.");
            }
            if (donorBloodGroup !== requestedBloodGroup) {
                return res.status(400).send({
                    success: false,
                    message: `Blood group mismatch. Donor ${user.name} has blood group ${donorBloodGroup}, but you selected ${requestedBloodGroup}. Please correct the blood group and try again.`,
                });
            }
        }

        if (inventoryType == "out") {
            req.body.hospital = user?._id;

            // Determine sender role and validate quantity accordingly
            const sender = await userModel.findById(req.userId);
            const requestedBloodGroup = req.body.bloodGroup;
            const requestedQuantityOfBlood = req.body.quantity;
            if (sender?.role === "organisation") {
                // --- STRICT VALIDATION (Total IN - Total OUT) ---
                const organisation = new mongoose.Types.ObjectId(req.body.organisation);
                
                const totalInAgg = await inventoryModel.aggregate([
                    { $match: { organisation, inventoryType: "in", bloodGroup: requestedBloodGroup } },
                    { $group: { _id: null, total: { $sum: "$quantity" } } }
                ]);
                const totalOutAgg = await inventoryModel.aggregate([
                    { $match: { organisation, inventoryType: "out", bloodGroup: requestedBloodGroup } },
                    { $group: { _id: null, total: { $sum: "$quantity" } } }
                ]);
                
                const exactCurrentStock = (totalInAgg[0]?.total || 0) - (totalOutAgg[0]?.total || 0);

                if (exactCurrentStock < requestedQuantityOfBlood) {
                    return res.status(400).send({
                        success: false,
                        message: `Insufficient stock! You only have ${exactCurrentStock} units of ${requestedBloodGroup.toUpperCase()} available. Cannot fulfill request for ${requestedQuantityOfBlood} units.`,
                    });
                }
                
                // --- FEFO LOGIC ---
                const availableBags = await inventoryModel.find({
                    organisation,
                    inventoryType: "in",
                    bloodGroup: requestedBloodGroup,
                    availableQuantity: { $gt: 0 },
                    expiryDate: { $gt: new Date() }
                }).sort({ expiryDate: 1 });
                
                // FEFO Deduction: deduct from the oldest available bags first
                let remainingToDeduct = requestedQuantityOfBlood;
                for (const bag of availableBags) {
                    if (remainingToDeduct === 0) break;
                    
                    if (bag.availableQuantity <= remainingToDeduct) {
                        remainingToDeduct -= bag.availableQuantity;
                        bag.availableQuantity = 0;
                        await bag.save();
                    } else {
                        bag.availableQuantity -= remainingToDeduct;
                        remainingToDeduct = 0;
                        await bag.save();
                    }
                }

                // --- URGENT DEMAND ALERT ---
                const stockAfterDeduction = exactCurrentStock - requestedQuantityOfBlood;
                const CRITICAL_THRESHOLD = 5;
                if (stockAfterDeduction < CRITICAL_THRESHOLD) {
                    try {
                        // Find organisation details to get the city
                        const orgData = await userModel.findById(organisation);
                        const orgCity = orgData?.city;

                        const ninetyDaysAgo = new Date();
                        ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

                        // Query for eligible donors (90-Day Rule)
                        const query = {
                            role: 'donor',
                            bloodGroup: requestedBloodGroup,
                            $or: [
                                { lastDonationDate: null },
                                { lastDonationDate: { $lte: ninetyDaysAgo } }
                            ]
                        };

                        // Match organisation's city if available
                        if (orgCity) {
                            query.city = { $regex: new RegExp(`^${orgCity}$`, 'i') };
                        }

                        const eligibleDonors = await userModel.find(query);
                        console.log(`Urgent Alert: Found ${eligibleDonors.length} eligible donors for ${requestedBloodGroup} in city: ${orgCity || 'All'}`);

                        for (const donor of eligibleDonors) {
                            if (donor.email) {
                                console.log(`Urgent Alert: Sending email to ${donor.email}`);
                                await sendNotification({
                                    toEmail: donor.email,
                                    subject: "URGENT NEED: Blood Donation Required",
                                    message: `URGENT: Your blood group ${requestedBloodGroup} is in critical demand at ${orgData.organisationName}${orgCity ? ` in ${orgCity}` : ''}! We urgently need donations. Please rush to ${orgData.organisationName} to donate and help save lives.`
                                });
                            }
                        }

                        // Log to DB
                        const Notification = require("../models/notificationModel");
                        await Notification.create({
                            type: "urgent",
                            targetBloodGroup: requestedBloodGroup,
                            message: `Urgent demand alert sent to ${eligibleDonors.length} donors.`,
                            status: eligibleDonors.length > 0 ? "success" : "simulated",
                            deliveryChannels: ["email"],
                        });
                    } catch (alertError) {
                        console.error("Failed to send urgent donor alerts:", alertError);
                        // Do not crash the inventory transaction
                    }
                }
            } else if (sender?.role === "hospital") {
                req.body.sender = req.userId;
                const requestedBloodGroup = req.body.bloodGroup;
                const requestedQuantityOfBlood = req.body.quantity;
                const hospitalId = new mongoose.Types.ObjectId(req.userId);

                // Blood available = received from donors + received from hospitals - given to consumers - given to hospitals
                // Received from donors: inventoryType "in", organisation = this hospital
                const receivedFromDonors = await inventoryModel.aggregate([
                    {
                        $match: {
                            organisation: hospitalId,
                            inventoryType: "in",
                            bloodGroup: requestedBloodGroup,
                        },
                    },
                    { $group: { _id: null, total: { $sum: "$quantity" } } },
                ]);
                // Received from other hospitals: inventoryType "out", hospital = this hospital, organisation != this hospital (exclude self-transfers)
                const receivedFromHospitals = await inventoryModel.aggregate([
                    {
                        $match: {
                            hospital: hospitalId,
                            organisation: { $ne: hospitalId },
                            inventoryType: "out",
                            bloodGroup: requestedBloodGroup,
                        },
                    },
                    { $group: { _id: null, total: { $sum: "$quantity" } } },
                ]);
                // Given to consumers: inventoryType "in", donor = this hospital
                const givenToConsumers = await inventoryModel.aggregate([
                    {
                        $match: {
                            donor: hospitalId,
                            inventoryType: "in",
                            bloodGroup: requestedBloodGroup,
                        },
                    },
                    { $group: { _id: null, total: { $sum: "$quantity" } } },
                ]);
                // Given to other hospitals: inventoryType "out", sender = this hospital OR (old records) organisation = this hospital, hospital != this hospital
                const givenToHospitals = await inventoryModel.aggregate([
                    {
                        $match: {
                            $or: [
                                { sender: hospitalId, inventoryType: "out", bloodGroup: requestedBloodGroup },
                                { sender: null, organisation: hospitalId, hospital: { $ne: hospitalId }, inventoryType: "out", bloodGroup: requestedBloodGroup },
                            ],
                        },
                    },
                    { $group: { _id: null, total: { $sum: "$quantity" } } },
                ]);

                const totalReceived = (receivedFromDonors[0]?.total || 0) + (receivedFromHospitals[0]?.total || 0);
                const totalGiven = (givenToConsumers[0]?.total || 0) + (givenToHospitals[0]?.total || 0);
                const available = totalReceived - totalGiven;

                if (available < requestedQuantityOfBlood) {
                    return res.status(400).send({
                        success: false,
                        message: `Insufficient blood available. You have ${available} Units of ${requestedBloodGroup.toUpperCase()} available to transfer.`,
                    });
                }
            }
        }


        //save record
        const inventory = new inventoryModel(req.body);
        await inventory.save();

        // --- UPDATE DONOR'S LAST DONATION DATE ---
        if (inventoryType === "in" && user?.role === "donor") {
            user.lastDonationDate = new Date();
            await user.save();
        }

        // --- URGENCY PROTOCOL FOR ORGANISATION ADMIN ---
        if (inventoryType === "out") {
            try {
                const requestedBloodGroup = req.body.bloodGroup;
                const organisationId = new mongoose.Types.ObjectId(req.body.organisation);
                
                // Calculate new remaining stock
                const totalInAgg = await inventoryModel.aggregate([
                    { $match: { organisation: organisationId, inventoryType: "in", bloodGroup: requestedBloodGroup } },
                    { $group: { _id: null, total: { $sum: "$quantity" } } }
                ]);
                const totalOutAgg = await inventoryModel.aggregate([
                    { $match: { organisation: organisationId, inventoryType: "out", bloodGroup: requestedBloodGroup } },
                    { $group: { _id: null, total: { $sum: "$quantity" } } }
                ]);
                const remainingStock = (totalInAgg[0]?.total || 0) - (totalOutAgg[0]?.total || 0);

                if (remainingStock < 3) {
                    const orgUser = await userModel.findById(organisationId);
                    if (orgUser && orgUser.email) {
                        const now = new Date();
                        const alertHistory = orgUser.alertHistory || new Map();
                        const lastAlert = alertHistory.get(requestedBloodGroup);

                        let shouldSend = true;
                        if (lastAlert) {
                            const hoursSinceLastAlert = (now - new Date(lastAlert)) / (1000 * 60 * 60);
                            if (hoursSinceLastAlert < 24) {
                                shouldSend = false;
                            }
                        }

                        if (shouldSend) {
                            await sendNotification({
                                toEmail: orgUser.email,
                                subject: `CRITICAL: ${requestedBloodGroup} Stock Depleted!`,
                                message: `CRITICAL ALERT: Your current stock of ${requestedBloodGroup} has dropped to ${remainingStock} units. Please take immediate action.`
                            });

                            alertHistory.set(requestedBloodGroup, now);
                            orgUser.alertHistory = alertHistory;
                            await orgUser.save();
                        }
                    }
                }
            } catch (urgencyError) {
                console.error("Failed to process urgency protocol:", urgencyError);
            }
        }

        return res.status(201).send({
            success: true,
            message: "New Blood Record Added Successfully",
        });
    } catch (error) {
        console.log(error);
        return res.status(500).send({
            success: false,
            message: error.message || "Internal Server Error in Create Inventory API",
            error,
        });
    }
};

// GET ALL BLOOD RECORDS
const getInventoryController = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const totalRecords = await inventoryModel.countDocuments({
            organisation: req.userId,
        });

        const inventory = await inventoryModel
            .find({
                organisation: req.userId,
            })
            .populate("donor")
            .populate("hospital")
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        return res.status(200).send({
            success: true,
            message: "get all records successfully",
            inventory,
            totalRecords,
            totalPages: Math.ceil(totalRecords / limit),
            currentPage: page
        });
    } catch (error) {
        console.log(error);
        return res.status(500).send({
            success: false,
            message: "Error In Get All Inventory",
            error,
        });
    }
};

// GET Hospital BLOOD RECORDS
const getInventoryHospitalController = async (req, res) => {
    try {
        const page = parseInt(req.body.page) || 1;
        const limit = parseInt(req.body.limit) || 10;
        const skip = (page - 1) * limit;

        const totalRecords = await inventoryModel.countDocuments(req.body.filters);

        const inventory = await inventoryModel
            .find(req.body.filters)
            .populate("donor")
            .populate("hospital")
            .populate("organisation")
            .populate("sender")
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        return res.status(200).send({
            success: true,
            message: "get hospital consumer records successfully",
            inventory,
            totalRecords,
            totalPages: Math.ceil(totalRecords / limit),
            currentPage: page
        });
    } catch (error) {
        console.log(error);
        return res.status(500).send({
            success: false,
            message: "Error In Get consumer Inventory",
            error,
        });
    }
};

// GET DONOR RECORDS
const getDonorsController = async (req, res) => {
    try {
        const organisation = req.userId;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        // find donors
        const donorIds = await inventoryModel.distinct("donor", {
            organisation,
        });

        const totalRecords = await userModel.countDocuments({ _id: { $in: donorIds } });

        const donors = await userModel
            .find({ _id: { $in: donorIds } })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        return res.status(200).send({
            success: true,
            message: "Donor Record Fetched Successfully",
            donors,
            totalRecords,
            totalPages: Math.ceil(totalRecords / limit),
            currentPage: page
        });
    } catch (error) {
        console.log(error);
        return res.status(500).send({
            success: false,
            message: "Error in Donor records",
            error,
        });
    }
};

const getHospitalController = async (req, res) => {
    try {
        const organisation = req.userId;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        // GET HOSPITAL ID
        const hospitalIds = await inventoryModel.distinct("hospital", {
            organisation,
        });

        const totalRecords = await userModel.countDocuments({ _id: { $in: hospitalIds } });

        // FIND HOSPITAL
        const hospitals = await userModel
            .find({ _id: { $in: hospitalIds } })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        return res.status(200).send({
            success: true,
            message: "Hospitals Data Fetched Successfully",
            hospitals,
            totalRecords,
            totalPages: Math.ceil(totalRecords / limit),
            currentPage: page
        });
    } catch (error) {
        console.log(error);
        return res.status(500).send({
            success: false,
            message: "Error In get Hospital API",
            error,
        });
    }
};

const getOrganisationController = async (req, res) => {
    try {
        const donor = req.userId;
        const orgId = await inventoryModel.distinct("organisation", { donor });
        //find org
        const organisations = await userModel.find({
            _id: { $in: orgId },
        });
        return res.status(200).send({
            success: true,
            message: "Org Data Fetched Successfully",
            organisations,
        });
    } catch (error) {
        console.log(error);
        return res.status(500).send({
            success: false,
            message: "Error In ORG API",
            error,
        });
    }
};

const getOrganisationForHospitalController = async (req, res) => {
    try {
        const hospital = req.userId;
        const orgId = await inventoryModel.distinct("organisation", { hospital });
        //find org
        const organisations = await userModel.find({
            _id: { $in: orgId },
        });
        return res.status(200).send({
            success: true,
            message: "Hospital Org Data Fetched Successfully",
            organisations,
        });
    } catch (error) {
        console.log(error);
        return res.status(500).send({
            success: false,
            message: "Error In Hospital ORG API",
            error,
        });
    }
};

const getRecentInventoryController = async (req, res) => {
    try {
        const inventory = await inventoryModel
            .find({
                organisation: req.userId,
            })
            .limit(3)
            .sort({ createdAt: -1 });
        return res.status(200).send({
            success: true,
            message: "recent Invenotry Data",
            inventory,
        });
    } catch (error) {
        console.log(error);
        return res.status(500).send({
            success: false,
            message: "Error In Recent Inventory API",
            error,
        });
    }
};

// GET LIVE CITY RADAR FOR DONOR
const getCityRadarController = async (req, res) => {
    try {
        const donor = await userModel.findById(req.userId);
        if (!donor || donor.role !== "donor") {
            return res.status(403).send({ success: false, message: "Only donors can access the city radar." });
        }
        
        const { city, bloodGroup } = donor;
        if (!city || !bloodGroup) {
            return res.status(200).send({ 
                success: true, 
                message: "Please update your profile with your city and blood group to use the radar.", 
                radarData: [],
                city: city || "Unknown",
                bloodGroup: bloodGroup || "Unknown"
            });
        }

        // Aggregate stock for this specific blood group across ALL organizations
        const stockData = await inventoryModel.aggregate([
            { $match: { bloodGroup: bloodGroup } },
            {
                $group: {
                    _id: "$organisation",
                    totalIn: { $sum: { $cond: [{ $eq: ["$inventoryType", "in"] }, "$quantity", 0] } },
                    totalOut: { $sum: { $cond: [{ $eq: ["$inventoryType", "out"] }, "$quantity", 0] } }
                }
            },
            {
                $project: {
                    organisation: "$_id",
                    availableStock: { $subtract: ["$totalIn", "$totalOut"] }
                }
            },
            {
                $match: { availableStock: { $lt: 5 } } // Less than 5 units (Critical Need)
            }
        ]);

        // Filter organizations that are in the SAME city
        const radarData = [];
        for (const stock of stockData) {
            const org = await userModel.findById(stock.organisation);
            if (org && org.city && org.city.trim().toLowerCase() === city.trim().toLowerCase()) {
                radarData.push({
                    _id: org._id,
                    organisationName: org.organisationName || org.hospitalName || "Medical Facility",
                    address: org.address,
                    phone: org.phone,
                    email: org.email,
                    availableStock: Math.max(0, stock.availableStock),
                });
            }
        }

        return res.status(200).send({
            success: true,
            radarData,
            city,
            bloodGroup
        });
    } catch (error) {
        console.error("City Radar Error:", error);
        return res.status(500).send({
            success: false,
            message: "Error fetching city radar data",
            error
        });
    }
};

// GET BLOOD RECEIVED BY HOSPITAL (from donors and other hospitals)
const getInventoryReceivedController = async (req, res) => {
    try {
        const hospital = req.userId;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        // Count total records for pagination
        const totalCountResult = await inventoryModel.aggregate([
            {
                $match: {
                    $or: [
                        { inventoryType: "in", organisation: new mongoose.Types.ObjectId(hospital) },
                        { inventoryType: "out", hospital: new mongoose.Types.ObjectId(hospital) },
                    ],
                },
            },
            { $count: "total" }
        ]);
        const totalRecords = totalCountResult[0]?.total || 0;

        const inventory = await inventoryModel.aggregate([
            {
                $match: {
                    $or: [
                        { inventoryType: "in", organisation: new mongoose.Types.ObjectId(hospital) },
                        { inventoryType: "out", hospital: new mongoose.Types.ObjectId(hospital) },
                    ],
                },
            },
            {
                $lookup: {
                    from: "users",
                    localField: "donor",
                    foreignField: "_id",
                    as: "donorInfo",
                },
            },
            {
                $lookup: {
                    from: "users",
                    localField: "sender",
                    foreignField: "_id",
                    as: "senderInfo",
                },
            },
            {
                $lookup: {
                    from: "users",
                    localField: "organisation",
                    foreignField: "_id",
                    as: "orgInfo",
                },
            },
            {
                $addFields: {
                    fromEmail: {
                        $cond: {
                            if: { $eq: ["$inventoryType", "out"] },
                            then: {
                                $ifNull: [
                                    { $arrayElemAt: ["$senderInfo.email", 0] },
                                    { $arrayElemAt: ["$orgInfo.email", 0] },
                                    "$email",
                                ],
                            },
                            else: {
                                $ifNull: [
                                    { $arrayElemAt: ["$donorInfo.email", 0] },
                                    "$email",
                                ],
                            },
                        },
                    },
                },
            },
            {
                $project: {
                    bloodGroup: 1,
                    quantity: 1,
                    inventoryType: 1,
                    email: 1,
                    createdAt: 1,
                    fromEmail: 1,
                },
            },
            { $sort: { createdAt: -1 } },
            { $skip: skip },
            { $limit: limit },
        ]);
        return res.status(200).send({
            success: true,
            message: "Blood Received Records Fetched",
            inventory,
            totalRecords,
            totalPages: Math.ceil(totalRecords / limit),
            currentPage: page
        });
    } catch (error) {
        console.log(error);
        return res.status(500).send({
            success: false,
            message: "Error In Get Received Inventory",
            error,
        });
    }
};

// BULK IMPORT INVENTORY
const bulkImportInventoryController = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).send({ success: false, message: "No CSV file uploaded." });
        }

        const results = [];
        const stream = Readable.from(req.file.buffer);

        stream
            .pipe(csv())
            .on("data", (data) => results.push(data))
            .on("end", async () => {
                let successCount = 0;
                const errors = [];

                for (let i = 0; i < results.length; i++) {
                    const row = results[i];
                    const rowNum = i + 1; // For human readable error tracking

                    const email = row.email?.trim();
                    const bloodGroup = row.bloodGroup?.trim();

                    if (!email || !bloodGroup) {
                        errors.push(`Row ${rowNum}: Missing email or bloodGroup.`);
                        continue;
                    }

                    try {
                        const user = await userModel.findOne({ email });
                        if (!user) {
                            errors.push(`Row ${rowNum}: User ${email} not found.`);
                            continue;
                        }
                        
                        if (user.role !== "donor") {
                            errors.push(`Row ${rowNum}: User ${email} is not a donor.`);
                            continue;
                        }

                        if (user.bloodGroup !== bloodGroup) {
                            errors.push(`Row ${rowNum}: Blood group mismatch. Donor is ${user.bloodGroup}, but CSV has ${bloodGroup}.`);
                            continue;
                        }

                        const inventory = new inventoryModel({
                            inventoryType: "in",
                            bloodGroup,
                            quantity: 1, // Fixed 1 unit for bulk imports
                            email,
                            organisation: req.userId,
                            donor: user._id,
                        });
                        
                        await inventory.save();
                        successCount++;
                    } catch (err) {
                        errors.push(`Row ${rowNum}: Processing error - ${err.message}`);
                    }
                }

                return res.status(200).send({
                    success: true,
                    message: "Bulk import processing complete.",
                    summary: {
                        totalProcessed: results.length,
                        successCount,
                        errors,
                    },
                });
            })
            .on("error", (error) => {
                console.error("CSV Parse Error:", error);
                return res.status(500).send({ success: false, message: "Error parsing CSV file.", error });
            });

    } catch (error) {
        console.error("Bulk Import Controller Error:", error);
        return res.status(500).send({
            success: false,
            message: "Server error during bulk import.",
            error,
        });
    }
};

// GET EXPIRING SOON INVENTORY
const getExpiringInventoryController = async (req, res) => {
    try {
        const organisation = req.userId;
        const fiveDaysFromNow = new Date();
        fiveDaysFromNow.setDate(fiveDaysFromNow.getDate() + 5);

        const expiringInventory = await inventoryModel.aggregate([
            {
                $match: {
                    organisation: new mongoose.Types.ObjectId(organisation),
                    inventoryType: "in",
                    availableQuantity: { $gt: 0 },
                    expiryDate: { $gt: new Date(), $lte: fiveDaysFromNow },
                },
            },
            {
                $group: {
                    _id: "$bloodGroup",
                    totalExpiring: { $sum: "$availableQuantity" },
                },
            },
            { $sort: { _id: 1 } }
        ]);

        return res.status(200).send({
            success: true,
            message: "Expiring inventory fetched successfully",
            data: expiringInventory,
        });
    } catch (error) {
        console.error("Error in Get Expiring Inventory:", error);
        return res.status(500).send({
            success: false,
            message: "Error fetching expiring inventory",
            error,
        });
    }
};

// GET KPI STATS (for Dashboard Summary Cards - runs aggregations on entire dataset)
const getKpiStatsController = async (req, res) => {
    try {
        const mongoose = require('mongoose');
        const orgId = new mongoose.Types.ObjectId(req.userId);
        const now = new Date();
        const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
        const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

        // 1. Total available units: SUM(in) - SUM(out) across all records
        const [totalInAgg, totalOutAgg] = await Promise.all([
            inventoryModel.aggregate([{ $match: { organisation: orgId, inventoryType: 'in' } }, { $group: { _id: null, total: { $sum: '$quantity' } } }]),
            inventoryModel.aggregate([{ $match: { organisation: orgId, inventoryType: 'out' } }, { $group: { _id: null, total: { $sum: '$quantity' } } }]),
        ]);
        const totalUnits = Math.max(0, (totalInAgg[0]?.total || 0) - (totalOutAgg[0]?.total || 0));

        // 2. Critical O- stock (current available)
        const [oNegIn, oNegOut] = await Promise.all([
            inventoryModel.aggregate([{ $match: { organisation: orgId, inventoryType: 'in', bloodGroup: 'O-' } }, { $group: { _id: null, total: { $sum: '$quantity' } } }]),
            inventoryModel.aggregate([{ $match: { organisation: orgId, inventoryType: 'out', bloodGroup: 'O-' } }, { $group: { _id: null, total: { $sum: '$quantity' } } }]),
        ]);
        const oNegStock = Math.max(0, (oNegIn[0]?.total || 0) - (oNegOut[0]?.total || 0));

        // 3. Count of bags expiring within 7 days that still have available stock
        const expiringSoon = await inventoryModel.countDocuments({
            organisation: orgId,
            inventoryType: 'in',
            availableQuantity: { $gt: 0 },
            expiryDate: { $gt: now, $lte: sevenDaysFromNow }
        });

        // 4. Total units donated today
        const donationsTodayAgg = await inventoryModel.aggregate([
            { $match: { organisation: orgId, inventoryType: 'in', createdAt: { $gte: startOfToday } } },
            { $group: { _id: null, total: { $sum: '$quantity' } } }
        ]);
        const donationsToday = donationsTodayAgg[0]?.total || 0;

        return res.status(200).send({
            success: true,
            stats: { totalUnits, oNegStock, expiringSoon, donationsToday }
        });
    } catch (error) {
        console.log('KPI Stats Error:', error);
        return res.status(500).send({ success: false, message: 'Error fetching KPI stats', error });
    }
};


module.exports = {
    createInventoryController,
    getInventoryController,
    getDonorsController,
    getHospitalController,
    getOrganisationController,
    getOrganisationForHospitalController,
    getInventoryHospitalController,
    getRecentInventoryController,
    getInventoryReceivedController,
    getCityRadarController,
    bulkImportInventoryController,
    getExpiringInventoryController,
    getKpiStatsController,
};