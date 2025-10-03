const fs = require('fs');
const ExcelJS = require('exceljs');
const { ObjectId } = require("mongodb");
const readXlsxFile = require('read-excel-file/node')
const MONGODB = require('../dbs/init.mongdb');
const path = require('path');


async function getClientUpload(id,storeID){
    
    const where = {};
    where["_id"] = new ObjectId(id);
    // await MONGODB.dbMaster.switchDB('crm');
    const data = await MONGODB.dbMaster.getOne('users', where);
    let result = ""
    if(data){
        result = data['full_name'] +'-'+ data['email'];
    }else{
        result = "";
    }
    return result;
}
async function createExcelFile(records,storeID,clientId,name) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    // const excelFilePath = __dirname + '../../../tmp/downloads/' + uniqueSuffix + '.xlsx';
    const downloadsDir = path.join(__dirname, '../../tmp/downloads');
    const excelFilePath = path.join(downloadsDir, `${uniqueSuffix}.xlsx`);
    // Tạo thư mục nếu chưa tồn tại
    if (!fs.existsSync(downloadsDir)) {
        fs.mkdirSync(downloadsDir, { recursive: true });
    }
    const workbook = new ExcelJS.stream.xlsx.WorkbookWriter({
        filename: excelFilePath,
        useStyles: true,
        useSharedStrings: true
    });
    const worksheet = workbook.addWorksheet('Data');

    // Thêm dòng tiêu đề vào sheet
    worksheet.addRow(['Ngày tải lên','Người tải lên','Tên tệp tin','Số điện thoại thất bại','Nguyên nhân thất bại']);

    // Ghi dữ liệu từ MongoDB vào sheet
    for (const record of records) {
        for (const error of record.numbers) {
            const client = await getClientUpload(clientId,storeID)
            const row = worksheet.addRow([record.createdAt,client,name,error,"Số Lỗi"]);
            row.font = { name: 'Times New Roman', size: 12 };
        }
       
    }
    try {
        await workbook.commit();
        console.log('Excel file created successfully');
    } catch (error) {
        console.error('Error committing workbook:', error);
    }
    const fileBuffer = fs.readFileSync(excelFilePath);
    return fileBuffer;
}
async function createExcelFileReportContact(header,data) {
    // console.log("header",header)
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const downloadsDir = path.join(__dirname, '../../tmp/downloads');
    const excelFilePath = path.join(downloadsDir, `${uniqueSuffix}.xlsx`);
    const workbook = new ExcelJS.stream.xlsx.WorkbookWriter({
        filename: excelFilePath,
        useStyles: true,
        useSharedStrings: true
    });
    const worksheet = workbook.addWorksheet('Data');
    const dataHeader = ["Tên nhân viên", ...header.map(item => item.value)];
    // Thêm dòng tiêu đề vào sheet
    const rowHeader = worksheet.addRow(dataHeader);
    rowHeader.font = { name: 'Times New Roman', size: 12 };
    // Ghi dữ liệu từ MongoDB vào sheet
    for (const item of data) {
        const rowData = dataHeader.map(key => {
            if (key === "Tên nhân viên") {
                return item.nameManager ? item.nameManager : "";
            } else {
                return item[key] || 0;
            }
        });
        const row = worksheet.addRow(rowData);
        row.font = { name: 'Times New Roman', size: 12 };
    }

    try {
        await workbook.commit();
        console.log('Excel file created successfully');
    } catch (error) {
        console.error('Error committing workbook:', error);
    }
    const fileBuffer = fs.readFileSync(excelFilePath);

    return fileBuffer;
}
async function createExcelFileKpi(records) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const downloadsDir = path.join(__dirname, '../../tmp/downloads');
    const excelFilePath = path.join(downloadsDir, `${uniqueSuffix}.xlsx`);
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Data');

    // Thêm dòng tiêu đề vào sheet
    const rowHeader = worksheet.addRow(['Đối tượng áp dụng', 'Số lượng thực tế', 'Mục tiêu', 'Tỉ lệ (%)', 'Đánh giá']);
    rowHeader.font = { name: 'Times New Roman', size: 12 };
    // Ghi dữ liệu vào sheet
    for (const record of records) {
        const idParts = record.id.toString().split('-'); 
        const row = worksheet.addRow([
            record.typeKpi,
            record.value,
            record.target,
            record.percent,
            record.rate
        ]);

        // Kiểm tra xem phần sau của id có phải là "0" không
        if (idParts[1] === '0') {
            row.eachCell((cell) => {
                cell.font = {
                    name: 'Times New Roman', // Đặt font là Times New Roman
                    bold: true,               // Tô đậm chữ nếu cần
                    size: 12                  // Có thể thay đổi kích thước nếu muốn
                };
            });
        }else{
            row.eachCell((cell) => {
                cell.font = {
                    name: 'Times New Roman',               
                    size: 12  
                };
            });
        }
    }

    try {
        await workbook.xlsx.writeFile(excelFilePath);
        console.log('Excel file created successfully');
        const fileBuffer = fs.readFileSync(excelFilePath);
        return fileBuffer;
    } catch (error) {
        console.error('Error writing Excel file:', error);
        throw error; // Ném lỗi để xử lý ở phần gọi hàm
    }
}
// async function uploadExcel(filePath) {
//     var objArray = [];
//     readXlsxFile(filePath)
//         .then((rows) => {
//             rows.forEach((row) => {
//                 var obj = { name: row[0], phone: row[1], email: row[2] };
//                 objArray.push(obj);
//             })
//             const users = MONGODB.dbMaster.insertMany('User', objArray);
//             fs.unlink(filePath, (err) => {
//                 if (err) {
//                     console.error('Error deleting file:', err);
//                     return;
//                 }
//                 console.log('File deleted successfully');
//             });

//         })
//         .catch((error) => {
//             console.error('Error reading Excel file:', error);
//         });
// }
module.exports = {
    createExcelFile,
    createExcelFileReportContact,
    createExcelFileKpi,
    getClientUpload
};