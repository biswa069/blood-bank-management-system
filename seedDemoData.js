const mongoose = require("mongoose");
const dotenv = require("dotenv");
const inventoryModel = require("./models/inventoryModel");

// Load environment variables
dotenv.config();

const seedDemoData = async () => {
    try {
        console.log("Connecting to MongoDB...");
        await mongoose.connect(process.env.MONGO_URL, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log("MongoDB Connected Successfully.");

        // ==========================================
        // 🚨 REPLACE THESE PLACEHOLDERS BEFORE RUNNING
        // ==========================================
        const ORG_ID = "69f5f15cec8727aa71714735";
        const DONOR_ID = "69f7681205ae088d45066226"; // Required for 'in' inventory
        const DONOR_EMAIL = "b122039@iiit-bh.ac.in";

        if (ORG_ID === "PLACEHOLDER_ORG_ID") {
            console.warn("⚠️ WARNING: Please replace PLACEHOLDER_ORG_ID with your actual organisation ID before running.");
            process.exit(1);
        }

        // Calculate specific expiration dates (4 days and 5 days from exactly right now)
        const fourDaysFromNow = new Date();
        fourDaysFromNow.setDate(fourDaysFromNow.getDate() + 4);

        const fiveDaysFromNow = new Date();
        fiveDaysFromNow.setDate(fiveDaysFromNow.getDate() + 5);

        console.log("Injecting A+ Spikes for Wastage Risk Scenario...");

        // Note: Our model has a pre-save hook that forces expiryDate to +35 days for new "in" records.
        // To bypass this and force our simulated expiration dates, we save them normally first, 
        // and then manually update them using findByIdAndUpdate (which bypasses pre-save).

        // Record 1: 40 units expiring in 4 days
        const record1 = new inventoryModel({
            inventoryType: "in",
            bloodGroup: "A+",
            quantity: 40,
            availableQuantity: 40,
            email: DONOR_EMAIL,
            organisation: new mongoose.Types.ObjectId(ORG_ID),
            donor: new mongoose.Types.ObjectId(DONOR_ID),
        });
        const saved1 = await record1.save();
        await inventoryModel.findByIdAndUpdate(saved1._id, { expiryDate: fourDaysFromNow });
        
        // Record 2: 35 units expiring in 5 days
        const record2 = new inventoryModel({
            inventoryType: "in",
            bloodGroup: "A+",
            quantity: 35,
            availableQuantity: 35,
            email: DONOR_EMAIL,
            organisation: new mongoose.Types.ObjectId(ORG_ID),
            donor: new mongoose.Types.ObjectId(DONOR_ID),
        });
        const saved2 = await record2.save();
        await inventoryModel.findByIdAndUpdate(saved2._id, { expiryDate: fiveDaysFromNow });

        console.log("🎉 Demo data seeded successfully!");
        console.log("- Injected 40 units of A+ expiring on:", fourDaysFromNow.toDateString());
        console.log("- Injected 35 units of A+ expiring on:", fiveDaysFromNow.toDateString());
        
        console.log("\nOpen your React Dashboard and select 'A+' with a '14 Day' Forecast Window to see the massive red spike!");

    } catch (error) {
        console.error("🔴 Error Seeding Data: ", error.message);
    } finally {
        mongoose.connection.close();
        console.log("MongoDB connection closed.");
        process.exit(0);
    }
};

seedDemoData();
