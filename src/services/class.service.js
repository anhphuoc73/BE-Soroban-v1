const { ObjectId } = require("mongodb");
const StatusResponse = require("~/utils/statusResponse");
const {
    ForbiddenRequestError,
    UnprocessableEntityError,
    NotFoundError,
} = require("~/core/error.response");
const rbacService = require("./rbac.service");
const getClassModel = require("~/models/class.model");
const getUserModel = require("~/models/user.model");
const { INSTANCE_KEY } = require("~/constants/constant");
const convertToMD5 = require("~/utils/md5");
const { StatusCodes } = require("~/utils/httpStatusCode");
const mongoose = require('mongoose');

class ClassService {
    createClass = async ({ teacherId, className }, user) => {
        const positionAuth = user?.position
        if (positionAuth !== 2) throw new UnprocessableEntityError('Tài khoản không có quyền tạo lớp')

        if (!teacherId) throw new UnprocessableEntityError('id giáo viên không được bỏ trống')
        if (!className) throw new UnprocessableEntityError('Tên lớp không được bỏ trống')

        const payload = {
            class_name: className,
            adminId: user?.adminId,
            centerId: user?._id.toString(),
            teacherId: teacherId,
            className: className
        }
        const classModel = await getClassModel(INSTANCE_KEY.PRIMARY, "admin")
        return await classModel.create(payload)
    }
    updateClass = async ({ id, teacherId, className }, user) => {
        const position = user?.position
        if (position !== 2) throw new UnprocessableEntityError('Tài khoản không có quyền cập nhật thông tin lớp')
        if (!id) throw new UnprocessableEntityError('id người dùng bị trống')
        let payload = {
            ...(teacherId && { teacherId }),
            ...(className && { class_name: className })
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
        }
        const classModel = await getClassModel(INSTANCE_KEY.PRIMARY, "admin")
        const updatedClass = await classModel.findByIdAndUpdate(id, payload, {
            new: true,
        })
        return updatedClass;
    }
    deleteClass = async ({ id }, user) => {
        const position = user?.position
        if (position !== 2) throw new UnprocessableEntityError('Tài khoản không có quyền xóa lớp')
        if (!id) throw new UnprocessableEntityError('id người dùng bị trống')
        const classModel = await getClassModel(INSTANCE_KEY.PRIMARY, "admin")
        const deleteClass = await classModel.deleteMany({
            _id: id,
        })
        return deleteClass;
    }
    getClass = async ({ className }, user) => {
        const positionAuth = user?.position
        if (positionAuth !== 2) throw new UnprocessableEntityError('Tài khoản không có quyền lấy danh sách lớp')
        const query = {}
        if (className) query.class_name = { $regex: className, $options: 'i' }

        const classModel = await getClassModel(INSTANCE_KEY.PRIMARY, "admin")
        let classes = await classModel.find(query).lean()

        for (let item of classes) {
            let fullname = await this.getFullNameById({ teacherId: item.teacherId });
            item.fullname = fullname;
            item.className = item.class_name;
        }
        const count = await classModel.countDocuments(query);
        return { data: classes, total: count }
    }
    getFullNameById = async ({ teacherId }) => {
        const userModel = await getUserModel(INSTANCE_KEY.PRIMARY, "admin")
        const user = await userModel.findOne({ position: 3, _id: new ObjectId(teacherId) })
        return user?.fullname || ""
    }

}
module.exports = new ClassService();
