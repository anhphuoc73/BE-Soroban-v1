const express = require("express");
const router = express.Router();
const configMathController = require("~/controllers/configMath.controller");
const { authentication } = require("~/auth/authUtils");
const { asyncHandler } = require("~/helpers/asyncHandler");
const { checkPermission } = require("~/middlewares/checkRole");

router.use(authentication);

router.put("/config-finger-math", asyncHandler(configMathController.configFingerMath))

router.post("/practice-finger-math", asyncHandler(configMathController.practiceFingerMath))

router.post("/save-practice-finger-math", asyncHandler(configMathController.savePracticeFingerMath))





module.exports = router;
