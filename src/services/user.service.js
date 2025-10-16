const { ObjectId } = require("mongodb");
const StatusResponse = require("~/utils/statusResponse");
const {
    ForbiddenRequestError,
    UnprocessableEntityError,
    NotFoundError,
} = require("~/core/error.response");
const rbacService = require("./rbac.service");
const getUserModel = require("~/models/user.model");
const { INSTANCE_KEY } = require("~/constants/constant");
const convertToMD5 = require("~/utils/md5");
const { StatusCodes } = require("~/utils/httpStatusCode");
const sha1 = require("sha1");

const moment = require('moment');
const { Long } = require('mongodb');
const mongoose = require('mongoose');

class UserService {
    fingerMath = async () => {
        const config = {
            "numberQuestion": 5,
            "calculationLength": 2,
            "timePerCalculation": 5,
            "timeAnswer": 5,
            "keyLesson": 4,
            "valueLesson": "Không công thức từ (0-4)",
            "rangeResult": 4,
            "firstNumber": 1,
            "secondNumber": 1,
            "displayStyle": 1,
            "displayStyleName": "chữ số",
            "soundEnabled": 1,
            "soundEnabledName": "có",
            "keyParent": 1,
            "valueParent": "Không công thức",
            "allowExceed": 0,
        }
        return config
    }

    getNameCenterByCenterId = async ({ centerId }) => {
        let query = {
            _id: new ObjectId(centerId)
        }
        const userModel = await getUserModel(INSTANCE_KEY.PRIMARY, "admin")
        const users = await userModel.findOne(query)
        return users?.centerName
    }
    createUser = async ({ fullname, phone, address, expiredDate, birthDay, centerId, position, centerName }, user) => {
        const positionAuth = user?.position
        if (positionAuth !== 2) throw new UnprocessableEntityError('Tài khoản không có quyền tạo người dùng')
        if (!fullname) throw new UnprocessableEntityError('Họ tên không được bỏ trống')
        if (!phone) throw new UnprocessableEntityError('Số điện thoại của trường không được bỏ trống')
        if (position == 3) {
            if (!centerName) throw new UnprocessableEntityError('Tên trung tâm không được bỏ trống')
        }
        if (position == 4 || position == 5) {
            if (!centerId) throw new UnprocessableEntityError('Vai trò chưa được chọn')
            centerName = await this.getNameCenterByCenterId({ centerId })
        }
        if (!expiredDate) throw new UnprocessableEntityError('Ngày hết hạn không được bỏ trống')
        const fingerMath = await this.fingerMath()

        const payload = {
            username: phone,
            password: sha1(convertToMD5(phone)),
            centerName: centerName,
            centerId: centerId,
            fullname: fullname,
            phone: phone,
            address: address,
            position: position,
            active: 1,
            birth_day: moment(birthDay, 'YYYY-MM-DD').format('YYYY-MM-DD'),
            birth_day_time: Long.fromNumber(moment(birthDay, 'YYYY-MM-DD').unix()),
            create_date: moment().format('YYYY-MM-DD HH:mm:ss'),
            create_time: Long.fromNumber(moment().unix()),
            update_date: moment().format('YYYY-MM-DD HH:mm:ss'),
            update_time: Long.fromNumber(moment().unix()),
            expired_date: moment(expiredDate, 'YYYY-MM-DD').endOf('day').format('YYYY-MM-DD HH:mm:ss'),
            expired_time: Long.fromNumber(moment(expiredDate, 'YYYY-MM-DD').endOf('day').unix()),
            finger_math: fingerMath,
            soroban_math: fingerMath,
            // thêm vào đây
            ...(this.fingerMath
                ? { mathTypeId: 1, mathTypeName: "finger" }
                : this.sorobanMath
                    ? { mathTypeId: 2, mathTypeName: "soroban" }
                    : {}),
            totalCorrect: 0,
            totalWrong: 0,
        }
        const userModel = await getUserModel(INSTANCE_KEY.PRIMARY, "admin")
        const checkUser = await userModel.findOne({ phone: phone })
        if (checkUser) throw new UnprocessableEntityError('Số điện thoại tạo tài khoản này đã tồn tại')
        return await userModel.create(payload)
    }
    updateUser = async ({ id, centerId, teacherId, fullname, phone, address, position, expiredDate, birthDay, active }, user) => {
        const positionAuth = user?.position
        if (positionAuth !== 2 && positionAuth !== 3) {
            throw new UnprocessableEntityError('Tài khoản không có quyền sửa thông tin người dùng');
        }
        if (!id) throw new UnprocessableEntityError('id người dùng bị trống')
        let payload = {
            ...(centerId && { centerId }),
            ...(fullname && { fullname }),
            ...(phone && { phone }),
            ...(address && { address }),
            ...(position && { position }),
            ...({ active }),
            ...(position === 5 && teacherId && { teacherId: teacherId }),
            ...(birthDay && { birthDay }),
        };
        payload = Object.fromEntries(
            Object.entries(payload)
                .filter(([key, value]) => value !== undefined && value !== null && value !== '')
        )
        if (Object.keys(payload).length === 0) throw new UnprocessableEntityError('Không có dữ liệu để cập nhật')
        payload = {
            ...payload,
            update_date: moment().format('YYYY-MM-DD HH:mm:ss'),
            update_time: Long.fromNumber(moment().unix()),
            expired_date: moment(expiredDate, 'YYYY-MM-DD').endOf('day').format('YYYY-MM-DD HH:mm:ss'),
            expired_time: Long.fromNumber(moment(expiredDate, 'YYYY-MM-DD').endOf('day').unix()),
            ...(birthDay && {
                birth_day: moment(birthDay).format('YYYY-MM-DD'),
                birth_day_time: Long.fromNumber(moment(birthDay).unix()),
            }),
        }
        const userModel = await getUserModel(INSTANCE_KEY.PRIMARY, "admin")
        const updatedUser = await userModel.findByIdAndUpdate(id, payload, {
            new: true,
        })
        return updatedUser;
    }

    updatePassword = async ({ newPassword, oldPassword }, user) => {
        console.log({ newPassword, oldPassword })
        const id = user._id.toString()
        const username = user.username.toString()

        const userModel = await getUserModel(INSTANCE_KEY.PRIMARY, "admin")
        const checkUser = await userModel.findOne({ username: username });
        const passwordSystem = checkUser?.password
        if (passwordSystem !== sha1(convertToMD5(oldPassword))) throw new UnprocessableEntityError('Mật khẩu cũ không đúng')
        const payload = {
            password: sha1(convertToMD5(newPassword))
        }
        const updatePassword = await userModel.findByIdAndUpdate(id, payload, {
            new: true,
        })
        return updatePassword
    }

    addStudentClass = async ({ id, classId }, user) => {
        const positionAuth = user?.position
        if (positionAuth !== 2) throw new UnprocessableEntityError('Tài khoản không có quyền thêm học sinh vào lớp')
        if (!id) throw new UnprocessableEntityError('id học viên bị trống')
        if (!classId) throw new UnprocessableEntityError('id lớp bị trống')
        let payload = {
            classId
        };
        const userModel = await getUserModel(INSTANCE_KEY.PRIMARY, "admin")
        const addStudentClass = await userModel.findByIdAndUpdate(id, payload, {
            new: true,
        })
        return addStudentClass;
    }
    deleteUser = async ({ id }, user) => {
        const positionAuth = user?.position
        if (positionAuth !== 1) throw new UnprocessableEntityError('Tài khoản không có quyền xóa người dùng')
        if (!id) throw new UnprocessableEntityError('id người dùng bị trống')
        const userModel = await getUserModel(INSTANCE_KEY.PRIMARY, "admin")
        const deleteUser = await userModel.deleteMany({
            _id: id,
        })
        return deleteUser;
    }
    getUser = async ({ page, limit, search, filters }, user) => {


        const skip = (+page - 1) * +limit;

        const positionAuth = user?.position
        if (positionAuth === 5) throw new UnprocessableEntityError('Tài khoản không có quyền xem danh sách người dùng')
        let centerId = ""
        let teacherId = ""
        let query = {}
        if (positionAuth === 2) { // admin
            query.position = { $in: [3, 4, 5] };
        }
        if (positionAuth === 3) { // center ==> trung tâm
            centerId = user?._id.toString()
            query.centerId = new ObjectId(centerId)
            query.position = { $in: [4, 5] };
        }
        if (positionAuth === 4) { // teacher ==> Giáo viên trực thuộc trung tâm
            teacherId = user?._id.toString()
            query.teacherId = new ObjectId(teacherId)
            query.position = { $in: [5] };
        }
        if (search) query.fullname = { $regex: search, $options: 'i' }

        console.log(filters)
        if (filters?.position && filters?.position !== "") {
            const allowedPositions = query.position.$in;
            const filterPosition = Number(filters.position);
            query.position.$in = allowedPositions.filter(p => p === filterPosition);
        }

        if (filters?.centerId && filters.centerId !== "") {
            query.$or = [
                { centerId: filters.centerId },
                { _id: filters.centerId }
            ];
        }

        const userModel = await getUserModel(INSTANCE_KEY.PRIMARY, "admin")
        const users = await userModel.find(query).skip(skip).limit(limit).exec();

        const count = await userModel.countDocuments(query);
        return { data: users, total: count }
    }

    getListUserCenter = async (user) => {
        const positionAuth = user?.position
        if (positionAuth !== 2) throw new UnprocessableEntityError('Tài khoản không có quyền lấy danh sách trung tâm')
        let query = {}
        query.position = 3
        const userModel = await getUserModel(INSTANCE_KEY.PRIMARY, "admin")
        const userCenter = await userModel.find(query)
        const result = userCenter.map(item => ({
            id: item._id.toString(),
            centerName: item.centerName
        }))
        return result
    }
    getListUserTeacher = async (user) => {
        const positionAuth = user?.position
        if (positionAuth !== 3) throw new UnprocessableEntityError('Tài khoản không có quyền lấy danh sách lớp học')

        const centerId = user?._id.toString()
        let query = {}
        query.position = 4
        query.centerId = centerId
        const userModel = await getUserModel(INSTANCE_KEY.PRIMARY, "admin")
        const userCenter = await userModel.find(query)
        const result = userCenter.map(item => ({
            teacherId: item._id.toString(),
            fullname: item.fullname
        }))
        return result
    }

}
module.exports = new UserService();
