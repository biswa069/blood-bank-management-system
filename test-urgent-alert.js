const mongoose = require('mongoose');
const dotenv = require('dotenv');
const userModel = require('./models/userModel');
const inventoryModel = require('./models/inventoryModel');
const axios = require('axios');
const jwt = require('jsonwebtoken');

dotenv.config();

async function runTest() {
    try {
        await mongoose.connect(process.env.MONGO_URL);
        console.log("Connected to DB for testing.");

        // 1. Create a mock organisation
        const orgEmail = `org_test_${Date.now()}@example.com`;
        const org = await userModel.create({
            role: 'organisation',
            organisationName: 'Test Org',
            email: orgEmail,
            password: 'password123',
            address: 'Test Address',
            phone: '1234567890',
            city: 'TestCity'
        });
        console.log(`Created Org: ${org.organisationName} in ${org.city}`);

        // 2. Create a mock hospital
        const hospEmail = `hosp_test_${Date.now()}@example.com`;
        const hospital = await userModel.create({
            role: 'hospital',
            hospitalName: 'Test Hospital',
            email: hospEmail,
            password: 'password123',
            address: 'Test Address',
            phone: '1234567890'
        });
        console.log(`Created Hospital: ${hospital.hospitalName}`);

        // 3. Create a mock donor in the SAME city
        const donorEmail = `donor_test_${Date.now()}@example.com`;
        const donor = await userModel.create({
            role: 'donor',
            name: 'Test Donor',
            email: donorEmail,
            password: 'password123',
            address: 'Test Address',
            phone: '1234567890',
            city: 'TestCity',
            bloodGroup: 'O+'
        });
        console.log(`Created Donor: ${donor.name} in ${donor.city}`);

        // 4. Add initial stock (e.g., 6 units of O+)
        await inventoryModel.create({
            inventoryType: 'in',
            bloodGroup: 'O+',
            quantity: 6,
            email: donorEmail,
            organisation: org._id,
            donor: donor._id,
            availableQuantity: 6,
            expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days expiry
        });
        console.log(`Added 6 units of O+ to ${org.organisationName}`);

        // 5. Generate token for organisation
        const orgToken = jwt.sign({ userId: org._id }, process.env.JWT_SECRET, { expiresIn: '1d' });

        console.log("\n--- Triggering Organisation Out Request (2 units to Hospital) ---");
        console.log("This will drop stock from 6 to 4 (below threshold 5). Expecting urgent alert logs below:\n");

        // 6. Make "out" request via API to trigger the controller logic
        const response = await axios.post('http://localhost:8080/api/v1/inventory/create-inventory', {
            inventoryType: 'out',
            bloodGroup: 'O+',
            quantity: 2,
            email: hospEmail,
            organisation: org._id
        }, {
            headers: { Authorization: `Bearer ${orgToken}` }
        });

        console.log("\nAPI Response:", response.data.message);

        // Cleanup
        await userModel.deleteMany({ email: { $in: [orgEmail, hospEmail, donorEmail] } });
        await inventoryModel.deleteMany({ organisation: org._id });
        console.log("\nTest data cleaned up.");
        
        process.exit(0);

    } catch (error) {
        console.error("Test failed:", error.response?.data || error.message);
        process.exit(1);
    }
}

runTest();
