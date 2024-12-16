const express = require("express")
const route = express.Router()
const {signup, signin, signout, private, requireSignIn} = require("../controllers/auth")
const runValidation = require("../validators/index")
const { userSignupValidator, userSigninValidator } = require('../validators/auth');

route.post("/signup",userSignupValidator, runValidation, signup )
route.post("/signin",userSigninValidator, runValidation, signin )
route.post("/signout", signout )
route.get("/private",requireSignIn, private)


module.exports = route;
