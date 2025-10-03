const crypto = require('node:crypto')
const MYSQL = require('../dbs/init.mysql')
async function getInfoUser(inputString) {
    console.log("id:::",inputString)
    const queryFindUser = `SELECT s.contracts_code,s.datacenter, s.agent, d.hostname, d.network_master_lan, d.mongo_cdrdb, d.mongo_cdrdb_private, s.authorities, s.id AS id FROM ask_staff AS s INNER JOIN ask_databases AS d ON s.datacenter = d.id  
    WHERE s.id = ${inputString} AND d.status = 1`;
    const infoData = await MYSQL.dbMasterSQL.query(queryFindUser).execute();
    return infoData;
}
async function convertTypeCall(inputType){
    let result = [];
    if (inputType && inputType.length !== 0) {
        result = inputType.map(item => {  
            switch (item) {
                case "Gọi vào":
                    return "inbound";
                case "Gọi ra":
                    return "outbound";
                case "Nội bộ":
                    return "local";
                case "Tất cả":
                    return ["inbound", "outbound", "local"];
                default:
                    return [];
            }
        }).reduce((acc, val) => acc.concat(val), []); // Hợp nhất mảng thành mảng phẳng
    }
    
    return result;
}
// async function convertStatusCall(inputStatus){
//     switch (inputStatus) {
//         case 'Đã trả lời':
//             return 'ANSWERED';
//         case 'Không nghe máy':
//             return 'NO ANSWER';
//         case 'Máy bận':
//             return 'BUSY';
//         case 'Thất bại':
//             return 'FAILED';
//         case 'Gọi nhỡ':
//             return 'MISSED';
//         default:
//             return ''; // Xử lý trường hợp mặc định nếu không khớp với bất kỳ trường hợp nào
//     }
    
// }
module.exports = {
    getInfoUser: getInfoUser,
    convertTypeCall:convertTypeCall
};