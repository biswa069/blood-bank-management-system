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

// CREATE INVENTORY
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
                // Validate using organisation's blood stock (totalIn - totalOut)
                const organisation = new mongoose.Types.ObjectId(req.body.organisation);
                const totalIn = await inventoryModel.aggregate([
                    {
                        $match: {
                            organisation,
                            inventoryType: "in",
                            bloodGroup: requestedBloodGroup,
                        },
                    },
                    {
                        $group: { _id: null, total: { $sum: "$quantity" } },
                    },
                ]);
                const totalOut = await inventoryModel.aggregate([
                    {
                        $match: {
                            organisation,
                            inventoryType: "out",
                            bloodGroup: requestedBloodGroup,
                        },
                    },
                    {
                        $group: { _id: null, total: { $sum: "$quantity" } },
                    },
                ]);
                const available = (totalIn[0]?.total || 0) - (totalOut[0]?.total || 0);
                if (available < requestedQuantityOfBlood) {
                    return res.status(400).send({
                        success: false,
                        message: `Only ${available} Units of ${requestedBloodGroup.toUpperCase()} is available`,
                    });
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
        const inventory = await inventoryModel
            .find({
                organisation: req.userId,
            })
            .populate("donor")
            .populate("hospital")
            .sort({ createdAt: -1 });;
        return res.status(200).send({
            success: true,
            messaage: "get all records successfully",
            inventory,
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
        const inventory = await inventoryModel
            .find(req.body.filters)
            .populate("donor")
            .populate("hospital")
            .populate("organisation")
            .populate("sender")
            .sort({ createdAt: -1 });
        return res.status(200).send({
            success: true,
            messaage: "get hospital comsumer records successfully",
            inventory,
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
        //find donars
        const donorId = await inventoryModel.distinct("donor", {
            organisation,
        });
        const donors = await userModel.find({ _id: { $in: donorId } });

        return res.status(200).send({
            success: true,
            message: "Donor Record Fetched Successfully",
            donors,
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
        //GET HOSPITAL ID
        const hospitalId = await inventoryModel.distinct("hospital", {
            organisation,
        });
        //FIND HOSPITAL
        const hospitals = await userModel.find({
            _id: { $in: hospitalId },
        });
        return res.status(200).send({
            success: true,
            message: "Hospitals Data Fetched Successfully",
            hospitals,
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

// GET BLOOD RECEIVED BY HOSPITAL (from donors and other hospitals)
const getInventoryReceivedController = async (req, res) => {
    try {
        const hospital = req.userId;
        const inventory = await inventoryModel.aggregate([
            {
                $match: {
                    $or: [
                        // Blood received from donors (organisations receive from donors)
                        { inventoryType: "in", organisation: new mongoose.Types.ObjectId(hospital) },
                        // Blood received from other hospitals (hospital-to-hospital transfer)
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
        ]);
        return res.status(200).send({
            success: true,
            message: "Blood Received Records Fetched",
            inventory,
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
    bulkImportInventoryController,
};