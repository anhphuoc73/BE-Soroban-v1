"use strict"
const { Schema } = require("mongoose")
const getModel = require("../utils/modelFactory") // Import hàm getModel

const DOCUMENT_NAME = "User"
const COLLECTION_NAME = "users"

const userSchema = new Schema(
    {
        username: { type: String, trim: true },
        password: { type: String, trim: true },
        fullname: { type: String, trim: true },
        position: { type: Number, trim: true },
        centerId: { type: String, trim: true },
        teacherId: { type: String, trim: true },
        centerName: { type: String, trim: true },
        principal: { type: String, trim: true, },
        phone: { type: String, required: true },
        address: { type: String, trim: true },
        active: { type: Number, trim: true },
        birth_day: { type: String, trim: true },
        birth_day_time: { type: Number, trim: true },
        create_date: { type: String, trim: true },
        create_time: { type: Number, trim: true },
        update_date: { type: String, trim: true },
        update_time: { type: Number, trim: true },
        expired_date: { type: String, trim: true },
        expired_time: { type: Number, trim: true },
        finger_math: { type: Object, default: {} },
        soroban_math: { type: Object, default: {} },
        totalCorrect: { type: Number, trim: true },
        totalWrong: { type: Number, trim: true },
    },
    { timestamps: true, collection: COLLECTION_NAME }
)

module.exports = (instanceKey, dbName) => getModel(instanceKey, dbName, DOCUMENT_NAME, userSchema);
