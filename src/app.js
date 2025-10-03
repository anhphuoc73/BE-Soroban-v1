require("dotenv").config();
const express = require("express");
const morgan = require("morgan");
const compression = require("compression");
const { default: helmet } = require("helmet");

const path = require("path");
const cors = require("cors");
const initIORedis = require("./dbs/init.ioredis");
const { ensureDirectoryExists } = require("./utils");

const app = express();

app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

const uploadDir = path.join(__dirname, "..", "tmp", "uploads");
const downloadDir = path.join(__dirname, "..", "tmp", "downloads");

ensureDirectoryExists(uploadDir);
ensureDirectoryExists(downloadDir);

//init middlewares
//===================Init middleware======================
app.use(morgan("short"));
app.use(helmet());
app.use(compression());

//init db
require("./dbs/init.mongodb");


//init routes
app.use("/", require("./router"));

//handleing error
app.use((req, res, next) => {
    const error = new Error("Not Found");
    error.status = 404;
    next(error);
});
app.use((error, req, res, next) => {
    const statusCode = error.status || 500;
    const paramError = {
        stack: error.stack,
        status: "error",
        code: statusCode,
        message: error.message || "Internal Sever Error",
        ...error,
    };

    return res.status(statusCode).json(paramError);
});

module.exports = app;
