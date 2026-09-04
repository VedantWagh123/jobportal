import GovernmentAdmin from "../models/GovernmentAdmin.js";
import bcrypt from 'bcrypt';
import generateAdminToken from "../utils/generateAdminToken.js";

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
            res.json({
                success: true,
                admin: {
                    _id: admin._id,
                    name: admin.name,
                    email: admin.email,
                    role: admin.role,
                    scope: admin.scope
                },
                token: generateAdminToken(admin._id, admin.role, admin.scope)
            });
        } else {
            res.json({ success: false, message: "Invalid email or password" });
        }

    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

// Get Admin Profile (Protected Route)
export const getAdminProfile = async (req, res) => {
    try {
        const admin = req.admin;
        res.json({ success: true, admin });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};
