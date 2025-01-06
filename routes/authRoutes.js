const express = require("express")
const route = express.Router()
const {signup, signin, signout, requireSignIn} = require("../controllers/auth")
const runValidation = require("../validators/index")
const { userSignupValidator, userSigninValidator } = require('../validators/auth');

route.post("/signup",userSignupValidator, runValidation, signup )
route.post("/signin",userSigninValidator, runValidation, signin )
route.post("/signout", signout )
// test
route.get('/secret', requireSignIn, (req, res) => {
    res.json({
        user: req.user
    });
});


module.exports = route;
