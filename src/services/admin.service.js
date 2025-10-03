const { ObjectId } = require("mongodb");
const StatusResponse = require("~/utils/statusResponse");
const {
    ForbiddenRequestError,
    UnprocessableEntityError,
    NotFoundError,
} = require("~/core/error.response");
const rbacService = require("./rbac.service");
const getAdminModel = require("~/models/admin.model");
const getUserModel = require("~/models/user.model");
const { INSTANCE_KEY } = require("~/constants/constant");
const { StatusCodes } = require("~/utils/httpStatusCode");

const convertToMD5 = require("~/utils/md5");
const sha1 = require("sha1");


const moment = require('moment');
const { Long } = require('mongodb');
const mongoose = require('mongoose');

class AdminService {
    createUser = async ({ fullname, phone, province, district, ward, address, expiredDate }) => {
        const payload = {
            username: phone,
            password: sha1(convertToMD5(phone)),
            centerId: "",
            fullname: fullname,
            phone: phone,
            province: province,
            district: district,
            ward: ward,
            address: address,
            position: 1,
            active: 1,
            create_date: moment().format('YYYY-MM-DD HH:mm:ss'),
            create_time: Long.fromNumber(moment().unix()),
            update_date: moment().format('YYYY-MM-DD HH:mm:ss'),
            update_time: Long.fromNumber(moment().unix()),
            expired_date: moment(expiredDate, 'YYYY-MM-DD').endOf('day').format('YYYY-MM-DD HH:mm:ss'),
            expired_time: Long.fromNumber(moment(expiredDate, 'YYYY-MM-DD').endOf('day').unix()),
        }
        const userModel = await getUserModel(INSTANCE_KEY.PRIMARY, "admin")
        return await userModel.create(payload)
    }

    createAdmin = async ({ adminName, fullname, phone, province, district, ward, address, expiredDate }, user) => {
        const position = user?.position
        if (position !== 99) throw new UnprocessableEntityError('Tài khoản không có quyền tạo admin')
        if (!adminName) throw new UnprocessableEntityError('Tên trung tâm điều hành không được bỏ trống')
        if (!fullname) throw new UnprocessableEntityError('Họ tên không được bỏ trống')
        if (!phone) throw new UnprocessableEntityError('Số điện thoại của trường không được bỏ trống')
        if (!province) throw new UnprocessableEntityError('Địa chỉ Tỉnh/Thành Phố trường không được bỏ trống')
        if (!district) throw new UnprocessableEntityError('Địa chỉ Quận/Huyện Phố trường không được bỏ trống')
        if (!ward) throw new UnprocessableEntityError('Địa chỉ Phường/Xã Phố trường không được bỏ trống')
        if (!address) throw new UnprocessableEntityError('Địa chỉ của trường không được bỏ trống')
        if (!expiredDate) throw new UnprocessableEntityError('Ngày hết hạn không được bỏ trống')
        const payload = {
            admin_name: adminName,
            fullname: fullname,
            phone: phone,
            province: province,
            district: district,
            ward: ward,
            address: address,
            active: 0,
            create_date: moment().format('YYYY-MM-DD HH:mm:ss'),
            create_time: Long.fromNumber(moment().unix()),
            update_date: moment().format('YYYY-MM-DD HH:mm:ss'),
            update_time: Long.fromNumber(moment().unix()),
            expired_date: moment(expiredDate, 'YYYY-MM-DD').endOf('day').format('YYYY-MM-DD HH:mm:ss'),
            expired_time: Long.fromNumber(moment(expiredDate, 'YYYY-MM-DD').endOf('day').unix()),
        }
        const adminModel = await getAdminModel(INSTANCE_KEY.PRIMARY, "admin")
        await this.createUser({ adminName, fullname, phone, province, district, ward, address, expiredDate })
        return await adminModel.create(payload)
    }
    updateAdmin = async ({ id, adminName, fullname, phone, province, district, ward, address, expiredDate, active }, user) => {
        const position = user?.position
        if (position !== 99) throw new UnprocessableEntityError('Tài khoản không có quyền cập nhật thông tin admin')
        if (!id) throw new UnprocessableEntityError('id admin bị trống')
        let payload = {
            ...(adminName && { admin_name: adminName }),
            ...(fullname && { fullname }),
            ...(phone && { phone }),
            ...(province && { province }),
            ...(district && { district }),
            ...(ward && { ward }),
            ...(address && { address }),
            ...(active !== undefined && { active: +active }),
            ...(expiredDate && {
                expired_date: moment(expiredDate, 'YYYY-MM-DD').endOf('day').format('YYYY-MM-DD HH:mm:ss'),
                expired_time: Long.fromNumber(moment(expiredDate, 'YYYY-MM-DD').endOf('day').unix())
            }),
        }
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
        const adminModel = await getAdminModel(INSTANCE_KEY.PRIMARY, "admin")
        const updatedAdmin = await adminModel.findByIdAndUpdate(id, payload, {
            new: true,
        })
        return updatedAdmin;
    }
    deleteAdmin = async ({ id }, user) => {
        const position = user?.position
        if (position !== 99) throw new UnprocessableEntityError('Tài khoản không có quyền xóa admin')
        if (!id) throw new UnprocessableEntityError('id admin bị trống')
        const adminModel = await getAdminModel(INSTANCE_KEY.PRIMARY, "admin")
        const deleteAdmin = await adminModel.deleteMany({
            _id: id,
        })
        return deleteAdmin;
    }
    getAdmin = async ({ id, page, limit, search }, user) => {
        const position = user?.position

        if (position !== 99) throw new UnprocessableEntityError('Tài khoản không có quyền lấy danh sách admin')
        let query = {}
        if (!page) page = 1
        if (!limit) limit = 10
        const skip = (+page - 1) * +limit;
        if (id) query._id = new ObjectId(id)
        if (search) {
            query.admin_name = { $regex: search, $options: 'i' }
        }
        const adminModel = await getAdminModel(INSTANCE_KEY.PRIMARY, "admin")

        let admin = await adminModel.find(query).skip(+skip).limit(+limit);
        const count = await adminModel.countDocuments(query);
        return { admin, total: count }
    }


}
module.exports = new AdminService();
