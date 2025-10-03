"use strict"
const { Schema } = require("mongoose")
const getModel = require("../utils/modelFactory") // Import hàm getModel
const { Integer } = require("read-excel-file")

const DOCUMENT_NAME = "Class"
const COLLECTION_NAME = "classes"

const classSchema = new Schema(
    {
        adminId: { type: String, trim: true },
        centerId: { type: String, trim: true },
        teacherId: { type: String, trim: true },
        class_name: { type: String, trim: true },
    },
    { timestamps: true, collection: COLLECTION_NAME }
)

module.exports = (instanceKey, dbName) => getModel(instanceKey, dbName, DOCUMENT_NAME, classSchema);
