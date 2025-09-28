import User from "../models/user.js";
import jwt from "jsonwebtoken";
import { OAuth2Client } from "google-auth-library";


const client = new OAuth2Client("826256785503-103rge9mri0sn359v4cuehqbirm38rrl.apps.googleusercontent.com");
const generateToken = (userId) => {
    return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN, // Thời hạn của token
    });
};


export const googleSignIn = async (req, res) => {
    const { idToken } = req.body;

    try {
        const ticket = await client.verifyIdToken({
            idToken,
            audience: "826256785503-103rge9mri0sn359v4cuehqbirm38rrl.apps.googleusercontent.com"
        })

        const payload = ticket.payload;
        const googleId = payload.sub;
        const email = payload.email;
        const fullName = payload.name;


        // Kiểm tra user có tồn tại không
        let user = await User.findOne({ googleId });

        // Nếu chưa có user → Tự động đăng ký
        if (!user) {
            user = new User({
                googleId,
                email,
                fullName,
                username: email
            });
            await user.save();
        }

        // Tạo JWT Token
        const token = generateToken(user.id);

        if (user.fullName != null && user.dateOfBirth != null && user.gender != null && user.activityFactor != null && user.records.length > 0) {
            res.status(200).json({ message: 'success', token: token });
        }
        else {
            res.status(202).json({ message: 'success but missing metrics', token: token });
        }


    }
    catch (e) {
        res.status(500).json({ message: e.message });
    }
}

export const register = async (req, res) => {

    const { username, password } = req.body;

    try {
        let user = await User.findOne({ username });
        if (user) {
            return res.status(400).json({ message: 'user already exists' });
        }
        user = new User({ username, password });
        await user.save();

        res.status(200).json({ message: 'success' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}


export const login =  async (req, res) => {
    const { username, password } = req.body;

    try {
        let user = await User.findOne({ username });

        if (!user) {
            return res.status(400).json({ message: 'Incorrect username or password' });
        }

        const isMatch = await user.matchPassword(password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Incorrect username or password' });
        }
        const token = generateToken(user.id);

        if (user.fullName != null && user.dateOfBirth != null && user.gender != null && user.activityFactor != null && user.records.length > 0) {
            res.status(200).json({ message: 'success', token: token });
        }
        else {
            res.status(202).json({ message: 'success but missing metrics', token: token });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }

}

export const logout = async (req, res) => {
    res.status(200).json({ message: 'logout successfully' });
}