"use strict";
const mongoose = require("mongoose");
const os = require("os");
const process = require("process");
const _SECOND = 5000;
const countConnect = () => {
    const numConnections = mongoose.connections.length;
    console.log(`Number of connections:${numConnections}`);
};

const checkOverLoad = () => {
    setInterval(() => {
        const countConnections = mongoose.connections.length;
        const numCores = os.cpus.length;
        const memoryUsage = process.memoryUsage().rss;

        const maxConnections = numCores * 5;

        console.log(`Active connection: ${countConnections}`)
        console.log(`Memory Usage: ${memoryUsage /1024/1024}MB`)
        if(countConnections > maxConnections){
            console.log("Connection Overload detected")
        }
    }, _SECOND);
};
module.exports = {
    countConnect,
    checkOverLoad
};