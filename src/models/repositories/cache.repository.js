const { RedisError } = require("~/core/error.response");
const { getIORedis } = require("~/dbs/init.ioredis");
const redisCache = getIORedis().instanceConnect;

const setCacheIO = async ({ key, value }) => {
    if (redisCache) {
        throw new RedisError("Redis client not initialized");
    }
    try {
        return await redisCache.set(key, value);
    } catch (error) {
        throw new RedisError(error.message);
    }
};

const setCacheIoExpiration = async ({ key, value, expirationInSecond }) => {
    try {
        return await redisCache.set(key, value, "EX", expirationInSecond);
    } catch (error) {
        throw new RedisError(error.message);
    }
};

const getCacheIo = async ({ key }) => {
    try {
        return await redisCache.get(key);
    } catch (error) {
        throw new RedisError(error.message);
    }
};

const removeCache = async ({ key }) => {
    try {
        return await redisCache.del(key);
    } catch (error) {
        throw new RedisError(error.message);
    }
};

module.exports = { setCacheIO, setCacheIoExpiration, getCacheIo,removeCache };
