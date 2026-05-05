const express = require("express");
const authMiddleware = require("../middlewares/authMiddleware");
const adminMiddleware = require("../middlewares/adminMiddleware");
const userModel = require("../models/userModel");
const { getNotificationLogsController, broadcastAlertController, sendManualNotification } = require("../controllers/notificationController");

const router = express.Router();

// GET Notification Logs
router.get("/logs", authMiddleware, adminMiddleware, getNotificationLogsController);

// POST Broadcast Alert (Admin)
router.post("/broadcast", authMiddleware, adminMiddleware, broadcastAlertController);

// Custom Middleware: Only Organisation or Hospital can dispatch manual notifications
const orgHospitalMiddleware = async (req, res, next) => {
    try {
        const user = await userModel.findById(req.userId);
        if (user.role !== "organisation" && user.role !== "hospital") {
            return res.status(403).send({
                success: false,
                message: "Access Denied. Only Organisations and Hospitals can dispatch manual notifications.",
            });
        }
        next();
    } catch (error) {
        console.error("Auth Role Check Error:", error);
        return res.status(500).send({
            success: false,
            message: "Error in role verification",
            error,
        });
    }
};

// POST Dispatch Manual Notification (Org/Hospital)
router.post("/dispatch-manual", authMiddleware, orgHospitalMiddleware, sendManualNotification);

module.exports = router;
