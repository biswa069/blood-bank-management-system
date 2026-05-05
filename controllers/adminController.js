const userModel = require("../models/userModel");
const inventoryModel = require("../models/inventoryModel");
const mongoose = require("mongoose");

//GET DONOR LIST
const getDonorsListController = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const totalRecords = await userModel.countDocuments({ role: "donor" });

        const donorData = await userModel
            .find({ role: "donor" })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        return res.status(200).send({
            success: true,
            totalRecords,
            totalPages: Math.ceil(totalRecords / limit),
            currentPage: page,
            message: "Donar List Fetched Successfully",
            donorData,
        });
    } catch (error) {
        console.log(error);
        return res.status(500).send({
            success: false,
            message: "Error In Donor List API",
            error,
        });
    }
};
//GET HOSPITAL LIST
const getHospitalListController = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const totalRecords = await userModel.countDocuments({ role: "hospital" });

        const hospitalData = await userModel
            .find({ role: "hospital" })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        return res.status(200).send({
            success: true,
            totalRecords,
            totalPages: Math.ceil(totalRecords / limit),
            currentPage: page,
            message: "HOSPITAL List Fetched Successfully",
            hospitalData,
        });
    } catch (error) {
        console.log(error);
        return res.status(500).send({
            success: false,
            message: "Error In Hospital List API",
            error,
        });
    }
};
//GET ORG LIST
const getOrgListController = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const totalRecords = await userModel.countDocuments({ role: "organisation" });

        const orgData = await userModel
            .find({ role: "organisation" })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        return res.status(200).send({
            success: true,
            totalRecords,
            totalPages: Math.ceil(totalRecords / limit),
            currentPage: page,
            message: "ORG List Fetched Successfully",
            orgData,
        });
    } catch (error) {
        console.log(error);
        return res.status(500).send({
            success: false,
            message: "Error In ORG List API",
            error,
        });
    }
};
// =======================================

//DELETE DONOR
const deleteDonorController = async (req, res) => {
    try {
        await userModel.findByIdAndDelete(req.params.id);
        return res.status(200).send({
            success: true,
            message: " Record Deleted successfully",
        });
    } catch (error) {
        console.log(error);
        return res.status(500).send({
            success: false,
            message: "Error while deleting ",
            error,
        });
    }
};

//GET ANALYTICS FOR SPECIFIC USER (org or hospital)
const getEntityAnalyticsController = async (req, res) => {
    try {
        const { id, role } = req.query;
        if (!id || !role) {
            return res.status(400).send({ success: false, message: "id and role are required" });
        }
        const entityId = new mongoose.Types.ObjectId(id);
        const bloodGroups = ["O+", "O-", "AB+", "AB-", "A+", "A-", "B+", "B-"];
        const bloodGroupData = [];

        await Promise.all(
            bloodGroups.map(async (bloodGroup) => {
                let totalIn = 0;
                let totalOut = 0;

                if (role === "organisation") {
                    // totalIn = inventoryType "in", organisation = id
                    const inResult = await inventoryModel.aggregate([
                        { $match: { organisation: entityId, inventoryType: "in", bloodGroup } },
                        { $group: { _id: null, total: { $sum: "$quantity" } } },
                    ]);
                    // totalOut = inventoryType "out", organisation = id
                    const outResult = await inventoryModel.aggregate([
                        { $match: { organisation: entityId, inventoryType: "out", bloodGroup } },
                        { $group: { _id: null, total: { $sum: "$quantity" } } },
                    ]);
                    totalIn = inResult[0]?.total || 0;
                    totalOut = outResult[0]?.total || 0;
                } else if (role === "hospital") {
                    // totalIn = received from donors + received from other hospitals
                    const inResult = await inventoryModel.aggregate([
                        {
                            $match: {
                                $or: [
                                    { organisation: entityId, inventoryType: "in", bloodGroup },
                                    { hospital: entityId, organisation: { $ne: entityId }, inventoryType: "out", bloodGroup },
                                ],
                            },
                        },
                        { $group: { _id: null, total: { $sum: "$quantity" } } },
                    ]);
                    // totalOut = given to consumers + given to other hospitals
                    const outResult = await inventoryModel.aggregate([
                        {
                            $match: {
                                $or: [
                                    { organisation: entityId, hospital: entityId, inventoryType: "out", bloodGroup },
                                    { sender: null, organisation: entityId, hospital: { $ne: entityId }, inventoryType: "out", bloodGroup },
                                    { sender: entityId, inventoryType: "out", bloodGroup },
                                ],
                            },
                        },
                        { $group: { _id: null, total: { $sum: "$quantity" } } },
                    ]);
                    totalIn = inResult[0]?.total || 0;
                    totalOut = outResult[0]?.total || 0;
                }

                bloodGroupData.push({
                    bloodGroup,
                    totalIn,
                    totalOut,
                    availabeBlood: totalIn - totalOut,
                });
            })
        );

        return res.status(200).send({
            success: true,
            message: "Analytics Fetched Successfully",
            bloodGroupData,
        });
    } catch (error) {
        console.log(error);
        return res.status(500).send({
            success: false,
            message: "Error fetching entity analytics",
            error,
        });
    }
};

//EXPORT
module.exports = {
    getDonorsListController,
    getHospitalListController,
    getOrgListController,
    deleteDonorController,
    getEntityAnalyticsController,
};