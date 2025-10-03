const redis = require("redis");
const {
    REDIS_CONNECT_MESSAGE,
    REDIS_CONNECT_TIMEOUT,
} = require("~/constants/constant");
const { RedisError } = require("~/core/error.response");

// redis.createClient({
//     host, port, password, username
// })
const {
    redis: { host, port },
} = require("../configs");
let client = {};

const statusConnectRedis = {
    CONNECT: "connect",
    END: "end",
    RECONNECT: "reconnect",
    ERROR: "error",
};

let connectionTimeout;

const handleTimeoutError = () => {
    connectionTimeout = setTimeout(() => {
        throw new RedisError(
            REDIS_CONNECT_MESSAGE.message.vn,
            REDIS_CONNECT_MESSAGE.code
        );
    }, REDIS_CONNECT_TIMEOUT);
};

const handleEventConnection = ({ connectionRedis }) => {
    connectionRedis.on(statusConnectRedis.CONNECT, () => {
        console.log(`connectionRedis - connection  status: connected`);
        clearTimeout(connectionTimeout);
    });
    connectionRedis.on(statusConnectRedis.END, () => {
        console.log(`connectionRedis - connection  status: disconnected`);
        //retry
        handleTimeoutError();
    });
    connectionRedis.on(statusConnectRedis.RECONNECT, () => {
        console.log(`connectionRedis - connection  status: reconnect`);
        clearTimeout(connectionTimeout);
    });
    connectionRedis.on(statusConnectRedis.ERROR, (err) => {
        console.log(`connectionRedis - connection  status: err ${err}`);
        handleTimeoutError();
    });
};

const initRedis = () => {
    const instanceRedis = redis.createClient({
        url: `redis://${host}:${port}`,
    });
    client.instanceConnect = instanceRedis;
    handleEventConnection({ connectionRedis: instanceRedis });
};

const getRedis = () => client;

const closeRedis = () => {
    if (client.instanceConnect) {
        client.instanceConnect.quit((err) => {
            if (err) {
                console.log(`Error closing Redis connection: ${err}`);
            } else {
                console.log("Redis connection closed successfully.");
            }
        });
    } else {
        console.log("No Redis connection found to close.");
    }
};

// const {getRedis} = require()
// const {instanceConnect: redisClient} = getRedis()

module.exports = { initRedis, getRedis, closeRedis };
