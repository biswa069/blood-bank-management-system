const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
    {
        role: {
            type: String,
            required: [true, "role is required"],
            enum: ["admin", "organisation", "donor", "hospital"],
        },
        name: {
            type: String,
            required: function () {
                if (this.role === "user" || this.role === "admin") {
                    return true;
                }
                return false;
            },
        },
        organisationName: {
            type: String,
            required: function () {
                if (this.role === "organisation") {
                    return true;
                }
                return false;
            },
        },
        hospitalName: {
            type: String,
            required: function () {
                if (this.role === "hospital") {
                    return true;
                }
                return false;
            },
        },
        email: {
            type: String,
            required: [true, "email is required"],
            unique: true,
        },
        password: {
            type: String,
            required: [true, "password is required"],
        },
        website: {
            type: String,
        },
        address: {
            type: String,
            required: [true, "address is required"],
        },
        phone: {
            type: String,
            required: [true, "phone number is required"],
        },
        bloodGroup: {
            type: String,
            required: function () {
                return this.role === "donor";
            },
            enum: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"],
        },
        city: {
            type: String,
            required: false,
        },
        lastDonationDate: {
            type: Date,
        },
        lastAlertSentAt: {
            type: Date,
        },
        alertHistory: {
            type: Map,
            of: Date,
            default: {}
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model("users", userSchema);