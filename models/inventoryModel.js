const mongoose = require("mongoose");

const inventorySchema = new mongoose.Schema(
    {
        inventoryType: {
            type: String,
            required: [true, "inventory type required"],
            enum: ["in", "out"],
        },
        bloodGroup: {
            type: String,
            required: [true, "blood group is required"],
            enum: ["O+", "O-", "AB+", "AB-", "A+", "A-", "B+", "B-"],
        },
        quantity: {
            type: Number,
            require: [true, "blood quantity is required"],
        },
        email: {
            type: String,
            required: [true, "Donor Email is Required"],
        },
        organisation: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "users",
            required: [true, "organisation is required"],
        },
        hospital: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "users",
            required: function () {
                return this.inventoryType === "out";
            },
        },
        donor: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "users",
            required: function () {
                return this.inventoryType === "in";
            },
        },
        sender: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "users",
        },
        expiryDate: {
            type: Date,
        },
        availableQuantity: {
            type: Number,
            default: 0,
        },
    },
    { timestamps: true }
);

// Pre-save hook for FEFO and Expiry Date logic
inventorySchema.pre('save', function (next) {
    if (this.isNew && this.inventoryType === 'in') {
        // Set expiry date to 35 days from now
        const expiry = new Date();
        expiry.setDate(expiry.getDate() + 35);
        this.expiryDate = expiry;

        // Initialize available quantity
        this.availableQuantity = this.quantity;
    }
    next();
});

module.exports = mongoose.model("Inventory", inventorySchema);