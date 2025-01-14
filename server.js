const express = require('express')
const morgan = require('morgan')
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')
const cors = require('cors')
const connectDB = require("./config/db");
const authRoute =require("./routes/authRoutes")
const userRoute =require("./routes/user")
const categoryRoutes = require('./routes/category');
const blogRoutes = require('./routes/blog');
const tagRoutes = require('./routes/tags');

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
app.use("/api",blogRoutes)
app.use("/api",authRoute)
app.use("/api",userRoute)
app.use("/api",categoryRoutes)
app.use("/api",tagRoutes)

const port = process.env.PORT || 8000

app.listen(port, ()=>{
    console.log("App running on port ", port)
})
