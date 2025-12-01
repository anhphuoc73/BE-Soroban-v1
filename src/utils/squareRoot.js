function getRandomSquareNumberByDigits(n) {
    if (n < 1) return null;

    // Giới hạn nhỏ nhất và lớn nhất theo số chữ số
    const min = 10 ** (n - 1);
    const max = 10 ** n - 1;

    // Tìm khoảng số nguyên có square nằm trong min-max
    const start = Math.ceil(Math.sqrt(min));
    const end = Math.floor(Math.sqrt(max));

    if (start > end) {
        // Không có số bình phương nào đúng n chữ số
        return null;
    }

    // Random một root trong khoảng
    const root = Math.floor(Math.random() * (end - start + 1)) + start;

    // Trả về square
    return {
        number: root * root,
        sqrt: root
    }
}

module.exports = getRandomSquareNumberByDigits;
