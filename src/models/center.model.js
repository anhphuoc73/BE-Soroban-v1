"use strict";
const { Schema } = require("mongoose");
const getModel = require("../utils/modelFactory"); // Import hàm getModel
const { Integer } = require("read-excel-file");

const DOCUMENT_NAME = "Center";
const COLLECTION_NAME = "centers";

const centerSchema = new Schema(
    {
        adminId: { type: String, trim: true },
        school_name: { type: String, trim: true },
        principal: { type: String, trim: true, },
        phone: { type: String, required: true },
        province: { type: String, trim: true },
        district: { type: String, trim: true },
        ward: { type: String, trim: true },
        address: { type: String, trim: true },
        create_date: { type: String, trim: true },
        create_time: { type: Number, trim: true },
        update_date: { type: String, trim: true },
        update_time: { type: Number, trim: true },
        expired_date: { type: String, trim: true },
        expired_time: { type: Number, trim: true },
        active: { type: Number },
    },
    { timestamps: true, collection: COLLECTION_NAME }
);

module.exports = (instanceKey, dbName) => getModel(instanceKey, dbName, DOCUMENT_NAME, centerSchema);
