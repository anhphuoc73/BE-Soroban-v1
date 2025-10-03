const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        console.log("file",file)
        cb(null, "tmp/uploads/"); // Lưu vào thư mục uploads
    },
    filename: (req, file, cb) => {
        cb(null, Date.now()+'-'+ file.originalname); // Đổi tên file tránh trùng
    },
});

const upload = multer({ storage: storage });

module.exports = upload;