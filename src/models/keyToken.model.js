"use strict";
const { Schema } = require("mongoose");
const getModel = require("../utils/modelFactory"); // Import hàm getModel

const DOCUMENT_NAME = "KeyToken";
const COLLECTION_NAME = "key_tokens";

const keyTokenSchema = new Schema(
    {
        is_reload: { type: Boolean, default: false, required: true },
        user_id: { type: Schema.Types.ObjectId, ref: "User", },
        token: { type: String, required: true },
    },
    { timestamps: true, collection: COLLECTION_NAME }
);

module.exports = (instanceKey, dbName) => getModel(instanceKey = "primary", dbName, DOCUMENT_NAME, keyTokenSchema);
