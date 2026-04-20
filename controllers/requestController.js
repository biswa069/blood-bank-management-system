const urgentRequestModel = require("../models/urgentRequestModel");
const userModel = require("../models/userModel");

// Create a new urgent request
const createRequestController = async (req, res) => {
    try {
        const hospitalId = req.user.userId; // Get hospital ID from auth middleware
        const { bloodType, quantity, reason } = req.body;

        const newRequest = new urgentRequestModel({
            requestingHospital: hospitalId,
            bloodType,
            quantity,
            reason,
        });

        await newRequest.save();

        // Optional: Find eligible donors and send notifications (email, SMS)
        // const eligibleDonors = await userModel.find({ role: 'donor', bloodType: bloodType });
        // Code to send notifications would go here.

        res.status(201).send({
            success: true,
            message: "Urgent request created successfully",
            newRequest,
        });
    } catch (error) {
        res.status(500).send({ success: false, message: "Error creating request", error });
    }
};

// Get all active requests for donors
const getActiveRequestsController = async (req, res) => {
    try {
        const activeRequests = await urgentRequestModel
            .find({ status: "active" })
            .populate("requestingHospital", "name address phone") // Populate with hospital details
            .sort({ createdAt: -1 });

        res.status(200).send({
            success: true,
            message: "Fetched active requests",
            activeRequests,
        });
    } catch (error) {
        res.status(500).send({ success: false, message: "Error fetching requests", error });
    }
};

// Allow a donor to respond to a request
const respondToRequestController = async (req, res) => {
    try {
        const requestId = req.params.id;
        const donorId = req.user.userId;

        await urgentRequestModel.findByIdAndUpdate(requestId, {
            $addToSet: { respondedDonors: donorId }, // $addToSet prevents duplicate responses
        });

        res.status(200).send({
            success: true,
            message: "Thank you for responding! The hospital will be notified.",
        });
    } catch (error) {
        res.status(500).send({ success: false, message: "Error responding to request", error });
    }
};

module.exports = {
    createRequestController,
    getActiveRequestsController,
    respondToRequestController,
};