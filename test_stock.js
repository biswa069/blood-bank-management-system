const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

async function test() {
  await mongoose.connect(process.env.MONGO_URL);
  const inventoryModel = require('./models/inventoryModel');
  const expiringStock = await inventoryModel.find({ inventoryType: 'in', availableQuantity: { $gt: 0 } });
  console.log('Total IN records with available stock:', expiringStock.length);
  if (expiringStock.length > 0) {
      console.log('Sample expiry date:', expiringStock[0].expiryDate);
  }
  process.exit(0);
}
test();
