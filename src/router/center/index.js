const express = require("express");
const router = express.Router();
const CenterController = require("~/controllers/center.controller");
const { authentication } = require("~/auth/authUtils");
const { asyncHandler } = require("~/helpers/asyncHandler");
const { checkPermission } = require("~/middlewares/checkRole");

router.use(authentication);
router.post("/", asyncHandler(CenterController.createCenter))

router.put("/", asyncHandler(CenterController.updateCenter))

router.delete("/", asyncHandler(CenterController.deleteCenter))

router.get("/", asyncHandler(CenterController.getCenter))

router.get("/listCenter", asyncHandler(CenterController.getListCenter))





module.exports = router;
