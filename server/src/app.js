const express = require("express");
const app = express();
const cors = require("cors");
const cookieParser = require("cookie-parser");
const errorMiddleware = require("./middlewares/errorMiddleware");
const morgan = require("morgan");
app.use(morgan("dev"));
app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
}));

const userRoutes = require('./routes/user.routes')
const taskRoutes = require('./routes/task.routes')

app.use(express.json({limit:'16kb'}));
app.use(express.urlencoded({ extended: true, limit: '16kb' }));
app.use(cookieParser());

app.use("/api/v1/user", userRoutes);
app.use("/api/v1/task", taskRoutes);

app.use(errorMiddleware)
module.exports = app;