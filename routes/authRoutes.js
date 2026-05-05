const express = require('express')
const { registerController, loginController, currentUserController, updateProfileController, updatePasswordController } = require('../controllers/authController');
const authMiddleware = require('../middlewares/authMiddleware');

const router = express.Router()

router.post("/register", registerController);

router.post("/login", loginController);

router.get("/current-user", authMiddleware, currentUserController);

router.put("/update-profile", authMiddleware, updateProfileController);

router.put("/update-password", authMiddleware, updatePasswordController);

module.exports = router;