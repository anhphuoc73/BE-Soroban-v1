"use strict";

const mongoose = require("mongoose");
const { dbMongo } = require("~/configs");

class Database {
    constructor(instanceKey = "primary", defaultDB = "admin") {
        this.instanceKey = instanceKey;
        this.connections = {};
        this.defaultDB = defaultDB;
        this.currentDB = defaultDB;
        this.connect(defaultDB);
    }

    connect(dbName) {
        if (this.connections[dbName]) {
            console.log(`✅ Already connected to ${this.instanceKey}/${dbName}`);
            return this.connections[dbName];
        }

        const { host, username, password } = dbMongo[this.instanceKey];

        // const connectString = `mongodb://${username}:${password}@${host}/${dbName}?authSource=admin&directConnection=true`;
        // const connectString = `mongodb://host.docker.internal:27017/${dbName}`;
        const connectString = `mongodb://103.216.118.179:27017/${dbName}`;

        console.log(`🔗 Connecting to MongoDB: ${connectString}`);

        const connection = mongoose.createConnection(connectString, {
            maxPoolSize: 50,
        });

        connection.on("connected", () => {
            console.log(`✅ Connected to MongoDB: ${this.instanceKey}/${dbName}`);
        });

        connection.on("error", (err) => {
            console.error(`❌ MongoDB Connection Error (${this.instanceKey}/${dbName}):`, err);
        });

        this.connections[dbName] = connection;
        return connection;
    }

    switchDatabase(dbName) {
        console.log(`🔄 Switching to database: ${dbName} on instance ${this.instanceKey}`);
        this.currentDB = dbName;
        return this.connect(dbName);
    }

    static getInstance(instanceKey = "primary", defaultDB = "admin") {
        const key = `${instanceKey}_${defaultDB}`;

        if (!Database.instances) {
            Database.instances = {};
        }

        if (!Database.instances[key]) {
            Database.instances[key] = new Database(instanceKey, defaultDB);
        }

        return Database.instances[key];
    }
}

module.exports = Database;
