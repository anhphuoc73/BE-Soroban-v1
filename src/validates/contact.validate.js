const Joi = require("joi");
const { BadRequestError } = require("../core/error.response");

const deleteContactValidation = async (req, res, next) => {
    const correctCondition = Joi.object({
        contact_ids: Joi.array().items(Joi.string(), Joi.number()).required(),
        type: Joi.string().required(),
        filter: Joi.object().optional()
    });

    try {
        await correctCondition.validateAsync(req.body, { abortEarly: false });
        next();
    } catch (error) {
        throw new BadRequestError(error.message);
    }
};

const uploadContact = async (req, res, next) => {
    const excelMimeTypes = [
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "application/vnd.ms-excel",
    ];
    const correctCondition = Joi.object({
        fieldname: Joi.string().required().messages({
            "string.base": "Fieldname phải là một chuỗi",
            "string.empty": "Fieldname không được để trống",
            "any.required": "Fieldname là bắt buộc",
        }),
        originalname: Joi.string().required().messages({
            "string.base": "Originalname phải là một chuỗi",
            "string.empty": "Originalname không được để trống",
            "any.required": "Originalname là bắt buộc",
        }),
        encoding: Joi.string().required().messages({
            "string.base": "Encoding phải là một chuỗi",
            "string.empty": "Encoding không được để trống",
            "any.required": "Encoding là bắt buộc",
        }),
        mimetype: Joi.string()
            .valid(...excelMimeTypes)
            .required()
            .messages({
                "string.base": "Mimetype phải là một chuỗi",
                "string.empty": "Mimetype không được để trống",
                "any.required": "Mimetype là bắt buộc",
                "any.only": "Chỉ chấp nhận tệp Excel (.xlsx hoặc .xls)",
            }),
        size: Joi.number().required().messages({
            "number.base": "Size phải là một số",
            "number.empty": "Size không được để trống",
            "any.required": "Size là bắt buộc",
        }),
        destination: Joi.string().required().messages({
            "string.base": "Destination phải là một chuỗi",
            "string.empty": "Destination không được để trống",
            "any.required": "Destination là bắt buộc",
        }),
        filename: Joi.string().required().messages({
            "string.base": "Filename phải là một chuỗi",
            "string.empty": "Filename không được để trống",
            "any.required": "Filename là bắt buộc",
        }),
        path: Joi.string().required().messages({
            "string.base": "Path phải là một chuỗi",
            "string.empty": "Path không được để trống",
            "any.required": "Path là bắt buộc",
        }),
    });

    try {
        if (!req.file) {
            throw new BadRequestError("Vui lòng chọn tệp tin để tải lên");
        }

        await correctCondition.validateAsync(req.file, { abortEarly: false });
        next();
    } catch (error) {
        throw new BadRequestError(error.message);
    }
};

module.exports = {
    deleteContactValidation,
    uploadContact,
};
