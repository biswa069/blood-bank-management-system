const mongoose = require('mongoose');
const dotenv = require('dotenv');
const { getAIForecastController } = require('./controllers/analyticsController');
dotenv.config();

async function test() {
  await mongoose.connect(process.env.MONGO_URL);
  const userModel = require('./models/userModel');
  const org = await userModel.findOne({ email: 'bhp@gmail.com' });
  
  const req = {
      body: { bloodGroup: 'AB+' },
      userId: org._id.toString()
  };
  
  const res = {
      status: function(code) {
          this.statusCode = code;
          return this;
      },
      send: function(data) {
          console.log('Status:', this.statusCode);
          console.log('Data:', JSON.stringify(data, null, 2));
      }
  };
  
  await getAIForecastController(req, res);
  process.exit(0);
}
test();
