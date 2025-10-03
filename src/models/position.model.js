"use strict"
const { Schema } = require("mongoose")
const getModel = require("../utils/modelFactory") // Import hàm getModel
const { Integer } = require("read-excel-file")

const DOCUMENT_NAME = "Position"
const COLLECTION_NAME = "positions"

const positionSchema = new Schema(
    {
        id: { type: Number, trim: true },
        position: { type: Number, trim: true },
        position_name: { type: String, trim: true },
    },
    { timestamps: true, collection: COLLECTION_NAME }
)

module.exports = (instanceKey, dbName) => getModel(instanceKey, dbName, DOCUMENT_NAME, positionSchema);
