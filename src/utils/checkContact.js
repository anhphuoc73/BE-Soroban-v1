const { BadRequestError } = require("~/core/error.response");

const Mobile = {
    87: "ITEL",
    32: "Viettel",
    33: "Viettel",
    34: "Viettel",
    35: "Viettel",
    36: "Viettel",
    37: "Viettel",
    38: "Viettel",
    39: "Viettel",
    86: "Viettel",
    96: "Viettel",
    97: "Viettel",
    98: "Viettel",
    868: "Viettel",
    76: "Mobiphone",
    72: "Mobiphone",
    77: "Mobiphone",
    78: "Mobiphone",
    79: "Mobiphone",
    70: "Mobiphone",
    89: "Mobiphone",
    90: "Mobiphone",
    93: "Mobiphone",
    81: "Vinaphone",
    82: "Vinaphone",
    83: "Vinaphone",
    84: "Vinaphone",
    85: "Vinaphone",
    88: "Vinaphone",
    91: "Vinaphone",
    94: "Vinaphone",
    52: "Vietnamobile",
    56: "Vietnamobile",
    58: "Vietnamobile",
    92: "Vietnamobile",
    59: "Gmobile",
    95: "Gmobile",
    99: "Gmobile",
};

const Landline = {
    4: "VTC",
    1: "CMC",
    3: "FPT",
    7: "ITEL",
    5: "SPT",
    2: "Viettel",
    6: "Viettel",
    9: "GTEL",
    8: "VNPT",
};

const province_code = [
    ...range(203, 209),
    ...range(210, 216),
    ...range(218, 222),
    ...range(225, 229),
    ...range(232, 239),
    ...range(241, 249),
    ...range(251, 252),
    ...range(254, 263),
    ...range(269, 277),
    ...range(281, 289),
    ...range(290, 294),
    ...range(296, 297),
    299,
    190,
    180,
    274,
    650,
];

const telco_code = [
    ...range(32, 39),
    52,
    56,
    58,
    59,
    70,
    ...range(76, 79),
    ...range(81, 89),
    ...range(90, 99),
    868,
];

function checkPhoneContact(str = "") {
    let cached = {
        input: str,
        validate: "",
        code: "",
        telco: "",
        prefix: "",
        output: "",
        number: "",
        isValid: false,
    };

    if (!str) return cached;

    str = str.toString().trim().replace("+84", "0");

    // New handling for "84" prefix
    if (str.startsWith("84") && str.length > 2) {
        str = "0" + str.slice(2);
    }

    str = str.replace(/[^0-9]/g, "");
    str = parseInt(str, 10).toString(); // Ensure it's treated as a string of digits

    if (str.length > 8) {
        cached.number = str.slice(-7);
        str = str.slice(0, -7);

        if (str.length <= 4) {
            return handleShortPrefix(cached, str);
        } else if (str.startsWith("84")) {
            return handleLongPrefix(cached, str.slice(-3));
        }
    } else {
        return invalidNumber(cached);
    }
    return invalidNumber(cached);
}

function handleShortPrefix(cached, str) {
    if (str.length === 1) {
        return handleSingleDigitPrefix(cached, str);
    } else if (str.length === 2) {
        return handleDoubleDigitPrefix(cached, str);
    } else if (str.length === 3) {
        return handleTripleDigitPrefix(cached, str);
    }
    return invalidNumber(cached);
}

function handleSingleDigitPrefix(cached, str) {
    const number = str + cached.number;
    if (["1900", "1800", "1234", "1122"].includes(number.slice(0, 4))) {
        cached.output = str + cached.number;
        cached.validate = "ATA";
        cached.code = "VNTA/ATA";
        cached.prefix = number.slice(0, 4);
        cached.telco = number.slice(0, 4);
        cached.isValid = true;
    } else {
        cached.output = str + cached.number;
        cached.validate = "GETWAY";
        cached.code = "VNTA/GETWAY";
        cached.prefix = str;
        cached.telco = "GETWAY";
        cached.isValid = true;
    }
    return cached;
}

function handleDoubleDigitPrefix(cached, str) {
    if (telco_code.includes(parseInt(str))) {
        cached.output = "0" + str + cached.number;
        cached.validate = "PHONE";
        cached.code = "VNTA/Mobile";
        cached.prefix = str;
        cached.telco = Mobile[parseInt(str)] || "";
        cached.isValid = true;
    } else if ([24, 28].includes(parseInt(str))) {
        cached.output = "0" + str + cached.number;
        cached.validate = "PHONE";
        cached.code = "VNTA/Landline";
        cached.prefix = str;
        cached.telco = Landline[cached.number[0]] || "";
        cached.isValid = true;
    } else {
        cached.output = str + cached.number;
        cached.validate = "GETWAY";
        cached.code = "VNTA/GETWAY";
        cached.prefix = str;
        cached.telco = "GETWAY";
        cached.isValid = false;
    }
    return cached;
}

function handleTripleDigitPrefix(cached, str) {
    if (province_code.includes(parseInt(str))) {
        cached.output = "0" + str + cached.number;
        cached.validate = "PHONE";
        cached.code = "VNTA/Landline";
        cached.prefix = str;
        cached.telco = Landline[cached.number[0]] || "";
        cached.isValid = true;
        if ([180, 190].includes(parseInt(str))) {
            cached.output = str + cached.number;
            cached.code = "VNTA/ATA";
            cached.prefix = cached.output.slice(0, 4);
            cached.telco = cached.output.slice(0, 4);
        }
    } else if (telco_code.includes(parseInt(str))) {
        cached.output = "0" + str + cached.number;
        cached.validate = "PHONE";
        cached.code = "VNTA/Mobile";
        cached.prefix = str;
        cached.telco = Mobile[parseInt(str.slice(-2))] || "";
        cached.isValid = true;
    }
    return cached;
}

function handleLongPrefix(cached, str) {
    if (province_code.includes(parseInt(str))) {
        cached.output = "0" + str + cached.number;
        cached.validate = "PHONE";
        cached.code = "VNTA/Landline";
        cached.prefix = str;
        cached.telco = Landline[cached.number[0]] || "";
        cached.isValid = true;
        if ([180, 190].includes(parseInt(str))) {
            cached.output = str + cached.number;
            cached.code = "VNTA/ATA";
            cached.prefix = cached.output.slice(0, 4);
            cached.telco = cached.output.slice(0, 4);
        }
    } else if (telco_code.includes(parseInt(str))) {
        cached.output = "0" + str + cached.number;
        cached.validate = "PHONE";
        cached.code = "VNTA/Mobile";
        cached.prefix = str;
        cached.telco = Mobile[parseInt(str.slice(-2))] || "";
        cached.isValid = true;
    }
    return cached;
}

function invalidNumber(cached) {
    cached.isValid = false;
    return cached;
}

function range(start, end) {
    return Array.from({ length: end - start + 1 }, (v, k) => k + start);
}

function removeDuplicatePhones(array) {
    let phoneTracker = {};
    let uniqueArr = [];
    let duplicateArr = [];
    if (!array[0]?.system_phone) {
        throw new BadRequestError(
            "Tệp tin sai định dạng hoặc không có dữ liệu"
        );
    }
    array.forEach((item) => {
        if (!phoneTracker[item.system_phone]) {
            phoneTracker[item.system_phone] = true;
            uniqueArr.push(item);
        } else {
            duplicateArr.push(item);
        }
    });

    return {
        unique: uniqueArr,
        duplicate: duplicateArr,
    };
}

function checkPhoneError(phoneList) {
    const contactErrorList = [];
    const contactNoErrorList = [];
    phoneList.forEach((phone) => {
        const checkPhone = checkPhoneContact(phone.system_phone);
        if (!checkPhone.isValid && phone.system_phone.toString().trim()) {
            contactErrorList.push({
                ...phone,
                system_phone: checkPhone.output,
                system_telco: checkPhone.telco
            });
        } else {
            contactNoErrorList.push({
                ...phone,
                system_phone: checkPhone.output,
                system_telco: checkPhone.telco
            });
        }

        return checkPhone.isValid;
    });
    return {
        contactErrorList,
        contactNoErrorList,
    };
}

function checkPhoneVNTA(phone) {
    let b = "";
    if (phone) {
        if (phone.startsWith("84")) {
            phone = "0" + phone.slice(2); // Remove "84" and prepend "0"
        }
        if (parseInt(phone.substr(0, 1)) === 0 && phone.length === 10) {
            b = phone;
        } else {
            if (
                parseInt(phone.substr(0, 1)) !== 0 &&
                parseInt(phone.substr(0, 1)) !== 1
            ) {
                phone = "0" + phone;
                if (phone.length === 10) {
                    b = phone;
                }
            } else {
                if (
                    parseInt(phone.substr(0, 4)) === 1800 ||
                    parseInt(phone.substr(0, 4)) === 1900
                ) {
                    b = phone;
                } else {
                    if (phone.length === 10) {
                        b = phone;
                    }
                }
            }
        }
    }
    return b;
}
function normalizePhoneNumber(phoneNumber) {
    // Loại bỏ tất cả các khoảng trắng và các ký tự không phải là số
    let normalizedNumber = phoneNumber.replace(/\s+/g, "");

    // Kiểm tra và chuyển đổi số điện thoại theo định dạng mong muốn
    if (normalizedNumber.startsWith("84")) {
        normalizedNumber = normalizedNumber.slice(2);
    } else if (normalizedNumber.startsWith("0")) {
        normalizedNumber = normalizedNumber.slice(1);
    }

    // Đảm bảo rằng số điện thoại bắt đầu với '0'
    if (!normalizedNumber.startsWith("0")) {
        normalizedNumber = "0" + normalizedNumber;
    }

    return normalizedNumber;
}
function convertTelco(phoneNumber) {
    // Loại bỏ tất cả các ký tự không phải là số
    let normalizedNumber = phoneNumber.replace(/\D/g, "");

    if (normalizedNumber.startsWith("84")) {
        normalizedNumber = normalizedNumber.slice(2);
    } else if (normalizedNumber.startsWith("0")) {
        normalizedNumber = normalizedNumber.slice(1);
    }

    if (!normalizedNumber.startsWith("0")) {
        normalizedNumber = "0" + normalizedNumber;
    }

    const carriers = {
        // Viettel
        "086": "Viettel",
        "096": "Viettel",
        "097": "Viettel",
        "098": "Viettel",
        "032": "Viettel",
        "033": "Viettel",
        "034": "Viettel",
        "035": "Viettel",
        "036": "Viettel",
        "037": "Viettel",
        "038": "Viettel",
        "039": "Viettel",

        // Mobifone
        "089": "Mobifone",
        "090": "Mobifone",
        "093": "Mobifone",
        "070": "Mobifone",
        "079": "Mobifone",
        "077": "Mobifone",
        "076": "Mobifone",
        "078": "Mobifone",
        "072": "Mobifone",

        // Vinaphone
        "088": "Vinaphone",
        "091": "Vinaphone",
        "094": "Vinaphone",
        "083": "Vinaphone",
        "084": "Vinaphone",
        "085": "Vinaphone",
        "081": "Vinaphone",
        "082": "Vinaphone",

        // Vietnamobile
        "092": "Vietnamobile",
        "056": "Vietnamobile",
        "058": "Vietnamobile",

        // Gmobile
        "099": "Gmobile",
        "059": "Gmobile",

        //$Itelecom
        "087": "Itelecom",
    };

    const prefix = normalizedNumber.substring(0, 3);
    return carriers[prefix] || "---";
}
module.exports = {
    checkPhoneContact,
    removeDuplicatePhones,
    checkPhoneError,
    checkPhoneVNTA,
    normalizePhoneNumber,
    convertTelco,
};
