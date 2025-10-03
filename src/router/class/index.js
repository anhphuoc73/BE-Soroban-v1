const express = require("express")
const router = express.Router()
const classController = require("~/controllers/class.controller")
const { authentication } = require("~/auth/authUtils")
const { asyncHandler } = require("~/helpers/asyncHandler")

router.use(authentication)

router.post("/", asyncHandler(classController.createClass))

// router.put("/", asyncHandler(classController.updateClass))

// router.delete("/", asyncHandler(classController.deleteClass))

router.get("/", asyncHandler(classController.getClass))





module.exports = router;
