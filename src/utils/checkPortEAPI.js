const exec = require("child_process").exec;

const checkPortEAPI = async (ip, port) => {
    return new Promise((resolve, reject) => {
        exec(`curl -i ${ip}:${port}`, (error, stdout, stderr) => {
            if (error) {
                console.log(`error: ${error.message}`);
                resolve(false);
            }
            if (stderr) {
                console.log(`stderr: ${stderr}`);
                resolve(true);
            }
            console.log(`stdout: ${stdout}`);
            resolve(true);
        });
    });
};

const getHostName = async (hostname) => {
    const isPort7227 = await checkPortEAPI(hostname, 7227);
    return isPort7227 ? `${hostname}:7227` : hostname;
};

module.exports = {
    checkPortEAPI,
    getHostName,
};
