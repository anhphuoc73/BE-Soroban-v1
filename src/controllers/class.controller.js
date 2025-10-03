const classService = require("~/services/class.service");
const { OK } = require("~/core/success.response");
const StatusResponse = require("~/utils/statusResponse");
const rbacService = require("~/services/rbac.service");
class ClassController {
    createClass = async (req, res, next) => {
        const user = req.user;
        return new OK(
            StatusResponse.class.CREATE_CLASS,
            await classService.createClass(req.body, user)
        ).send(res)
    }
    // updateClass = async (req, res, next) => {
    //     return new OK(
    //         StatusResponse.class.UPDATE_CLASS,
    //         await classService.updateClass(req.body, user)
    //     ).send(res)
    // }
    // deleteClass = async (req, res, next) => {
    //     return new OK(
    //         StatusResponse.class.DELETE_CLASS,
    //         await classService.deleteClass(req.body, user)
    //     ).send(res)
    // }
    getClass = async (req, res, next) => {
        const user = req.user;
        return new OK(
            StatusResponse.class.GET_CLASS,
            await classService.getClass(req.query, user)
        ).send(res)
    }
}

module.exports = new ClassController();
