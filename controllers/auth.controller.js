import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "1d" });

}

// Register a new user
    export const register = async (req, res) => {
        try {
        const { fullName, email, password, profileImageUrl } = req.body;

        // validate
        if (!fullName || !email || !password) {
            return res.status(400).json({ message: "All fields are required" });
        }

        // check if user already exists
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: "User already exists" });
        }

        // create user
        const user = await User.create({ fullName, email, password, profileImageUrl });
        res.status(201).json({
            _id: user._id,
            fullName: user.fullName,
            email: user.email,
            profileImageUrl: user.profileImageUrl,
            token: generateToken(user._id),
        });
    } catch (error) {
        res.status(500).json({ message: 'Error registering user', error: error.message });
    }
}

    // Login a user
    export const login = async (req, res) => {
        const { email, password } = req.body;

        // validate
        if (!email || !password) return res.status(400).json({ message: "All fields are required" });

        try {
            const user = await User.findOne({ email });
            if (!user || !(await user.comparePassword(password))) return res.status(400).json({ message: "Invalid credentials" });

            res.status(200).json({
                _id: user._id,
                user,
                token: generateToken(user._id),
            });
        } catch (error) {
            res.status(500).json({ message: 'Error logging in', error: error.message });
        }
    }

    // Get a user
    export const getUser = async (req, res) => {
        try {
            const user = await User.findById(req.user.id).select("-password");
            if (!user) return res.status(404).json({ message: "User not found" });

            res.status(200).json(user);
        } catch (error) {
            res.status(500).json({ message: 'Error getting user', error: error.message });
        }
    }