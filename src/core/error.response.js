"use strict";
// const StatusCode = {
//     FORBIDDEN:403,
//     CONFLICT:409
// }
const ReasonStatusCode = {
    FORBIDDEN: "Bad Request Error",
    CONFLICT: "Conflict error",
};
const { StatusCodes, ReasonPhrases } = require("../utils/httpStatusCode");
class ErrorResponse extends Error {
    constructor(message, status) {
        super(message);
        this.status = status;
    }
}
class ConflictRequestError extends ErrorResponse {
    constructor(
        message = ReasonStatusCode.CONFLICT,
        statusCode = StatusCodes.CONFLICT
    ) {
        super(message, statusCode);
    }
}
class BadRequestError extends ErrorResponse {
    constructor(
        message = ReasonStatusCode.FORBIDDEN,
        statusCode = StatusCodes.BAD_REQUEST
    ) {
        super(message, statusCode);
    }
}
class ForbiddenRequestError extends ErrorResponse {
    constructor(
        message = ReasonStatusCode.FORBIDDEN,
        statusCode = StatusCodes.FORBIDDEN
    ) {
        super(message, statusCode);
    }
}
class AuthFailureError extends ErrorResponse {
    constructor(
        message = ReasonPhrases.UNAUTHORIZED,
        statusCode = StatusCodes.UNAUTHORIZED
    ) {
        super(message, statusCode);
    }
}
class NotFoundError extends ErrorResponse {
    constructor(
        message = ReasonPhrases.NOT_FOUND,
        statusCode = StatusCodes.NOT_FOUND
    ) {
        super(message, statusCode);
    }
}
class UnprocessableEntityError extends ErrorResponse {
    constructor(
        message = ReasonPhrases.UNPROCESSABLE_ENTITY,
        statusCode = StatusCodes.UNPROCESSABLE_ENTITY,
        errors
    ) {
        super(message, statusCode);
        this.errors = errors;
    }
}

class RedisError extends ErrorResponse {
    constructor(
        message = ReasonPhrases.INTERNAL_SERVER_ERROR,
        statusCode = StatusCodes.INTERNAL_SERVER_ERROR
    ) {
        super(message, statusCode);
    }
}



module.exports = {
    ConflictRequestError,
    BadRequestError,
    AuthFailureError,
    ForbiddenRequestError,
    NotFoundError,
    UnprocessableEntityError,
    RedisError
};
