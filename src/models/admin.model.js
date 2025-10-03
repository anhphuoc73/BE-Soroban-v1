"use strict"
const { Schema } = require("mongoose")
const getModel = require("../utils/modelFactory") // Import hàm getModel

const DOCUMENT_NAME = "Admin"
const COLLECTION_NAME = "admins"

const adminSchema = new Schema(
    {
        id: { type: String, trim: true },
        position: { type: Number, trim: true },
        admin_name: { type: String, trim: true },
        fullname: { type: String, trim: true },
        phone: { type: String, required: true },
        province: { type: String, trim: true },
        district: { type: String, trim: true },
        ward: { type: String, trim: true },
        address: { type: String, trim: true },
        active: { type: Number, trim: true },
        create_date: { type: String, trim: true },
        create_time: { type: Number, trim: true },
        update_date: { type: String, trim: true },
        update_time: { type: Number, trim: true },
        expired_date: { type: String, trim: true },
        expired_time: { type: Number, trim: true },
    },
    { timestamps: true, collection: COLLECTION_NAME }
)

module.exports = (instanceKey, dbName) => getModel(instanceKey, dbName, DOCUMENT_NAME, adminSchema);
