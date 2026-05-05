// // seedDemand.js
// const mongoose = require("mongoose");
// const dotenv = require("dotenv");

// // Load your environment variables
// dotenv.config();

// // Import your Mongoose Models
// const inventoryModel = require("./models/inventoryModel");
// const userModel = require("./models/userModel");

// // MongoDB Connection String
// const MONGO_URL = process.env.MONGO_URL || "mongodb://127.0.0.1:27017/blood_bank";

// const seedDatabase = async () => {
//     try {
//         await mongoose.connect(MONGO_URL);
//         console.log("🟢 Connected to MongoDB");

//         // 1. Find existing users to satisfy your Schema relations
//         const org = await userModel.findOne({ role: "organisation" });
//         const hospital = await userModel.findOne({ role: "hospital" });
//         const donor = await userModel.findOne({ role: "donor" }); // NEED A DONOR FOR "IN" RECORDS

//         if (!org || !hospital || !donor) {
//             console.log("🔴 ERROR: You must have at least ONE 'organisation', ONE 'hospital', and ONE 'donor' registered in your DB.");
//             process.exit(1);
//         }

//         console.log(`Org: ${org.email} | Hospital: ${hospital.email} | Donor: ${donor.email}`);

//         const bloodGroups = ["O+", "O-", "AB+", "AB-", "A+", "A-", "B+", "B-"];
//         const mockData = [];

//         // 2. Generate 800 random transactions over the last 45 days to guarantee a massive surplus
//         for (let i = 0; i < 800; i++) {
//             const randomBloodGroup = bloodGroups[Math.floor(Math.random() * bloodGroups.length)];
            
//             // Pick a random day in the past 45 days
//             const daysAgo = Math.floor(Math.random() * 45);
//             const randomDate = new Date();
//             randomDate.setDate(randomDate.getDate() - daysAgo);

//             // Randomly decide if this transaction is IN (90% chance) or OUT (10% chance)
//             // We want heavily more "in" than "out" so the bank runs a huge surplus
//             const transactionType = Math.random() > 0.1 ? "in" : "out";

//             let record = {
//                 inventoryType: transactionType,
//                 bloodGroup: randomBloodGroup,
//                 organisation: org._id,
//                 createdAt: randomDate,
//                 updatedAt: randomDate
//             };

//             if (transactionType === "out") {
//                 // HOSPITAL REQUESTING BLOOD
//                 record.email = hospital.email;
//                 record.quantity = Math.floor(Math.random() * 5) + 1; // Hospital requests 1-5 units
//                 record.hospital = hospital._id;
//             } else {
//                 // DONOR GIVING BLOOD
//                 record.email = donor.email;
//                 record.quantity = 1; // Strict 1 Unit rule for donations
//                 record.donor = donor._id;
//             }

//             mockData.push(record);
//         }

//         // 3. Clear old test data
//         await inventoryModel.deleteMany({}); 

//         // 4. Insert all the fake data into MongoDB at once
//         await inventoryModel.insertMany(mockData);
        
//         console.log(`✅ SUCCESS: 800 mixed 'IN' and 'OUT' records have been seeded into your database!`);
//         console.log(`Check your frontend dashboard—your inventory numbers should look very realistic now.`);
        
//         process.exit();

//     } catch (error) {
//         console.log("🔴 Script Error:", error);
//         process.exit(1);
//     }
// };

// seedDatabase();

const mongoose = require("mongoose");
const dotenv = require("dotenv");

// Load your environment variables
dotenv.config();

// Import your Mongoose Models
const inventoryModel = require("./models/inventoryModel");
const userModel = require("./models/userModel");

const MONGO_URL = process.env.MONGO_URL || "mongodb://127.0.0.1:27017/blood_bank";

const seedDatabase = async () => {
    try {
        await mongoose.connect(MONGO_URL);
        console.log("🟢 Connected to MongoDB");

        // 1. Find existing org and hospital
        const org = await userModel.findOne({ role: "organisation" });
        const hospital = await userModel.findOne({ role: "hospital" });

        if (!org || !hospital) {
            console.log("🔴 ERROR: You must have at least ONE 'organisation' and ONE 'hospital' registered.");
            process.exit(1);
        }

        const bloodGroups = ["O+", "O-", "AB+", "AB-", "A+", "A-", "B+", "B-"];
        const cities = [
            "Bhubaneswar", "Cuttack", "Rourkela", "Puri", "Sambalpur",
            "Berhampur", "Balasore", "Baripada", "Angul", "Jharsuguda",
            "Koraput", "Jeypore", "Kendrapara", "Dhenkanal", "Bhadrak",
        ];
        
        // 2. Map distinct donors to distinct blood groups
        console.log("🔍 Verifying donors for all 8 blood groups...");
        const donorMap = {};
        
        for (const bg of bloodGroups) {
            // Safe string for emails (e.g., "O+" becomes "Opos")
            const bgString = bg.replace('+', 'pos').replace('-', 'neg');
            const dummyEmail = `donor_${bgString}@mock.com`;
            const randomCity = cities[Math.floor(Math.random() * cities.length)];

            // Try to find a donor with this blood group, or create a mock one via upsert
            let specificDonor = await userModel.findOneAndUpdate(
                { email: dummyEmail }, // Search criteria
                {
                    role: "donor",
                    name: `Mock Donor ${bg}`,
                    email: dummyEmail,
                    password: "hashedpassword123", // Keep it generic
                    bloodGroup: bg,
                    phone: "0000000000",
                    address: randomCity
                },
                { upsert: true, new: true } // Create if it doesn't exist
            );

            // Store the donor in our map using the blood group as the key
            donorMap[bg] = specificDonor;
        }
        
        console.log("✅ Donor map established. Proceeding to seed transactions...");

        // --- REALISTIC DISTRIBUTION WEIGHTS ---
        // Approximate global distribution percentages
        const bloodWeights = [
            { group: "O+", weight: 38 },
            { group: "A+", weight: 34 },
            { group: "B+", weight: 9 },
            { group: "O-", weight: 7 },
            { group: "A-", weight: 6 },
            { group: "AB+", weight: 3 },
            { group: "B-", weight: 2 },
            { group: "AB-", weight: 1 }
        ];

        // Helper function to pick blood based on realistic population weights
        const getWeightedBloodGroup = () => {
            let sum = 0;
            const r = Math.random() * 100;
            for (let i = 0; i < bloodWeights.length; i++) {
                sum += bloodWeights[i].weight;
                if (r <= sum) return bloodWeights[i].group;
            }
            return "O+"; // Fallback
        };

        const mockData = [];

        // 3. Generate 800 random transactions
        for (let i = 0; i < 800; i++) {
            // Pick based on real-world biology, not pure randomness
            const randomBloodGroup = getWeightedBloodGroup();
            
            const daysAgo = Math.floor(Math.random() * 45);
            const randomDate = new Date();
            randomDate.setDate(randomDate.getDate() - daysAgo);

            // Determine if it's a weekend (0 = Sunday, 6 = Saturday)
            const isWeekend = randomDate.getDay() === 0 || randomDate.getDay() === 6;

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
                record.hospital = hospital._id;
                
                // Realistic Quantity Logic
                const isEmergency = Math.random() < 0.05; // 5% chance of severe trauma
                
                if (isEmergency && (randomBloodGroup === "O-" || randomBloodGroup === "O+")) {
                    record.quantity = Math.floor(Math.random() * 10) + 10; // 10-20 units for emergency!
                } else if (isWeekend) {
                    record.quantity = Math.floor(Math.random() * 2) + 1; // 1-2 units on weekends (emergencies only)
                } else {
                    record.quantity = Math.floor(Math.random() * 4) + 1; // 1-4 units on weekdays (elective surgeries)
                }

            } else {
                // DONOR GIVING BLOOD
                const mappedDonor = donorMap[randomBloodGroup];
                record.email = mappedDonor.email;
                record.quantity = 1; // Always 1 unit per donation
                record.donor = mappedDonor._id;
            }

            mockData.push(record);
        }

        // 4. Clear old test data and insert new
        await inventoryModel.deleteMany({}); 
        await inventoryModel.insertMany(mockData);
        
        console.log(`✅ SUCCESS: 800 medically accurate and realistic records seeded!`);
        process.exit();

    } catch (error) {
        console.log("🔴 Script Error:", error);
        process.exit(1);
    }
};

seedDatabase();