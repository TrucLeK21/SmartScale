import express from "express";
import User from "../models/user.js";
import jwt from "jsonwebtoken";
import { OAuth2Client } from "google-auth-library";
import { googleSignIn, register, login, logout } from "../controllers/authController.js";


const router = express.Router();
const client = new OAuth2Client("826256785503-103rge9mri0sn359v4cuehqbirm38rrl.apps.googleusercontent.com");
const generateToken = (userId) => {
    return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN, // Thời hạn của token
    });
};

router.post(`/google`, googleSignIn);

router.post(`/register`, register);

router.post('/login', login);

router.post('/logout', logout);

export default router;