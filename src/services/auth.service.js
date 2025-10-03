const { signToken } = require("../auth/authUtils");
const { removeUnnecessaryFields } = require("../utils");
const convertToMD5 = require("../utils/md5");
const sha1 = require("sha1");
const { StatusCodes, ReasonPhrases } = require("../utils/httpStatusCode");
const { ObjectId } = require("mongodb");
const moment = require("moment");
const {
    tokenInfo: { privateKey },
} = require("../configs");
const {
    UnprocessableEntityError,
    ForbiddenRequestError,
    NotFoundError,
} = require("~/core/error.response");
const StatusResponse = require("~/utils/statusResponse");
const rbacService = require("./rbac.service");
const {
    removeCache,
    setCacheIoExpiration,
} = require("~/models/repositories/cache.repository");
const { EXPIRATION_IN_SECOND, INSTANCE_KEY } = require("~/constants/constant");
const userService = require("./user.service");
const getUserModel = require("~/models/user.model");

const adminService = require("./admin.service");
const getAdminModel = require("~/models/admin.model");

class AuthService {
    login = async ({ username, password }) => {
        const passwordHash = sha1(convertToMD5(password));
        const userModel = getUserModel(INSTANCE_KEY.PRIMARY, "admin");

        const foundUser = await userModel.findOne({
            username,
            password: passwordHash,
        });
        if (!foundUser) {
            throw new UnprocessableEntityError(
                StatusResponse.auth.EMAIL_OR_PASSWORD_INCORRECT
            );
        }

        if (foundUser.position !== 99) {
            if (foundUser.active !== 1) {
                throw new UnprocessableEntityError(
                    StatusResponse.auth.ACCOUNT_INACTIVE
                );
            }
            const adminId = foundUser?.adminId
            const adminModel = getAdminModel(INSTANCE_KEY.PRIMARY, "admin");
            const admin = await adminModel.findOne({
                _id: new ObjectId(adminId),
            });
            if (admin?.active === 0) {
                throw new UnprocessableEntityError(
                    StatusResponse.auth.ACCOUNT_INACTIVE
                );
            }
        }

        const token = await signToken({
            payload: { id: foundUser._id.toString() },
            privateKey: privateKey,
        });

        return {
            user: foundUser,
            access_token: token,
        };
    };





    forgotPassword = async ({ email }) => {
        const foundUser = await dbMaster.getOne("users", {
            email: email,
        });
        if (!foundUser) {
            throw new UnprocessableEntityError(
                ReasonPhrases.UNPROCESSABLE_ENTITY,
                StatusCodes.UNPROCESSABLE_ENTITY,
                [{ email: StatusResponse.auth.EMAIL_NOT_FOUND }]
            );
        }
        const forgotPasswordToken = await signToken({
            payload: { _id: foundUser._id, email: foundUser.email },
            privateKey: privateKey,
            options: {
                algorithm: "HS256",
                expiresIn: "5m",
            },
        });
        if (!foundUser.id_staff) {
            const userAdmin = await userService.getUserAdmin(
                foundUser?.store_id
            );
            await MailService.sendMail({
                to: foundUser.email,
                subject: "Forgot Password",
                forgotPasswordToken,
                staffId: userAdmin.id_staff,
            });
        } else {
            await MailService.sendMail({
                to: foundUser.email,
                subject: "Forgot Password",
                forgotPasswordToken,
                staffId: foundUser.id_staff,
            });
        }

        const filter = { _id: foundUser._id };
        const options = [
            {
                $set: {
                    forgot_password_token: forgotPasswordToken,
                    updatedAt: "$$NOW",
                },
            },
        ];
        await dbMaster.updateOne("users", filter, options);
        return true;
    };

    resetPassword = async ({ user_id, password }) => {
        const filter = { _id: new ObjectId(user_id) };
        const value = [
            {
                $set: {
                    forgot_password_token: "",
                    password: sha1(convertToMD5(password)),
                    updatedAt: "$$NOW",
                },
            },
        ];
        await dbMaster.updateOne("users", filter, value);

        return true;
    };


    logout = async ({ roleGroupId, authorities }) => {
        return true;
    };



    changePassword = async ({ users, password_old, password_new }) => {
        if (!password_old) {
            throw new NotFoundError(StatusResponse.auth.NOT_FOUND_PASSWORD_OLD);
        }
        const hashPasswordOld = sha1(convertToMD5(password_old));
        const user_id = users._id.toString();
        const foundUser = await dbMaster.getOne("users", {
            _id: new ObjectId(user_id),
            password: hashPasswordOld,
        });
        if (!foundUser) {
            throw new ForbiddenRequestError(
                StatusResponse.auth.PASSWORD_OLD_NOT_MATCH
            );
        }
        if (!password_new) {
            throw new NotFoundError(StatusResponse.auth.NOT_FOUND_PASSWORD_NEW);
        }

        const filter = { _id: new ObjectId(user_id) };
        const value = [
            {
                $set: {
                    password: sha1(convertToMD5(password_new)),
                    updatedAt: "$$NOW",
                },
            },
        ];
        const updatePassword = await dbMaster.updateOne("users", filter, value);

        if (updatePassword.modifiedCount === 1) {
            return true;
        } else {
            throw new ForbiddenRequestError(
                StatusResponse.auth.CHANGE_PASSWORD_FAILED
            );
        }
    };

    changeEmail = async ({ user_id, email_new }) => {
        if (!email_new) {
            throw new NotFoundError(StatusResponse.auth.NOT_FOUND_EMAIL_NEW);
        }
        const filter = { _id: new ObjectId(user_id) };
        const value = [
            {
                $set: {
                    change_email_token: "",
                    email: email_new,
                    updatedAt: "$$NOW",
                },
            },
        ];
        const result = await dbMaster.updateOne("users", filter, value);

        if (result.modifiedCount === 1) {
            return "OK";
        } else {
            throw new ForbiddenRequestError(
                StatusResponse.auth.CHANGE_EMAIL_FAILED
            );
        }
    };
}
module.exports = new AuthService();
