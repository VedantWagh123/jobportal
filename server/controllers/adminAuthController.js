import GovernmentAdmin from "../models/GovernmentAdmin.js";
import bcrypt from 'bcryptjs';
import generateAdminToken from "../utils/generateAdminToken.js";
import jwt from "jsonwebtoken";

// Login Admin
export const loginAdmin = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.json({ success: false, message: "Email and password are required" });
    }

    try {
        const admin = await GovernmentAdmin.findOne({ email });

        if (!admin) {
            return res.json({ success: false, message: "Invalid email or password" });
        }

        if (!admin.isActive) {
            return res.json({ success: false, message: "Account is inactive. Please contact support." });
        }

        const isMatch = await bcrypt.compare(password, admin.passwordHash);

        if (isMatch) {
            const { accessToken, refreshToken } = generateAdminToken(admin._id, admin.role, admin.scope);
            
            admin.refreshTokens = admin.refreshTokens || [];
            admin.refreshTokens.push(refreshToken);
            await admin.save();

            res.cookie('jwt', refreshToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
            });

            res.json({
                success: true,
                admin: {
                    _id: admin._id,
                    name: admin.name,
                    email: admin.email,
                    role: admin.role,
                    scope: admin.scope
                },
                token: accessToken
            });
        } else {
            res.json({ success: false, message: "Invalid email or password" });
        }

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get Admin Profile (Protected Route)
export const getAdminProfile = async (req, res) => {
    try {
        const admin = req.admin;
        res.json({ success: true, admin });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Refresh Admin Token
export const refreshAdminToken = async (req, res) => {
    try {
        const refreshToken = req.cookies.jwt;
        if (!refreshToken) return res.status(401).json({ success: false, message: 'Unauthorized - No Refresh Token' });

        const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);
        const admin = await GovernmentAdmin.findById(decoded.id);

        if (!admin || !admin.refreshTokens.includes(refreshToken)) {
            return res.status(401).json({ success: false, message: 'Unauthorized - Invalid Refresh Token' });
        }

        const accessToken = jwt.sign({ id: admin._id, role: admin.role, scope: admin.scope }, process.env.JWT_SECRET, { expiresIn: '15m' });
        res.json({ success: true, token: accessToken });
    } catch (error) {
        res.status(401).json({ success: false, message: 'Unauthorized - Token Expired or Invalid' });
    }
};
