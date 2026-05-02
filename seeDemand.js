// seedDemand.js
const mongoose = require("mongoose");
const dotenv = require("dotenv");

// Load your environment variables
dotenv.config();

// Import your Mongoose Models
const inventoryModel = require("./models/inventoryModel");
const userModel = require("./models/userModel");

// MongoDB Connection String
const MONGO_URL = process.env.MONGO_URL || "mongodb://127.0.0.1:27017/blood_bank";

const seedDatabase = async () => {
    try {
        await mongoose.connect(MONGO_URL);
        console.log("🟢 Connected to MongoDB");

        // 1. Find existing users to satisfy your Schema relations
        const org = await userModel.findOne({ role: "organisation" });
        const hospital = await userModel.findOne({ role: "hospital" });
        const donor = await userModel.findOne({ role: "donor" }); // NEED A DONOR FOR "IN" RECORDS

        if (!org || !hospital || !donor) {
            console.log("🔴 ERROR: You must have at least ONE 'organisation', ONE 'hospital', and ONE 'donor' registered in your DB.");
            process.exit(1);
        }

        console.log(`Org: ${org.email} | Hospital: ${hospital.email} | Donor: ${donor.email}`);

        const bloodGroups = ["O+", "O-", "AB+", "AB-", "A+", "A-", "B+", "B-"];
        const mockData = [];

        // 2. Generate 800 random transactions over the last 45 days to guarantee a massive surplus
        for (let i = 0; i < 800; i++) {
            const randomBloodGroup = bloodGroups[Math.floor(Math.random() * bloodGroups.length)];
            
            // Pick a random day in the past 45 days
            const daysAgo = Math.floor(Math.random() * 45);
            const randomDate = new Date();
            randomDate.setDate(randomDate.getDate() - daysAgo);

            // Randomly decide if this transaction is IN (90% chance) or OUT (10% chance)
            // We want heavily more "in" than "out" so the bank runs a huge surplus
            const transactionType = Math.random() > 0.1 ? "in" : "out";

            let record = {
                inventoryType: transactionType,
                bloodGroup: randomBloodGroup,
                organisation: org._id,
                createdAt: randomDate,
                updatedAt: randomDate
            };

            if (transactionType === "out") {
                // HOSPITAL REQUESTING BLOOD
                record.email = hospital.email;
                record.quantity = Math.floor(Math.random() * 5) + 1; // Hospital requests 1-5 units
                record.hospital = hospital._id;
            } else {
                // DONOR GIVING BLOOD
                record.email = donor.email;
                record.quantity = 1; // Strict 1 Unit rule for donations
                record.donor = donor._id;
            }

            mockData.push(record);
        }

        // 3. Clear old test data
        await inventoryModel.deleteMany({}); 

        // 4. Insert all the fake data into MongoDB at once
        await inventoryModel.insertMany(mockData);
        
        console.log(`✅ SUCCESS: 800 mixed 'IN' and 'OUT' records have been seeded into your database!`);
        console.log(`Check your frontend dashboard—your inventory numbers should look very realistic now.`);
        
        process.exit();

    } catch (error) {
        console.log("🔴 Script Error:", error);
        process.exit(1);
    }
};

seedDatabase();