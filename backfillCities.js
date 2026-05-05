// backfillCities.js
// One-time script to assign random cities to all existing users who don't have one.
const mongoose = require("mongoose");
const dotenv = require("dotenv");

dotenv.config();

const userModel = require("./models/userModel");

const CITIES = [
    "Bhubaneswar",
    "Cuttack",
    "Rourkela",
    "Puri",
    "Sambalpur",
    "Berhampur",
    "Balasore",
    "Baripada",
    "Angul",
    "Jharsuguda",
    "Koraput",
    "Jeypore",
    "Kendrapara",
    "Dhenkanal",
    "Bhadrak",
];

const MONGO_URL = process.env.MONGO_URL || "mongodb://127.0.0.1:27017/blood_bank";

const backfillCities = async () => {
    try {
        await mongoose.connect(MONGO_URL);
        console.log("🟢 Connected to MongoDB");

        // Find all users who have no address (city) set
        const usersWithoutCity = await userModel.find({
            $or: [
                { address: { $exists: false } },
                { address: null },
                { address: "" },
            ],
        });

        console.log(`🔍 Found ${usersWithoutCity.length} users without a city.`);

        if (usersWithoutCity.length === 0) {
            console.log("✅ All users already have a city assigned. Nothing to do.");
            process.exit();
        }

        let updated = 0;
        for (const user of usersWithoutCity) {
            const randomCity = CITIES[Math.floor(Math.random() * CITIES.length)];
            user.address = randomCity;
            await user.save();
            updated++;
            console.log(`   → ${user.email || user.name || user.organisationName || user.hospitalName} → ${randomCity}`);
        }

        console.log(`\n✅ SUCCESS: Assigned cities to ${updated} users.`);
        process.exit();
    } catch (error) {
        console.error("🔴 Script Error:", error);
        process.exit(1);
    }
};

backfillCities();
