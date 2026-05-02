const express = require('express')
const dotenv = require('dotenv')
const morgan = require('morgan')
const cors = require('cors')
const connectDB = require('./config/db')
const cron = require('node-cron');
const axios = require('axios');

dotenv.config();

connectDB();

const app = express()

//middlewares
app.use(express.json());
app.use(cors());
app.use(morgan("dev"));

app.use("/api/v1/test", require("./routes/testRoutes"));
app.use("/api/v1/auth", require("./routes/authRoutes"));
app.use("/api/v1/inventory", require("./routes/inventoryRoutes"));
app.use("/api/v1/analytics", require("./routes/analyticsRoutes"));
app.use("/api/v1/admin", require("./routes/adminRoutes"));
app.use("/api/v1/request", require("./routes/requestRoutes"));

const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
  console.log(
    `Node Server Running In ${process.env.DEV_MODE} Mode On Port ${process.env.PORT}`
      .bgBlue.white
  );
});

// Nightly AI Forecast Cron Job (Runs at 2:00 AM every day)
cron.schedule('0 2 * * *', async () => {
    console.log('Running nightly AI forecast cron job...');
    const bloodGroups = ['A+', 'B+', 'O+', 'AB+', 'A-', 'B-', 'O-', 'AB-'];
    for (const bg of bloodGroups) {
        try {
            const encodedBloodGroup = encodeURIComponent(bg);
            const pythonApiUrl = `http://127.0.0.1:8000/inventory_suggestion/${encodedBloodGroup}`;
            const response = await axios.get(pythonApiUrl);
            console.log(`Forecast for ${bg}: ${response.data.predicted_demand_tomorrow} units.`);
        } catch (error) {
            console.error(`Error forecasting ${bg}:`, error.message);
        }
    }
});

// Nightly Expiry Alert Cron Job (Runs at 3:00 AM every day)
cron.schedule('0 3 * * *', async () => {
    console.log('Running nightly FEFO Expiry Alert cron job...');
    try {
        const inventoryModel = require('./models/inventoryModel');
        const fiveDaysFromNow = new Date();
        fiveDaysFromNow.setDate(fiveDaysFromNow.getDate() + 5);

        const expiringUnits = await inventoryModel.aggregate([
            {
                $match: {
                    inventoryType: 'in',
                    availableQuantity: { $gt: 0 },
                    expiryDate: { $gt: new Date(), $lte: fiveDaysFromNow },
                },
            },
            {
                $group: {
                    _id: '$bloodGroup',
                    totalExpiring: { $sum: '$availableQuantity' },
                },
            },
        ]);

        if (expiringUnits.length > 0) {
            const alerts = expiringUnits.map(unit => `${unit.totalExpiring} units of ${unit._id}`);
            console.log(`🚨 ALERT: ${alerts.join(' and ')} are expiring within 5 days!`);
        } else {
            console.log('✅ No blood units are expiring within the next 5 days.');
        }
    } catch (error) {
        console.error('Error in FEFO Expiry Alert cron job:', error.message);
    }
});