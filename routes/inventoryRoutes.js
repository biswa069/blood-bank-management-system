const express = require("express");
const authMiddleware = require("../middlewares/authMiddleware");
const { createInventoryController, getInventoryController, getDonorsController, getHospitalController,
    getOrganisationController,
    getOrganisationForHospitalController,
    getInventoryHospitalController,
    getRecentInventoryController,
    getInventoryReceivedController,
    bulkImportInventoryController,
    getExpiringInventoryController,
} = require("../controllers/inventoryController");
const multer = require("multer");

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post("/create-inventory", authMiddleware, createInventoryController);

//GET ALL BLOOD RECORDS
router.get("/get-inventory", authMiddleware, getInventoryController);

//GET DONAR RECORDS
router.get("/get-donors", authMiddleware, getDonorsController);

router.get("/get-hospitals", authMiddleware, getHospitalController);

router.get("/get-organisation", authMiddleware, getOrganisationController);

router.get(
    "/get-recent-inventory",
    authMiddleware,
    getRecentInventoryController
);

router.get(
    "/get-organisation-for-hospital",
    authMiddleware,
    getOrganisationForHospitalController
);

//GET HOSPITAL BLOOD RECORDSMore actions
router.post(
    "/get-inventory-hospital",
    authMiddleware,
    getInventoryHospitalController
);

//GET HOSPITAL BLOOD RECEIVED (from donors and other hospitals)
router.get(
    "/get-inventory-received",
    authMiddleware,
    getInventoryReceivedController
);

// BULK IMPORT ROUTE
router.post(
    "/bulk-import",
    authMiddleware,
    upload.single("file"),
    bulkImportInventoryController
);
// GET EXPIRING SOON INVENTORY
router.get("/expiring-soon", authMiddleware, getExpiringInventoryController);

module.exports = router;