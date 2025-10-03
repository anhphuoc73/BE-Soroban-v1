const {
    ForbiddenRequestError,
    NotFoundError,
} = require("~/core/error.response");
const StatusResponse = require("~/utils/statusResponse");
const { dateToTimeStamp } = require("~/utils/formatTime");
const { ObjectId } = require("mongodb");
const userService = require("./user.service");
const { removeCache } = require("~/models/repositories/cache.repository");
const getUserModel = require("~/models/user.model");
const { INSTANCE_KEY } = require("~/constants/constant");

class RBACService {
    createRole = async ({ name, permissions, user, description }) => {
        const data = {
            name,
            permissions,
            created_by: user._id,
            updated_by: user._id,
            description,
        };
        const roleModel = getRoleModel(INSTANCE_KEY.PRIMARY, user.store_id);
        if (user?.authorities !== "3") {
            throw new ForbiddenRequestError(
                StatusResponse.common.USER_DOES_NOT_HAVE_PERMISSION
            );
        }
        await roleModel.insertOne(data);
        return true;
    };

    getRoleById = async ({ roleId, storeId }) => {
        const roleModel = getRoleModel(INSTANCE_KEY.PRIMARY, storeId);

        if (!roleId) {
            throw new NotFoundError(StatusResponse.rbac.NOT_FOUND_ROLE_GROUP);
        }
        const foundRole = await roleModel.findOne({
            _id: new ObjectId(roleId),
        });
        if (!foundRole) {
            throw new NotFoundError(StatusResponse.rbac.NOT_FOUND_ROLE_GROUP);
        }

        return foundRole;
    };

    getRoleList = async ({
        authorities,
        storeId,
        limit = 10,
        page = 1,
        sort = { _id: -1 },
        search,
        ...rest
    }) => {
        const roleModel = getRoleModel(INSTANCE_KEY.PRIMARY, storeId);
        const userModel = getUserModel(INSTANCE_KEY.PRIMARY, "admin");
        const skip = (+page - 1) * +limit;

        const filter = {
            ...rest,
        };
        // if (authorities !== "3") {
        //     throw new ForbiddenRequestError(
        //         StatusResponse.common.USER_DOES_NOT_HAVE_PERMISSION
        //     );
        // }
        if (search) {
            filter.name = { $regex: search.toString(), $options: "i" };
        }
        const result = await roleModel
            .aggregate([
                { $match: filter || {} },
                { $sort: sort },
                {
                    $facet: {
                        list: [{ $skip: skip }, { $limit: +limit }],
                        total: [{ $count: "count" }],
                    },
                },
                {
                    $project: {
                        list: "$list",
                        total: { $arrayElemAt: ["$total.count", 0] },
                    },
                },
            ])
            .exec();

        const total = result[0].total || 0;
        const data = total > 0 ? result[0].list : [];

        const userIdList = data.map((item) => item.updated_by);
        const users = await userModel.find(
            { _id: { $in: userIdList }, store_id: storeId },
            "_id full_name"
        );

        const userMap = users.reduce((map, user) => {
            map[user._id.toString()] = user.full_name;
            return map;
        }, {});
        const final = data.map((role) => ({
            ...role,
            updated_by: userMap[role.updated_by] || null,
        }));
        return { total, data: final };
    };

    updateRole = async ({ name, permissions, user, description, id }) => {
        const data = {
            name,
            permissions,
            description,
        };
        const authorities = user?.authorities;
        const storeId = user?.store_id;

        const roleModel = getRoleModel(INSTANCE_KEY.PRIMARY, storeId);

        if (authorities !== "3") {
            throw new ForbiddenRequestError(
                StatusResponse.common.USER_DOES_NOT_HAVE_PERMISSION
            );
        }
        const existingRole = await roleModel.findOne({
            _id: id,
        });

        if (!existingRole) {
            throw new NotFoundError(StatusResponse.rbac.NOT_FOUND_ROLE_GROUP);
        }

        const updatedRole = await roleModel.findByIdAndUpdate(id, data, {
            new: true,
        });

        const keyRoleList = `RoleList-${id}`;

        await removeCache({ key: keyRoleList });
        return updatedRole;
        // const pipeline = [
        //     {
        //         $match: { role_group_id: roleGroupId },
        //     },
        //     {
        //         $addFields: {
        //             userIdStr: { $toString: "$_id" },
        //         },
        //     },
        //     {
        //         $lookup: {
        //             from: "key_tokens",
        //             localField: "userIdStr",
        //             foreignField: "user_id",
        //             as: "tokens",
        //         },
        //     },
        // ];

        // const getUserWithRoleGroup = await dbMaster.aggregate(
        //     "users",
        //     pipeline
        // );

        // const userIds = getUserWithRoleGroup.map((user) => user._id);

        // await dbMaster.updateMany(
        //     "key_tokens",
        //     { user_id: { $in: userIds } },
        //     { $set: { is_reload: true } }
        // );

        // const pipelineNotification = [...pipeline];
        // pipelineNotification[0].$match = {
        //     ...pipelineNotification[0].$match,
        //     $or: [
        //         {
        //             "decentralization_notification.admin_changes_permissions": true,
        //         },
        //         {
        //             "decentralization_notification.admin_changes_permissions": {
        //                 $exists: false,
        //             },
        //         },
        //     ],
        // };
        // const getUserPushNotification = await dbMaster.aggregate(
        //     "users",
        //     pipelineNotification
        // );

        // const userIdsPushNotification = getUserPushNotification.map(
        //     (user) => user._id
        // );

        // const receivers = userIdsPushNotification.map((i) => ({
        //     user_id: i.toString(),
        //     status: "unread",
        //     readAt: null,
        // }));

        // const notification = {
        //     content: "Đã thay đổi quyền của bạn",
        //     storeId,
        //     type: "role",
        //     receivers,
        //     userId: updatedBy,
        //     fullName,
        // };

        // const res = await notificationService.createNotification(notification);

        // return true;
    };

    deleteRole = async ({
        id,
        newId,
        user
    }) => {
        const storeId = user.store_id
        const roleModel = getRoleModel(INSTANCE_KEY.PRIMARY, storeId);

        if (user?.authorities !== "3") {
            throw new ForbiddenRequestError(
                StatusResponse.common.USER_DOES_NOT_HAVE_PERMISSION
            );
        }

        const existingRole = await roleModel.findOne({
            _id: new ObjectId(id),
        });

        if (!existingRole) {
            throw new NotFoundError(StatusResponse.rbac.NOT_FOUND_ROLE_GROUP);
        }

        const foundUserList = await userService.getUserByRoleId({
            roleId: id,
            storeId,
        });

        if (foundUserList && foundUserList.length > 0 && newId) {
            await userService.reassignUsersToRole(
                foundUserList,
                newId
            );
        }

        await roleModel.deleteOne({
            _id: new ObjectId(id),
        });

        const keyRoleList = `RoleList-${id}`;
        await removeCache({ key: keyRoleList });
        return true;
    };

    createDefaultRole = async ({ storeId, user }) => {
        const roleModel = getRoleModel(INSTANCE_KEY.PRIMARY, storeId);
        const data = {
            "name": "Quyền mặc định",
            "description": "",
            "permissions": [
                {
                    "action": "export",
                    "subject": "report-call"
                },
                {
                    "action": "view_individual",
                    "subject": "report-call"
                },
                {
                    "action": "view_individual",
                    "subject": "report-chat"
                },
                {
                    "action": "export",
                    "subject": "report-chat"
                },
                {
                    "action": "view_individual",
                    "subject": "report-ticket"
                },
                {
                    "action": "export",
                    "subject": "report-ticket"
                },
                {
                    "action": "export",
                    "subject": "report-sms/zns"
                },
                {
                    "action": "view_all",
                    "subject": "report-sms/zns"
                },
                {
                    "action": "view_individual",
                    "subject": "message"
                },
                {
                    "action": "view_individual",
                    "subject": "customer"
                },
                {
                    "action": "transfer_customers",
                    "subject": "customer"
                },
                {
                    "action": "export",
                    "subject": "customer"
                },
                {
                    "action": "import",
                    "subject": "customer"
                },
                {
                    "action": "create",
                    "subject": "customer"
                },
                {
                    "action": "update",
                    "subject": "customer"
                },
                {
                    "action": "view_individual",
                    "subject": "ticket"
                },
                {
                    "action": "create",
                    "subject": "ticket"
                },
                {
                    "action": "update",
                    "subject": "ticket"
                },
                {
                    "action": "delete",
                    "subject": "ticket"
                },
                {
                    "action": "create",
                    "subject": "sms/zns"
                },
                {
                    "action": "update",
                    "subject": "sms/zns"
                },
                {
                    "action": "delete",
                    "subject": "sms/zns"
                },
                {
                    "action": "view_all",
                    "subject": "sms/zns"
                },
                {
                    "action": "view_group",
                    "subject": "config-group-staff"
                },
                {
                    "action": "view_individual",
                    "subject": "config-staff"
                },
                {
                    "action": "view_individual",
                    "subject": "config-sms-extension"
                }
            ]
        }
        const exist = await roleModel.findOne();
        if (!exist) {
            await this.createRole({ ...data, user });
        }
        return true
    }
}

module.exports = new RBACService();
