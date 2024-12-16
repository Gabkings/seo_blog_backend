const express = require("express")
const route = express.Router()
const {time} = require("../controllers/blog")
route.get("/", time )


module.exports = route;
