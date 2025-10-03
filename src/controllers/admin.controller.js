const adminService = require("~/services/admin.service");
const { OK } = require("~/core/success.response");
const StatusResponse = require("~/utils/statusResponse");
const rbacService = require("~/services/rbac.service");
class AdminController {
    createAdmin = async (req, res, next) => {
        const user = req.user
        return new OK(
            StatusResponse.admin.CREATE_ADMIN,
            await adminService.createAdmin(req.body, user)
        ).send(res)
    }
    updateAdmin = async (req, res, next) => {
        const user = req.user
        return new OK(
            StatusResponse.admin.UPDATE_ADMIN,
            await adminService.updateAdmin(req.body, user)
        ).send(res)
    }
    deleteAdmin = async (req, res, next) => {
        const user = req.user
        return new OK(
            StatusResponse.admin.DELETE_ADMIN,
            await adminService.deleteAdmin(req.body, user)
        ).send(res)
    }
    getAdmin = async (req, res, next) => {

        const user = req.user
       
        return new OK(
            StatusResponse.admin.GET_ADMIN,
            await adminService.getAdmin(req.query, user)
        ).send(res)
    }
}

module.exports = new AdminController();
