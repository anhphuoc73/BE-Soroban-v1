const { request } = require("express");
const _ = require("lodash");
const { Types, default: mongoose } = require("mongoose");
const fs = require("fs");
const Database = require("~/dbs/init.mongodb");
const convertToObjectIdMongodb = (id) => new Types.ObjectId(id);

const getInfoData = ({ fields = [], object = {} }) => {
    return _.pick(object, fields);
};
const removeUnnecessaryFields = ({ fields = [], object = {} }) => {
    return _.omit(object, fields);
};
const getSelectData = (select = []) => {
    return Object.fromEntries(select.map((el) => [el, 1]));
};
const getUnSelectData = (select = []) => {
    return Object.fromEntries(select.map((el) => [el, 0]));
};
const removeUndefinedObject = (obj) => {
    Object.keys(obj).forEach((k) => {
        if (obj[k] == null || obj[k] === undefined) {
            delete obj[k];
        }
    });
    return obj;
};
const updateNestedObjectParser = (obj) => {
    const final = {};
    Object.keys(obj).forEach((k) => {
        console.log(typeof obj[k]);
        if (typeof obj[k] === "object" && !Array.isArray()) {
            const response = updateNestedObjectParser(obj[k]);
            Object.keys(response).forEach((a) => {
                final[`${k}.${a}`] = response[a];
            });
        } else {
            final[k] = obj[k];
        }
    });
    return final;
};

function splitText(text, segmentLength) {
    const splitString = [];
    for (let i = 0; i < text.length; i += segmentLength) {
        splitString.push(text.slice(i, i + segmentLength));
    }
    return splitString;
}

function areArraysEqual(arr1, arr2) {
    if (arr1.length !== arr2.length) {
        return false; // Nếu độ dài hai mảng khác nhau, trả về false ngay lập tức
    }

    return arr1.every((value, index) => value === arr2[index]);
}

const chunkArray = (array, chunkSize) => {
    const chunks = [];
    for (let i = 0; i < array.length; i += chunkSize) {
        chunks.push(array.slice(i, i + chunkSize));
    }
    return chunks;
};

function convertString(str) {
    let lowerCaseStr = str.toLowerCase();
    let convertedStr = lowerCaseStr.replace(/[^a-z0-9]/g, '_');
    return `c_${convertedStr}`;
}

const ensureDirectoryExists = (dir) => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
};

module.exports = {
    getInfoData,
    getSelectData,
    getUnSelectData,
    removeUndefinedObject,
    updateNestedObjectParser,
    convertToObjectIdMongodb,
    removeUnnecessaryFields,
    splitText,
    chunkArray,
    convertString,
    areArraysEqual,
    ensureDirectoryExists,
};
