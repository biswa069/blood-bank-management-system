const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
    {
        type: {
            type: String,
            required: [true, "Notification type is required"],
            enum: ["urgent", "wastage", "broadcast"],
        },
        targetBloodGroup: {
            type: String,
            required: [true, "Target blood group is required"],
            enum: ["O+", "O-", "AB+", "AB-", "A+", "A-", "B+", "B-", "All"],
        },
        message: {
            type: String,
            required: [true, "Message is required"],
        },
        status: {
            type: String,
            required: [true, "Status is required"],
            enum: ["success", "failed", "simulated"],
        },
        deliveryChannels: {
            type: [String],
            required: true,
            default: ["email"],
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model("Notification", notificationSchema);
