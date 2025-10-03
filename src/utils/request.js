const axios = require("axios");
const { URL } = require("~/constants/constant");
const { NotFoundError } = require("~/core/error.response");

async function requestData(ip_pbx, urlKey, body, option) {
    try {
        const formattedURL = URL[urlKey].replace("%s", ip_pbx);
        const res = await axios.post(formattedURL, body, option);
        return res;
    } catch (error) {
        console.log(error);
        throw new NotFoundError(error.message);
    }
}

module.exports = {
    requestData,
};
