const { create } = require("lodash");
const { INSTANCE_KEY } = require("~/constants/constant");
const {
    ForbiddenRequestError,
    NotFoundError,
    UnprocessableEntityError,
} = require("~/core/error.response");
const getCenterModel = require("~/models/center.model");
const getUserModel = require("~/models/user.model");
const moment = require('moment');
const { Long } = require('mongodb');

const convertToMD5 = require("~/utils/md5");
const sha1 = require("sha1");


class CenterService {
    createUser = async ({ fullname, phone, adminId, province, district, ward, address, expiredDate }) => {
        const payload = {
            username: phone,
            password: sha1(convertToMD5(phone)),
            adminId: adminId,
            centerId: "",
            fullname: fullname,
            phone: phone,
            province: province,
            district: district,
            ward: ward,
            address: address,
            position: 2,
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
    createCenter = async ({ schoolName, principal, phone, province, district, ward, address, expiredDate }, user) => {
        const position = user?.position
        if (position !== 1) throw new UnprocessableEntityError('Tài khoản không có quyền tạo trung tâm')
        if (!schoolName) throw new UnprocessableEntityError('Tên trường không được bỏ trống')
        if (!principal) throw new UnprocessableEntityError('Tên người đướng đầu trung tâm không được bỏ trống')
        if (!phone) throw new UnprocessableEntityError('Số điện thoại của trường không được bỏ trống')
        if (!province) throw new UnprocessableEntityError('Địa chỉ Tỉnh/Thành Phố trường không được bỏ trống')
        if (!district) throw new UnprocessableEntityError('Địa chỉ Quận/Huyện Phố trường không được bỏ trống')
        if (!ward) throw new UnprocessableEntityError('Địa chỉ Phường/Xã Phố trường không được bỏ trống')
        if (!address) throw new UnprocessableEntityError('Địa chỉ của trường không được bỏ trống')
        if (!expiredDate) throw new UnprocessableEntityError('Ngày hết hạn không được bỏ trống')
        const adminId = user?._id.toString();

        const payload = {
            adminId: adminId,
            school_name: schoolName,
            principal: principal,
            phone: phone,
            province: province,
            district: district,
            ward: ward,
            address: address,
            create_date: moment().format('YYYY-MM-DD HH:mm:ss'),
            create_time: Long.fromNumber(moment().unix()),
            update_date: moment().format('YYYY-MM-DD HH:mm:ss'),
            update_time: Long.fromNumber(moment().unix()),
            expired_date: moment(expiredDate, 'YYYY-MM-DD').endOf('day').format('YYYY-MM-DD HH:mm:ss'),
            expired_time: Long.fromNumber(moment(expiredDate, 'YYYY-MM-DD').endOf('day').unix()),
        }
        const centerModel = await getCenterModel(INSTANCE_KEY.PRIMARY, "admin")
        const createCenter = await centerModel.create(payload)
        const centerId = createCenter._id.toString();
        await this.createUser({ fullname: principal, phone, adminId, centerId, province, district, ward, address, expiredDate })
        return createCenter
    }

    updateCenter = async ({ id, schoolName, phone, principal, province, district, ward, address, expiredDate, active }, user) => {
        const position = user?.position
        if (position !== 1) throw new UnprocessableEntityError('Tài khoản không có quyền tạo trung tâm')
        if (!id) throw new UnprocessableEntityError('id trung tâm - trường bị trống')
        let payload = {
            ...(schoolName && { school_name: schoolName }),
            ...(principal && { principal }),
            ...(phone && { phone }),
            ...(province && { province }),
            ...(district && { district }),
            ...(ward && { ward }),
            ...(address && { address }),
            ...({ active })
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
        }

        const centerModel = await getCenterModel(INSTANCE_KEY.PRIMARY, "admin")
        const updatedCenter = await centerModel.findByIdAndUpdate(id, payload, {
            new: true,
        })
        return updatedCenter;
    }

    deleteCenter = async ({ id }, user) => {
        const position = user?.position
        if (position !== 1) throw new UnprocessableEntityError('Tài khoản không có quyền tạo trung tâm')
        if (!id) throw new UnprocessableEntityError('id trung tâm - trường bị trống')
        const centerModel = await getCenterModel(INSTANCE_KEY.PRIMARY, "admin")
        const deleteCenter = await centerModel.deleteMany({
            _id: id,
        })
        return deleteCenter;
    }

    getCenter = async ({ id, search }, user) => {
        const position = user?.position
        if (position !== 1) throw new UnprocessableEntityError('Tài khoản không có quyền lấy danh sách trung tâm')
        const adminId = user?._id.toString();

        let query = {
            adminId: adminId
        }
        if (search) {
            query.school_name = { $regex: search, $options: 'i' }
        }
        const centerModel = await getCenterModel(INSTANCE_KEY.PRIMARY, "admin")
        const center = await centerModel.find(query)
        const count = await centerModel.countDocuments(query);
        return { center, total: count }
    }

    getListCenter = async (user) => {
        const position = user?.position
        if (position !== 1) throw new UnprocessableEntityError('Tài khoản không có quyền lấy danh sách trung tâm')
        const adminId = user?._id.toString();

        let query = { adminId: adminId }

        const centerModel = await getCenterModel(INSTANCE_KEY.PRIMARY, "admin")
        const center = await centerModel.find(query)

        const filteredData = center.map(item => ({
            id: item._id,
            school_name: item.school_name
        }));

        return filteredData
    }

}

module.exports = new CenterService();
