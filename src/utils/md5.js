const crypto = require('node:crypto')
function convertToMD5(inputString) {
    // Tạo đối tượng hash MD5
    const md5Hash = crypto.createHash('md5');

    // Cập nhật dữ liệu băm với chuỗi đầu vào
    md5Hash.update(inputString);

    // Lấy giá trị băm dưới dạng hex
    const md5Result = md5Hash.digest('hex');

    return md5Result;
}
module.exports = convertToMD5