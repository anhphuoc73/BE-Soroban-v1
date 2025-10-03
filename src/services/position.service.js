const { ObjectId } = require("mongodb");
const StatusResponse = require("~/utils/statusResponse");
const {
    ForbiddenRequestError,
    UnprocessableEntityError,
    NotFoundError,
} = require("~/core/error.response");

const getPositionModel = require("~/models/position.model");
const { INSTANCE_KEY } = require("~/constants/constant");

class PositionService {
    createPosition = async ({ position, positionName }) => {
        // root: 99, 
        // admin: 1, 
        // center: 2
        // teacher: 3
        // student: 4
        if (!position) throw new UnprocessableEntityError('position không được bỏ trống')
        if (!positionName) throw new UnprocessableEntityError('positionName không được bỏ trống')

        const payload = {
            position: position,
            position_name: positionName,
        }
        const positionModel = await getPositionModel(INSTANCE_KEY.PRIMARY, "admin")
        return await positionModel.create(payload)
    }


}
module.exports = new PositionService();
