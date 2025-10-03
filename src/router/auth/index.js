"use strict";
const express = require("express");
const router = express.Router();
const authController = require("~/controllers/auth.controller");
const { asyncHandler } = require("~/helpers/asyncHandler");
const { authentication, verifyRemoteToken } = require("~/auth/authUtils");
const {
    loginValidation,
    resetPasswordValidation,
    forgotPasswordValidation,
    changeEmailValidation
} = require("~/validates/auth.validate");
const { veriForgotPasswordToken, veriChangeEmailToken } = require("~/auth/authUtils");

router.post(
    "/login",
    asyncHandler(authController.login)
);
router.post(
    "/login-remote",
    asyncHandler(verifyRemoteToken),
    asyncHandler(authController.loginRemote)
);
router.post(
    "/forgot-password",
    asyncHandler(forgotPasswordValidation),
    asyncHandler(authController.forgotPassword)
);
router.post(
    "/reset-password",
    asyncHandler(resetPasswordValidation),
    asyncHandler(veriForgotPasswordToken),
    asyncHandler(authController.resetPassword)
);
router.post(
    "/change-email-employee",
    asyncHandler(veriChangeEmailToken),
    asyncHandler(authController.changeEmailEmployee)
);

router.use(authentication);

router.post(
    "/logout",
    asyncHandler(authController.logout)
);
router.post(
    "/key-tokens",
    asyncHandler(authController.updateKeyTokens)
);
router.post(
    "/change-password",
    asyncHandler(authController.changePassword)
);
router.post(
    "/send-mail-change-email-employee",
    // asyncHandler(changeEmailValidation),
    asyncHandler(authController.sendMailChangeEmailEmployee)
);
router.post(
    "/send-mail-change-email",
    asyncHandler(changeEmailValidation),
    asyncHandler(authController.sendMailChangeEmail)
);
router.post(
    "/change-email",
    asyncHandler(veriChangeEmailToken),
    asyncHandler(authController.changeEmail)
);


module.exports = router;
