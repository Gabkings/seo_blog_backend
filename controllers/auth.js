
const shortId = require('shortid');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const expressJwt = require('express-jwt');
const {expressjwt} = require("express-jwt");

exports.signup = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // Check if the user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                error: 'Email is taken',
            });
        }

        // Generate username and profile
        let username = shortId.generate();
        let profile = `${process.env.CLIENT_URL}/profile/${username}`;

        // Create and save the new user
        const newUser = new User({ name, email, password, profile, username });
        await newUser.save();

        // Success response
        res.json({
            message: 'Signup success! Please sign in.',
        });
    } catch (err) {
        // Error response
        res.status(400).json({
            error: err.message || 'Something went wrong',
        });
    }
};



exports.signin = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validate input
        if (!email || !password) {
            return res.status(400).json({
                error: 'Email and password are required.',
            });
        }

        // Check if user exists
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({
                error: 'User not found. Please sign up.',
            });
        }

        // Authenticate password
        if (!user.authenticate(password)) {
            return res.status(400).json({
                error: 'Incorrect email or password.',
            });
        }

        // Generate a token and send to client
        const token = jwt.sign(
            { _id: user._id },
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );

        // Send cookie
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'development',
            sameSite: 'strict',
            maxAge: 24 * 60 * 60 * 1000, // 1 day
        });

        // Destructure user object for response
        const { _id, username, name, email: userEmail, role } = user;
        return res.status(200).json({
            message: 'Signin successful',
            user: { _id, username, name, email: userEmail, role, token: token },
        });
    } catch (error) {
        console.error('Error during signin:', error);
        return res.status(500).json({
            error: 'Internal server error. Please try again later.',
        });
    }
};

exports.signout = (req, res) =>{
    res.clearCookie("token")
    res.json({
        message : "Signout successss"
    })
}

exports.private = (req, res) =>{
    res.json({
        message: " Auth is successful"
    })
}

exports.requireSignIn = expressjwt({
    secret: '2883127317usgssvzs',
    algorithms: ['HS256'], // Ensure the algorithm matches the one used for signing the JWT
});
