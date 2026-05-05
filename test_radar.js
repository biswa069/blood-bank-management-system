const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

async function test() {
  await mongoose.connect(process.env.MONGO_URL);
  const inventoryModel = require('./models/inventoryModel');
  const userModel = require('./models/userModel');
  
  const stockData = await inventoryModel.aggregate([
      { $match: { bloodGroup: 'AB+' } },
      { $group: { _id: '$organisation', totalIn: { $sum: { $cond: [{ $eq: ['$inventoryType', 'in'] }, '$quantity', 0] } }, totalOut: { $sum: { $cond: [{ $eq: ['$inventoryType', 'out'] }, '$quantity', 0] } } } },
      { $project: { organisation: '$_id', availableStock: { $subtract: ['$totalIn', '$totalOut'] } } }
  ]);
  
  for (const stock of stockData) {
      if (stock.availableStock < 5 && stock.availableStock >= 0) {
          const org = await userModel.findById(stock.organisation);
          console.log('Valid radar entry:', {
              stock: stock.availableStock,
              orgName: org?.organisationName,
              hospName: org?.hospitalName,
              role: org?.role,
              city: org?.city
          });
      }
  }
  process.exit(0);
}
test();
