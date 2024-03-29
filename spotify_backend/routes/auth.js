const express = require('express');
const router = express.Router();
const User = require('../models/User');
const {getToken} = require('../utils/helpers')
const bcrypt = require('bcrypt');

router.post("/register", async (req, res) => {
    const{email, password, firstName, lastName, username} = req.body;

    const user = await User.findOne({email: email});
    if (user) {
        return res.status(403).json({error: "A user with this email already exists"});
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUserData = {email, password: hashedPassword, firstName, lastName, username};
    const newUser = await User.create(newUserData);
    console.log("user");

    const token = await getToken(email, newUser);
    console.log("token");
    const userToReturn = {...newUser.toJSON(), token};
    delete userToReturn.password;
    console.log("completed")
    return res.status(200).json(userToReturn);
});

router.post("/login", async (req, res) => {
    const {email, password} = req.body;
    const user = await User.findOne({email: email});
    if (!user){
        return res.status(403).json({err: "Invalid Credentials"});
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!password){
        return res.status(403).json({err: "Invalid Credentials"});
    }

    const token = await getToken(user.email, user);
    const userToReturn = {...user.toJSON(), token};
    delete userToReturn.password;
    return res.status(200).json(userToReturn);
});

router.post("/logout", async (req, res) => {
        const token = req.cookies.token;

    // If token exists in cookies, you can remove it
    if (token) {
        // Clear the token from cookies
        res.clearCookie(token);
        
        // Optionally, you can also clear the token from session if you're using both session and cookies
        // req.session.token = null;

        // Redirect to home page
        return res.redirect('/home');
    }

    // If token doesn't exist in cookies
    return res.status(400).json({ error: "No token found in cookies" });
});

module.exports = router;