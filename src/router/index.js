"use strict";
const express = require("express");
const router = express.Router();
const multer = require("multer");
const { app: { urlApi }, } = require("../configs");

router.use(`${urlApi}/auth`, require("./auth"));


router.use(`${urlApi}/admin`, require("./admin"));
router.use(`${urlApi}/center`, require("./center"));
router.use(`${urlApi}/user`, require("./user"));

router.use(`${urlApi}/configMath`, require("./configMath"));


router.use(`${urlApi}/class`, require("./class"));







module.exports = router;
