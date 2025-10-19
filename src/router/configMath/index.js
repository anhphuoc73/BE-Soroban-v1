const express = require("express");
const router = express.Router();
const configMathController = require("~/controllers/configMath.controller");
const { authentication } = require("~/auth/authUtils");
const { asyncHandler } = require("~/helpers/asyncHandler");
const { checkPermission } = require("~/middlewares/checkRole");
router.post("/practice-finger-math", asyncHandler(configMathController.practiceFingerMath))
router.post("/practice-finger-math-list", asyncHandler(configMathController.runOperations))

router.use(authentication);

router.put("/config-finger-math", asyncHandler(configMathController.configFingerMath))


router.post("/save-practice-finger-math", asyncHandler(configMathController.savePracticeFingerMath))

router.get("/history-math-by-user", asyncHandler(configMathController.historyMathByUser))





module.exports = router;
