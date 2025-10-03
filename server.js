const app = require("./src/app");
const {
    app: { port},
} = require("./src/configs");

const clients = new Map();
global.clients = clients

const server = app.listen(port, () => {
    console.log(`WSV start with ${port}`);
});

process.on("SIGINT", () => {
    server.close(() => console.log("Exit Server Express"));
});
