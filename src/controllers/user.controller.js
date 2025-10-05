const userService = require("~/services/user.service");
const { OK } = require("~/core/success.response");
const StatusResponse = require("~/utils/statusResponse");

class UserController {
    createUser = async (req, res, next) => {
        const user = req.user
        const position = req.body?.position

        return new OK(
            position == 3 ? StatusResponse.user.CREATE_CENTER : StatusResponse.user.CREATE_USER,
            await userService.createUser(req.body, user)
        ).send(res)
    }
    updateUser = async (req, res, next) => {
        const user = req.user
        return new OK(
            StatusResponse.user.UPDATE_USER,
            await userService.updateUser(req.body, user)
        ).send(res)
    }

    updateUser = async (req, res, next) => {
        const user = req.user
        return new OK(
            StatusResponse.user.UPDATE_USER,
            await userService.updatePassword(req.body, user)
        ).send(res)
    }

    addStudentClass = async (req, res, next) => {
        const user = req.user
        return new OK(
            StatusResponse.user.ADD_STUDENT_CLASS,
            await userService.addStudentClass(req.body, user)
        ).send(res)
    }
    deleteUser = async (req, res, next) => {
        const user = req.user
        return new OK(
            StatusResponse.user.DELETE_USER,
            await userService.deleteUser(req.body, user)
        ).send(res)
    }
    getUser = async (req, res, next) => {
        // console.log(req.query)
        const user = req.user
        return new OK(
            StatusResponse.user.GET_USER,
            await userService.getUser(req.query, user)
        ).send(res)
    }
    getListUserCenter = async (req, res, next) => {
        const user = req.user
        return new OK(
            StatusResponse.user.GET_USER,
            await userService.getListUserCenter(user)
        ).send(res)
    }
    getListUserTeacher = async (req, res, next) => {
        const user = req.user
        return new OK(
            StatusResponse.user.GET_USER,
            await userService.getListUserTeacher(user)
        ).send(res)
    }
}

module.exports = new UserController();
