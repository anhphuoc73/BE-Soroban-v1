const { EXPIRATION_IN_SECOND } = require("~/constants/constant");
const { ForbiddenRequestError } = require("~/core/error.response");
const {
    getCacheIo,
    setCacheIoExpiration,
} = require("~/models/repositories/cache.repository");
const rbacService = require("~/services/rbac.service");
const StatusResponse = require("~/utils/statusResponse");

const { AbilityBuilder, Ability } = require('@casl/ability');
const { convertToObjectIdMongodb } = require("~/utils");

const defineAbilityFor = (permissions) => {
    const { can, build } = new AbilityBuilder(Ability);

    permissions.forEach(({ action, subject }) => {
        can(action, subject);
    });

    return build();
};

const checkPermission = (permissions, isCondition) => {
    return async (req, res, next) => {
        const authorities = req.user.authorities;
        const storeId = req.user.store_id;
        const roleId = req.user.role_id.toString();
        if (authorities === "3") return next();

        const keyRoleList = `RoleList-${roleId}`;
        let roleList = await getCacheIo({ key: keyRoleList });

        if (!roleList) {
            roleList = await rbacService.getRoleById({
                storeId,
                roleId,
            });

            setCacheIoExpiration({
                key: keyRoleList,
                value: JSON.stringify(roleList),
                expirationInSecond: EXPIRATION_IN_SECOND,
            });
        } else {
            roleList = JSON.parse(roleList);
        }

        const permissionsUser = roleList?.permissions || []
        const ability = defineAbilityFor(permissionsUser);
        const hasPermission = permissions.some(({ action, subject }) => ability.can(action, subject));
        const permission = permissions.find(({ action, subject }) => ability.can(action, subject));
        if (!hasPermission) {
            throw new ForbiddenRequestError(
                StatusResponse.common.USER_DOES_NOT_HAVE_PERMISSION
            );
        }

        if (isCondition && permission) {
            const query = await handleCondition(permission.action, req.user, permission.subject)
            req.queryCondition = query;
        }

        next();
    };
}
const handleCondition = async (action, user, configType) => {
    if (!user) return {};

    const conditionMap = {
        "config-group-staff": {
            view_all: () => ({}),
            view_group: () => ({ _id: user.staff_group_id })
        },
        "config-extension": {
            view_all: () => ({}),
            view_group: () => ({ sip_number: { $in: user.extensions || [] } }),
            view_individual: () => ({ sip_number: user?.sip_selected })
        },
        "config-staff": {
            view_all: () => ({}),
            view_group: () => ({ staff_group_id: user?.staff_group_id }),
            view_individual: () => ({ _id: convertToObjectIdMongodb(user._id) })
        },
        "config-conversation-message": {
            view_all: () => ({}),
            view_group: () => ({ staff_group_id: user?.staff_group_id }),
            view_individual: () => ({ _id: convertToObjectIdMongodb(user._id) })
        }
    };

    return conditionMap[configType]?.[action]?.() || {};
};

module.exports = { checkPermission };
