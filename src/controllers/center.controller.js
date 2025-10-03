const centerService = require("~/services/center.service");
const { OK } = require("~/core/success.response");
const StatusResponse = require("~/utils/statusResponse");

class CenterController {
    createCenter = async (req, res, next) => {
        const user = req.user

        return new OK(
            StatusResponse.center.CREATE_CENTER,
            await centerService.createCenter(req.body, user)
        ).send(res)
    }
    updateCenter = async (req, res, next) => {
        const user = req.user
        return new OK(
            StatusResponse.center.UPDATE_CENTER,
            await centerService.updateCenter(req.body, user)
        ).send(res)
    }
    deleteCenter = async (req, res, next) => {
        const user = req.user
        return new OK(
            StatusResponse.center.DELETE_CENTER,
            await centerService.deleteCenter(req.body, user)
        ).send(res)
    }
    getCenter = async (req, res, next) => {
        const user = req.user
        return new OK(
            StatusResponse.center.GET_CENTER,
            await centerService.getCenter(req.query, user)
        ).send(res)
    }
    getListCenter = async (req, res, next) => {
        const user = req.user
        return new OK(
            StatusResponse.center.GET_CENTER,
            await centerService.getListCenter(user)
        ).send(res)
    }
}

module.exports = new CenterController();
