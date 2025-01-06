const express = require('express')
const morgan = require('morgan')
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')
const cors = require('cors')
const connectDB = require("./config/db");
const blogRoute = require("./routes/blog")
const authRoute =require("./routes/authRoutes")
const userRoute =require("./routes/user")

require('dotenv').config()


const app = express()

app.use(morgan('dev'))
app.use(bodyParser.json())
app.use(cookieParser())
app.use(express.json());
connectDB()

if (process.env.NODE_ENV === 'development') {
    app.use(cors({ origin: `${process.env.CLIENT_URL}` }));
}
// app.use(cors())
app.use("/api",blogRoute)
app.use("/api",authRoute)
app.use("/api",userRoute)



// app.get("/api", (req, res) => {
//     res.json({time : Date().toString()})
// })


const port = process.env.PORT || 8000

app.listen(port, ()=>{
    console.log("App running on port ", port)
})
