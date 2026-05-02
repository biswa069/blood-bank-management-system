const express = require("express");
const authMiddleware = require("../middlewares/authMiddleware");
const {
    bloodGroupDetailsContoller,
    bloodGroupDetailsHospitalContoller,
    getAIForecastController,
} = require("../controllers/analyticsController");

const router = express.Router();

//routes

//GET BLOOD DATA
router.get("/bloodGroups-data", authMiddleware, bloodGroupDetailsContoller);

//GET BLOOD DATA FOR HOSPITAL
router.get("/bloodGroups-data-hospital", authMiddleware, bloodGroupDetailsHospitalContoller);

//GET AI FORECAST
router.post("/ai-forecast", authMiddleware, getAIForecastController);

module.exports = router;