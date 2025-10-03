const rbacService = require("~/services/rbac.service");
const { OK } = require("~/core/success.response");
const StatusResponse = require("~/utils/statusResponse");

class RBACController {
    createRole = async (req, res, next) => {
        return new OK(
            StatusResponse.rbac.CREATE_MODULE,
            await rbacService.createRole({
                ...req.body,
                user: req.user,
            })
        ).send(res);
    };

    getRoleById = async (req, res, next) => {
        const roleId = req.params?.id;
        const storeId = req.user?.store_id;
        return new OK(
            StatusResponse.rbac.GET_LIST_ROLE_SUCCESS,
            await rbacService.getRoleById({
                roleId,
                storeId,
            })
        ).send(res);
    };

    getRoleList = async (req, res, next) => {
        const authorities = req.user.authorities;
        const storeId = req.user?.store_id;
        console.log(req.query);
        return new OK(
            StatusResponse.rbac.GET_LIST_ROLE_SUCCESS,
            await rbacService.getRoleList({
                authorities,
                storeId,
                ...req.query,
            })
        ).send(res);
    };

    updateRole = async (req, res, next) => {
        const id = req.params?.id;
        return new OK(
            StatusResponse.rbac.UPDATE_ROLE_GROUP_SUCCESS,
            await rbacService.updateRole({
                ...req.body,
                user: req.user,
                id,
            })
        ).send(res);
    };

    getRoleGroupDetail = async (req, res, next) => {
        const role_group_id = req.params.role_group_id;
        return new OK(
            StatusResponse.rbac.GET_LIST_ROLE_SUCCESS,
            await rbacService.getRoleGroupDetail({
                role_group_id,
            })
        ).send(res);
    };

    createRoleGroup = async (req, res, next) => {
        const authorities = req.user.authorities;
        const createdBy = req.user._id;
        const createdByName = req.user.full_name;
        const storeId = req.user.store_id;
        return new OK(
            StatusResponse.rbac.CREATE_ROLE_GROUP_SUCCESS,
            await rbacService.createRoleGroup({
                authorities,
                createdBy,
                createdByName,
                storeId,
                ...req.body,
            })
        ).send(res);
    };
    createRoleBasicForUserAuth4 = async (req, res, next) => {
        const authorities = req.user.authorities;
        const createdBy = req.user._id;
        const createdByName = req.user.full_name;
        const storeId = req.user.store_id;
        return new OK(
            StatusResponse.rbac.CREATE_ROLE_GROUP_SUCCESS,
            await rbacService.createRoleBasicForUserAuth4({
                authorities,
                createdBy,
                createdByName,
                storeId,
                ...req.body,
            })
        ).send(res);
    };

    deleteRole = async (req, res, next) => {
        const id = req.body.role_id;
        const newId = req.body.new_role_id;
        return new OK(
            StatusResponse.rbac.DELETE_ROLE_GROUP_SUCCESS,
            await rbacService.deleteRole({
                id,
                newId,
                user: req.user,
            })
        ).send(res);
    };

    getRoleGroupList = async (req, res, next) => {
        const authorities = req.user.authorities;
        const storeId = req.user.store_id;
        return new OK(
            StatusResponse.rbac.GET_ROLE_GROUP_LIST_SUCCESS,
            await rbacService.getRoleGroupList({
                authorities,
                storeId,
                ...req.query,
            })
        ).send(res);
    };
}

module.exports = new RBACController();
