import { format, isValid, parse } from "date-fns";

function convertDateFormat(inputDate) {
    const originalDate = new Date(inputDate);
    return format(originalDate, "yyyy-MM-dd HH:mm:ss");
}

const convertToGMT7 = (timestamp) => {
    const gmt7Offset = 7 * 60 * 60 * 1000; // GMT+7 có offset là 7 giờ
    return new Date(timestamp + gmt7Offset).getTime();
};
const convertFromGMT7 = (timestamp) => {
    const gmt7Offset = 7 * 60 * 60 * 1000; // 7 giờ tính bằng milliseconds
    return timestamp - gmt7Offset; // Trả về timestamp sau khi trừ đi 7 giờ
};

const roundedUp = (number) => Math.ceil(number * 100) / 100;

// function formatDateTime(inputDate) {
//     if (!inputDate) return "";

//     const separators = ["/", "-"];
//     let parsedDate;

//     for (const separator of separators) {
//         const [day, month, year] = inputDate.toString().split(separator);

//         if (day && month && year) {
//             parsedDate = new Date(`${year}-${month}-${day}`);

//             if (isValid(parsedDate)) {
//                 break;
//             }
//         }
//     }

//     if (!isValid(parsedDate)) {
//         return "";
//     }

//     return parsedDate
// }

function formatDateTime(inputDate) {
    if (!inputDate) return "";

    const separators = ["/", "-"];
    let parsedDate;

    for (const separator of separators) {
        const parts = inputDate.toString().split(separator);

        if (parts.length === 3) {
            const [day, month, year] = parts;

            if (day && month && year) {
                const formattedDate = `${year}-${month.padStart(
                    2,
                    "0"
                )}-${day.padStart(2, "0")}`;
                parsedDate = new Date(formattedDate);

                if (!isNaN(parsedDate)) {
                    break;
                }
            }
        }
    }

    if (isNaN(parsedDate)) {
        return "";
    }

    return parsedDate;
}

const dateToTimeStamp = (date) => {
    const parsedDate = new Date(date);
    const timestampInSeconds = parsedDate.getTime() / 1000;
    return timestampInSeconds;
};

module.exports = {
    dateToTimeStamp,
    convertDateFormat,
    roundedUp,
    convertToGMT7,
    convertFromGMT7,
    formatDateTime,
};
