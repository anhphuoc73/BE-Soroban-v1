const configMathService = require("~/services/configMath.service");
const { OK } = require("~/core/success.response");
const StatusResponse = require("~/utils/statusResponse");

class ConfigMathController {

    configFingerMath = async (req, res, next) => {
        const user = req.user
        return new OK(
            StatusResponse.configMath.UPDATE_CONFIG_MATH,
            await configMathService.updateConfigFingerMath(req.body, user)
        ).send(res)
    }

    practiceFingerMath = async (req, res, next) => {
        const user = req.user
        return new OK(
            StatusResponse.configMath.UPDATE_CONFIG_MATH,
            await configMathService.createPracticeFingerMath({...req.body}, user)
        ).send(res)
    }
    runOperations = async (req, res, next) => {
        const user = req.user
        return new OK(
            StatusResponse.configMath.UPDATE_CONFIG_MATH,
            await configMathService.runOperations({...req.body},)
        ).send(res)
    }

    savePracticeFingerMath = async (req, res, next) => {
        const math = req.body
        const user = req.user
        return new OK(
            StatusResponse.configMath.UPDATE_CONFIG_MATH,
            await configMathService.savePracticeFingerMath(math, user)
        ).send(res)
    }

    historyMathByUser = async (req, res, next) => {
        const user = req.user
        return new OK(
            StatusResponse.configMath.UPDATE_CONFIG_MATH,
            await configMathService.historyMathByUser(req.query, user)
        ).send(res)
    }

    


}

module.exports = new ConfigMathController();
