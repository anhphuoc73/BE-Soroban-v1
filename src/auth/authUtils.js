"use strict";
const JWT = require("jsonwebtoken");
const { asyncHandler } = require("../helpers/asyncHandler");
const {
    AuthFailureError,
    BadRequestError,
    ConflictRequestError,
} = require("../core/error.response");
// const { dbMaster } = require("../dbs/init.mongdb");
const {
    tokenInfo: { expiresIn, privateKey, remoteTokenKey },
} = require("../configs");
const { ObjectId } = require("mongodb");
const StatusResponse = require("~/utils/statusResponse");
const { getCacheIo } = require("~/models/repositories/cache.repository");
const { StatusCodes } = require("~/utils/httpStatusCode");
const getUserModel = require("~/models/user.model");
const getKeyTokenModel = require("~/models/keyToken.model");
const { INSTANCE_KEY } = require("~/constants/constant");
const HEADERS = {
    API_KEY: "x-api-key",
    AUTHORIZATION: "authorization",
    CLIENT_ID: "x-client-id",
    REFRESHTOKEN: "x-rtoken-id",
};
const createTokenPair = async (payload, publicKey, privateKey) => {
    try {
        const accessToken = await JWT.sign(payload, publicKey, {
            expiresIn: "2 days",
        });
        const refreshToken = await JWT.sign(payload, privateKey, {
            expiresIn: "7 days",
        });
        JWT.verify(accessToken, publicKey, (err, decode) => {
            if (err) {
                console.error(`error verify::`, err);
            } else {
                console.log(`decode verify::`, decode);
            }
        });
        return { accessToken, refreshToken };
    } catch (error) {
        return {
            code: "xxx5",
            message: error.message,
            status: "error",
        };
    }
};

const authentication = asyncHandler(async (req, res, next) => {
    try {
        const userModel = getUserModel(INSTANCE_KEY.PRIMARY, "admin");
        const generateJWT = req.headers[HEADERS.AUTHORIZATION];
        if (!generateJWT)
            throw new AuthFailureError(StatusResponse.common.TOKEN_NOT_VALID);

        const accessToken = generateJWT.split(" ")[1];
        const decodeUser = JWT.verify(accessToken, privateKey);


        const foundUser = await userModel.findOne({
            _id: new ObjectId(decodeUser.id),
        });
        req.user = foundUser;

        next();
    } catch (error) {
        if (error.status === StatusCodes.CONFLICT) {
            throw new ConflictRequestError(error.message);
        }
        throw new AuthFailureError(StatusResponse.common.TOKEN_NOT_VALID);
    }
});
const verifyJWT = async ({ token, keySecret }) => {
    return await JWT.verify(token, keySecret);
};

const signToken = ({
    payload,
    privateKey,
    options = { algorithm: "HS256", expiresIn: expiresIn },
}) => {
    return new Promise((resolve, reject) => {
        JWT.sign(payload, privateKey, options, (error, token) => {
            if (error) {
                throw reject(error);
            }
            return resolve(token);
        });
    });
};

const veriForgotPasswordToken = async (req, res, next) => {
    const forgotPasswordToken = req.body.forgotPasswordToken;
    if (!forgotPasswordToken) {
        throw new BadRequestError("Cập nhật không thành công");
    }

    const decoded_forgot_password_token = await verifyJWT({
        token: forgotPasswordToken.toString(),
        keySecret: privateKey,
    }).catch((error) => {
        throw new BadRequestError("Cập nhật không thành công");
    });

    const { _id: user_id } = decoded_forgot_password_token;
    const foundUser = await dbMaster.getOne("users", {
        _id: new ObjectId(user_id),
    });
    if (!foundUser) {
        throw new BadRequestError("User not found");
    }
    if (foundUser.forgot_password_token !== forgotPasswordToken) {
        throw new BadRequestError("Cập nhật không thành công");
    }
    req.decoded_forgot_password_token = decoded_forgot_password_token;
    next();
};

const veriChangeEmailToken = async (req, res, next) => {
    const changeEmailToken = req.body.changeEmailToken;
    if (!changeEmailToken) {
        throw new BadRequestError("Cập nhật không thành công");
    }

    const decoded_change_email_token = await verifyJWT({
        token: changeEmailToken.toString(),
        keySecret: privateKey,
    }).catch((error) => {
        throw new BadRequestError("Cập nhật không thành công");
    });

    const { _id: user_id } = decoded_change_email_token;
    console.log("user_iduser_iduser_iduser_iduser_iduser_iduser_iduser_iduser_iduser_iduser_iduser_id", user_id)
    const foundUser = await dbMaster.getOne("users", {
        _id: new ObjectId(user_id),
    });
    if (!foundUser) {
        throw new BadRequestError("User not found");
    }
    if (foundUser.change_email_token !== changeEmailToken) {
        throw new BadRequestError("Cập nhật không thành công");
    }
    req.decoded_change_email_token = decoded_change_email_token;
    next();
};

const verifyRemoteToken = async (req, res, next) => {
    const remoteToken = req.body.remote_token;
    if (!remoteToken) {
        throw new BadRequestError("Đăng nhập không thành công");
    }

    const decoded_remote_token = await verifyJWT({
        token: remoteToken.toString(),
        keySecret: remoteTokenKey,
    }).catch((error) => {
        throw new BadRequestError("Đăng nhập không thành công");
    });

    req.decoded_remote_token = decoded_remote_token;
    next();
};

module.exports = {
    createTokenPair,
    authentication,
    verifyJWT,
    veriForgotPasswordToken,
    veriChangeEmailToken,
    verifyRemoteToken,
    signToken,
};
