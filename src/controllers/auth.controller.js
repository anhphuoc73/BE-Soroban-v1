const AuthService = require("~/services/auth.service");
const { OK } = require("~/core/success.response");
const StatusResponse = require("~/utils/statusResponse");

class AuthController {
    login = async (req, res, next) => {
        return new OK(
            StatusResponse.auth.LOGIN_SUCCESS,
            await AuthService.login(req.body)
        ).send(res);
    };
    forgotPassword = async (req, res, next) => {
        return new OK(
            StatusResponse.auth.CHECK_EMAIL_TO_RESET_PASSWORD,
            await AuthService.forgotPassword(req.body)
        ).send(res);
    };
    resetPassword = async (req, res, next) => {
        const { _id } = req.decoded_forgot_password_token;
        return new OK(
            StatusResponse.auth.RESET_PASSWORD_SUCCESS,
            await AuthService.resetPassword({
                password: req.body.newPassword,
                user_id: _id,
            })
        ).send(res);
    };
    logout = async (req, res, next) => {
        const userId = req.user._id;
        const authorities = req.user.authorities;
        return new OK(
            StatusResponse.auth.LOGOUT_SUCCESS,
            await AuthService.logout({ userId, authorities })
        ).send(res);
    };
    changePassword = async (req, res, next) => {
        const users = req.user;
        const password_old = req.body.password_old;
        const password_new = req.body.password_new;
        const password_confirm = req.body.password_confirm;
        if (password_new !== password_confirm) {
            return new OK(
                StatusResponse.auth.CONFIRM_PASSWORD_NOT_MATCH,
                "Confirm password is not match"
            ).send(res);
        }
        return new OK(
            StatusResponse.auth.CHANGE_PASSWORD_SUCCESS,
            await AuthService.changePassword({ users, password_old, password_new })
        ).send(res);
    };
   
}

module.exports = new AuthController();
