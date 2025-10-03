const Redis = require("ioredis");
const {
    REDIS_CONNECT_MESSAGE,
    REDIS_CONNECT_TIMEOUT,
} = require("~/constants/constant");
const { RedisError } = require("~/core/error.response");

const {
    redis: { host, port },
} = require("../configs");

let clients = {};

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
        console.log(`connectionIORedis - connection  status: connected`);
        clearTimeout(connectionTimeout);
    });
    connectionRedis.on(statusConnectRedis.END, () => {
        console.log(`connectionIORedis - connection  status: disconnected`);
        //retry
        handleTimeoutError();
    });
    connectionRedis.on(statusConnectRedis.RECONNECT, () => {
        console.log(`connectionIORedis - connection  status: reconnect`);
        clearTimeout(connectionTimeout);
    });
    connectionRedis.on(statusConnectRedis.ERROR, (err) => {
        console.log(`connectionIORedis - connection  status: err ${err}`);
        handleTimeoutError();
    });
};

const init = ({
    IOREDIS_IS_ENABLED,
    // IOREDIS_HOST = process.env.REDIS_CACHE_HOST,
    // IOREDIS_PORT = 6379,
}) => {
    if (IOREDIS_IS_ENABLED) {
        const instanceRedis = new Redis({
            host,
            port,
            db: 1,
        });
        // const instanceRedis = new Redis("rediss://default:Abs0AAIjcDFjMmJjOGJhNjAyNTQ0YmMzOGQ4MThkZGMxMDc0YmM5ZnAxMA@relative-rooster-47924.upstash.io:6379");
        clients.instanceConnect = instanceRedis;
        handleEventConnection({ connectionRedis: instanceRedis });
    }
};

const getIORedis = () => clients;

const closeIORedis = () => {
    if (clients.instanceConnect) {
        clients.instanceConnect.quit((err) => {
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

module.exports = { init, getIORedis, closeIORedis };
