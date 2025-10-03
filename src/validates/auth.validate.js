const Joi = require("joi");
const { UnprocessableEntityError } = require("../core/error.response");
const { StatusCodes, ReasonPhrases } = require("../utils/httpStatusCode");
const { formatError } = require("../utils/formatError");

const loginValidation = async (req, res, next) => {
    const correctCondition = Joi.object({
        email: Joi.string().email().required().messages({
            "any.required": "Email không được để trống",
            "string.email": "Email không đúng định dạng",
            "string.empty": "Email không đúng định dạng",
        }),
        password: Joi.string().min(6).required().messages({
            "any.required": "Mật khẩu không được để trống",
            "string.min": "Mật khẩu phải lớn hơn 6 ký tự",
            "string.empty": "Mật khẩu phải lớn hơn 6 ký tự",
        }),
    });

    try {
        await correctCondition.validateAsync(req.body, { abortEarly: false });
        next();
    } catch (error) {
        const newErrors = formatError(error);

        throw new UnprocessableEntityError(
            ReasonPhrases.UNPROCESSABLE_ENTITY,
            StatusCodes.UNPROCESSABLE_ENTITY,
            newErrors
        );
    }
};

const forgotPasswordValidation = async (req, res, next) => {
    const correctCondition = Joi.object({
        email: Joi.string().email().required().messages({
            "any.required": "Email không được để trống",
            "string.email": "Email không đúng định dạng",
        }),
    });
    try {
        await correctCondition.validateAsync(req.body, { abortEarly: false });
        next();
    } catch (error) {
        const newErrors = formatError(error);

        throw new UnprocessableEntityError(
            ReasonPhrases.UNPROCESSABLE_ENTITY,
            StatusCodes.UNPROCESSABLE_ENTITY,
            newErrors
        );
    }
};

const resetPasswordValidation = async (req, res, next) => {
    const correctCondition = Joi.object({
        newPassword: Joi.string().min(6).required().messages({
            "any.required": "Mật khẩu không được để trống",
            "string.empty": "Mật khẩu không được để trống",
            "string.min": "Mật khẩu phải lớn hơn 6 ký tự",
        }),
        forgotPasswordToken: Joi.string().required().messages({
            "any.required": "Token không hop le",
        }),
    });
    try {
        await correctCondition.validateAsync(req.body, { abortEarly: false });
        next();
    } catch (error) {
        const newErrors = formatError(error);

        throw new UnprocessableEntityError(
            ReasonPhrases.UNPROCESSABLE_ENTITY,
            StatusCodes.UNPROCESSABLE_ENTITY,
            newErrors
        );
    }
};

const changeEmailValidation = async (req, res, next) => {
    const correctCondition = Joi.object({
        email_new: Joi.string().email().required().messages({
            "any.required": "Email không được để trống",
            "string.email": "Email không đúng định dạng",
        }),
    });
    try {
        await correctCondition.validateAsync(req.body, { abortEarly: false });
        next();
    } catch (error) {
        const newErrors = formatError(error);

        throw new UnprocessableEntityError(
            ReasonPhrases.UNPROCESSABLE_ENTITY,
            StatusCodes.UNPROCESSABLE_ENTITY,
            newErrors
        );
    }
};
module.exports = {
    loginValidation,
    forgotPasswordValidation,
    resetPasswordValidation,
    changeEmailValidation
};
