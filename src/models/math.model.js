"use strict"
const { Schema } = require("mongoose")
const getModel = require("../utils/modelFactory") // Import hàm getModel
const { Integer } = require("read-excel-file")

const DOCUMENT_NAME = "Math"
const COLLECTION_NAME = "maths"

const mathSchema = new Schema(
    {
        userId: { type: String, trim: true },
        math: [
            {
                expression: { type: String, required: true },       // phép toán
                resultExpression: { type: Number, required: true }, // kết quả đúng
                inputResult: { type: Number },                      // kết quả user nhập
                result: { type: Number, enum: [0, 1] }              // 0 = sai, 1 = đúng
            }
        ],
        totalCorrect: { type: Number, trim: true },
        totalWrong: { type: Number, trim: true },
    },
    { timestamps: true, collection: COLLECTION_NAME }
)

module.exports = (instanceKey, dbName) => getModel(instanceKey, dbName, DOCUMENT_NAME, mathSchema);
