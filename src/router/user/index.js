const express = require("express");
const router = express.Router();
const userController = require("~/controllers/user.controller");
const { authentication } = require("~/auth/authUtils");
const { asyncHandler } = require("~/helpers/asyncHandler");
const { checkPermission } = require("~/middlewares/checkRole");

router.use(authentication);
router.post("/", asyncHandler(userController.createUser))

router.put("/", asyncHandler(userController.updateUser))

router.put("/update-password", asyncHandler(userController.updatePassword))

router.put("/add-student-class", asyncHandler(userController.addStudentClass))

router.delete("/", asyncHandler(userController.deleteUser))

router.get("/", asyncHandler(userController.getUser))

router.get("/get-list-user-center", asyncHandler(userController.getListUserCenter))

router.get("/get-list-user-teacher", asyncHandler(userController.getListUserTeacher))





module.exports = router;
