"use strict";

const Database = require("~/dbs/init.mongodb");

const modelCache = {}; // Cache model theo instance + database

const getModel = (instanceKey = "primary", dbName, modelName, schema) => {
    const cacheKey = `${instanceKey}_${dbName}`;

    if (!modelCache[cacheKey]) {
        modelCache[cacheKey] = {};
    }

    if (!modelCache[cacheKey][modelName]) {
        const dbInstance = Database.getInstance(instanceKey);
        const dbConnection = dbInstance.switchDatabase(dbName);
        modelCache[cacheKey][modelName] = dbConnection.model(modelName, schema);
    }

    return modelCache[cacheKey][modelName];
};

module.exports = getModel;
