const positionService = require("~/services/position.service");
const { OK } = require("~/core/success.response");
const StatusResponse = require("~/utils/statusResponse");
const rbacService = require("~/services/rbac.service");
class PositionController {
    createPosition = async (req, res, next) => {
        return new OK(
            StatusResponse.position.CREATE_POSITION,
            await positionService.createPosition(req.body)
        ).send(res)
    }
}

module.exports = new PositionController();
