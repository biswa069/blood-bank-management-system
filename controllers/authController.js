const userModel = require("../models/userModel");
const bcrypt = require('bcryptjs')
const jwt = require("jsonwebtoken");

const registerController = async (req, res) => {
    try {
        const existingUser = await userModel.findOne({ email: req.body.email })
        //validation
        if (existingUser) {
            return res.status(200).send({
                success: false,
                message: 'User already exists',
            })
        }
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(req.body.password, salt);
        req.body.password = hashedPassword;
        
        // Remove empty strings to prevent Mongoose validation errors (like enum fails on empty bloodGroup)
        Object.keys(req.body).forEach(key => {
            if (req.body[key] === "") {
                delete req.body[key];
            }
        });

        //rest data
        const user = new userModel(req.body);
        await user.save();
        return res.status(201).send({
            success: true,
            message: "User Registered Successfully",
            user
        });

    } catch (error) {
        console.log(error)
        res.status(500).send({
            success: false,
            message: 'Error in Register API',
            error
        })
    }
};

const loginController = async (req, res) => {
    try {
        const user = await userModel.findOne({ email: req.body.email });
        if (!user) {
            return res.status(404).send({
                success: false,
                message: "Invalid Credentials",
            });
        }

        if (user.role !== req.body.role) {
            return res.status(500).send({
                success: false,
                message: "role doesn't match",
            });
        }
        //compare password
        const comparePassword = await bcrypt.compare(
            req.body.password,
            user.password
        );
        if (!comparePassword) {
            return res.status(500).send({
                success: false,
                message: "Invalid Credentials",
            });
        }
        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
            expiresIn: "1d",
        });
        return res.status(200).send({
            success: true,
            message: "Login Successfully",
            token,
            user,
        });
    } catch (error) {
        console.log(error);
        res.status(500).send({
            success: false,
            message: "Error In Login API",
            error,
        });
    }
};

const currentUserController = async (req, res) => {
    try {
        const user = await userModel.findOne({ _id: req.userId });
        return res.status(200).send({
            success: true,
            message: "User Fetched Successfully",
            user,
        });
    } catch (error) {
        console.log(error);
        return res.status(500).send({
            success: false,
            message: "unable to get current user",
            error,
        });
    }
};

// Update user profile
const updateProfileController = async (req, res) => {
    try {
        const user = await userModel.findById(req.userId);
        if (!user) {
            return res.status(404).send({
                success: false,
                message: "User not found",
            });
        }

        const { name, organisationName, hospitalName, email, phone, address, city, currentPassword, newPassword } = req.body;

        // Update basic fields if provided
        if (name) user.name = name;
        if (organisationName) user.organisationName = organisationName;
        if (hospitalName) user.hospitalName = hospitalName;
        if (email) user.email = email;
        if (phone) user.phone = phone;
        if (address) user.address = address;
        if (city !== undefined) user.city = city;

        // Handle password change
        if (currentPassword && newPassword) {
            const isMatch = await bcrypt.compare(currentPassword, user.password);
            if (!isMatch) {
                return res.status(400).send({
                    success: false,
                    message: "Current password is incorrect",
                });
            }
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(newPassword, salt);
        }

        await user.save();

        return res.status(200).send({
            success: true,
            message: "Profile updated successfully",
            user,
        });
    } catch (error) {
        console.log(error);
        return res.status(500).send({
            success: false,
            message: "Error updating profile",
            error,
        });
    }
};

// Update password (separate endpoint)
const updatePasswordController = async (req, res) => {
    try {
        const user = await userModel.findById(req.userId);
        if (!user) {
            return res.status(404).send({
                success: false,
                message: "User not found",
            });
        }

        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).send({
                success: false,
                message: "Both current and new passwords are required",
            });
        }

        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return res.status(400).send({
                success: false,
                message: "Current password is incorrect",
            });
        }

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);
        await user.save();

        return res.status(200).send({
            success: true,
            message: "Password updated successfully. Please log in again.",
        });
    } catch (error) {
        console.log(error);
        return res.status(500).send({
            success: false,
            message: "Error updating password",
            error,
        });
    }
};


module.exports = { registerController, loginController, currentUserController, updateProfileController, updatePasswordController };