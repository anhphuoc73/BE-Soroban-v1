require("dotenv").config({ path: `.env.${process.env.NODE_ENV}` });

const configGlobal = {
    app: {
        port: process.env.PORT,
        urlApi: process.env.URL,
        clientUrl: process.env.CLIENT_URL,
        client: process.env.CLIENT,
        socket: process.env.SOCKET_URL,
        serverStore : process.env.SERVER_STORE,
        userName : process.env.USER_NAME,
        passwordFtp : process.env.PASSWORD,
        socketClient : process.env.SOCKETCLIENT,
        urlDownload : process.env.URLDOWNLOAD
    },

    dbMongo: {
        primary: {
            host: process.env.MONGODB_HOST,
            username:  process.env.MONGODB_HOSTNAME,
            password: process.env.MONGODB_PASSWORD,
        },
        secondary: {
            host: process.env.MONGODB_HOST,
            username:  process.env.MONGODB_HOSTNAME,
            password: process.env.MONGODB_PASSWORD,
        },
    },

    dbMySqlSlave: {
        host: process.env.MYSQL_HOST_SLAVE,
        user: process.env.MYSQL_HOSTNAME_SLAVE,
        password: process.env.MYSQL_PASSWORD_SLAVE,
        database: process.env.MYSQL_DATABASE_SLAVE,
        port: process.env.MYSQL_PORT_SLAVE,
    },
    dbMySqlMaster: {
        host: process.env.MYSQL_HOST_MASTER,
        user: process.env.MYSQL_HOSTNAME_MASTER,
        password: process.env.MYSQL_PASSWORD_MASTER,
        database: process.env.MYSQL_DATABASE_MASTER,
        port: process.env.MYSQL_PORT_MASTER,
    },

    tokenInfo: {
        privateKey: process.env.PRIVATE_KEY,
        expiresIn: process.env.EXPIRES_IN,
        remoteTokenKey: process.env.REMOTE_TOKEN_KEY
    },

    discord: {
        channelId: process.env.CHANNEL_ID_DISCORD,
        token: process.env.TOKEN_DISCORD,
    },

    redis: {
        host: process.env.IOREDIS_HOST,
        port: process.env.IOREDIS_PORT,
    },

    facebook: {
        urlGraph: process.env.URL_GRAPH_FACEBOOK,
        clientId: process.env.CLIENT_ID_FACEBOOK,
        clientSecret: process.env.CLIENT_SECRET_FACEBOOK
    }

    
};

module.exports = configGlobal;
