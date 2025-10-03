const express = require("express");
const router = express.Router();
const adminController = require("~/controllers/admin.controller");
const { authentication } = require("~/auth/authUtils");
const { asyncHandler } = require("~/helpers/asyncHandler");


router.use(authentication);
router.post("/", asyncHandler(adminController.createAdmin))

router.put("/", asyncHandler(adminController.updateAdmin))

router.delete("/", asyncHandler(adminController.deleteAdmin))

router.get("/", asyncHandler(adminController.getAdmin))



module.exports = router;
