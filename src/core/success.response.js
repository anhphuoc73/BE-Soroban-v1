"use strict";

const StatusCode = {
    OK: 200,
    CREATED: 201,
};
const ReasonStatusCode = {
    CREATED: "Created",
    OK: "Success",
};
class SuccessResponse {
    constructor({
        message,
        statusCode = StatusCode.OK,
        reasonStatusCode = ReasonStatusCode.OK,
        metadata = {},
    }) {
        this.message = !message ? reasonStatusCode : message;
        this.status = statusCode;
        this.metadata = metadata;
    }
    send(res, headers = {}) {
        for (const [key, value] of Object.entries(headers)) {
            res.setHeader(key, value);
        }
        return res.status(this.status).json(this);
    }
}

class OK extends SuccessResponse {
    constructor(message, metadata) {
        super({ message, metadata });
    }
}
class CREATED extends SuccessResponse {
    constructor({
        options = {},
        message,
        statusCode = StatusCode.CREATED,
        reasonStatusCode = ReasonStatusCode.CREATED,
        metadata,
    }) {
        super({ message, statusCode, reasonStatusCode, metadata });
        this.options = options;
    }
}
module.exports = {
    OK,
    CREATED,
    SuccessResponse,
};
