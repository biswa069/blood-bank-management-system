const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

async function check() {
  await mongoose.connect(process.env.MONGO_URL);
  const inventoryModel = require('./models/inventoryModel');
  const userModel = require('./models/userModel');
  
  const orgs = await userModel.find({ role: 'organisation' });
  const hospitals = await userModel.find({ role: 'hospital' });
  
  const users = [...orgs, ...hospitals];
  let found = false;
  
  for (const user of users) {
    const bloodGroup = 'AB+';
    const organisation = user._id;
    let actual_current_stock = 0;
    
    if (user.role === 'hospital') {
      const hospital = user._id;
      const totalInResult = await inventoryModel.aggregate([{ $match: { $or: [{ inventoryType: 'in', organisation: hospital, bloodGroup }, { inventoryType: 'out', hospital: hospital, organisation: { $ne: hospital }, bloodGroup }] } }, { $group: { _id: null, total: { $sum: '$quantity' } } }]);
      const totalOutResult = await inventoryModel.aggregate([{ $match: { $or: [{ inventoryType: 'out', organisation: hospital, hospital: hospital, bloodGroup }, { inventoryType: 'out', sender: null, organisation: hospital, hospital: { $ne: hospital }, bloodGroup }, { inventoryType: 'out', sender: hospital, bloodGroup }] } }, { $group: { _id: null, total: { $sum: '$quantity' } } }]);
      actual_current_stock = (totalInResult[0]?.total || 0) - (totalOutResult[0]?.total || 0);
      
      const totalIn = totalInResult[0]?.total || 0;
      const totalOut = totalOutResult[0]?.total || 0;
      if (totalIn === 19 && totalOut === 19) {
          console.log('Found hospital with 19/19:', user.email, 'actual stock:', actual_current_stock);
          found = true;
      }
    } else {
      const totalIn = await inventoryModel.aggregate([{ $match: { bloodGroup, inventoryType: 'in', organisation } }, { $group: { _id: null, total: { $sum: '$quantity' } } }]);
      const totalOut = await inventoryModel.aggregate([{ $match: { bloodGroup, inventoryType: 'out', organisation } }, { $group: { _id: null, total: { $sum: '$quantity' } } }]);
      actual_current_stock = (totalIn[0]?.total || 0) - (totalOut[0]?.total || 0);
      
      const inQty = totalIn[0]?.total || 0;
      const outQty = totalOut[0]?.total || 0;
      if (inQty === 19 && outQty === 19) {
          console.log('Found org with 19/19:', user.email, 'actual stock:', actual_current_stock);
          found = true;
      }
    }
  }
  if (!found) {
    console.log('No user has 19 total in and 19 total out for AB+');
  }
  console.log('Done checking database directly.');
  process.exit(0);
}
check();
