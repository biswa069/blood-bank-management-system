const mongoose = require("mongoose");

const urgentRequestSchema = new mongoose.Schema(
    {
        requestingHospital: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "users",
            required: true,
        },
        bloodType: {
            type: String,
            required: true,
            enum: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"],
        },
        quantity: {
            type: Number,
            required: true,
        },
        reason: {
            type: String,
            required: true,
        },
        status: {
            type: String,
            required: true,
            enum: ["active", "fulfilled", "closed"],
            default: "active",
        },
        respondedDonors: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "users",
            },
        ],
    },
    { timestamps: true }
);

module.exports = mongoose.model("urgentRequests", urgentRequestSchema);