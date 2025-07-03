const express = require("express");
const app = express();
const cors = require("cors");
const cookieParser = require("cookie-parser");
const errorMiddleware = require("./middlewares/errorMiddleware");
app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
}));

app.use(express.json({limit:'16kb'}));
app.use(express.urlencoded({ extended: true, limit: '16kb' }));
app.use(cookieParser());


app.use(errorMiddleware)
module.exports = app;