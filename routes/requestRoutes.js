const express = require("express");
const authMiddleware = require("../middlewares/authMiddleware");
const {
    createRequestController,
    getActiveRequestsController,
    respondToRequestController,
} = require("../controllers/requestController");

const router = express.Router();

// POST || Create Urgent Request
router.post("/create-request", authMiddleware, createRequestController);

// GET || Get Active Urgent Requests
router.get("/get-active-requests", authMiddleware, getActiveRequestsController);

// POST || Respond to an Urgent Request
router.post("/respond-to-request/:id", authMiddleware, respondToRequestController);

module.exports = router;