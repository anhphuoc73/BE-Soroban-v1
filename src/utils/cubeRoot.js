function getRandomCubeNumberByDigits(n) {
    if (n < 1) return null;

    // Ví dụ n = 3 → min = 100, max = 999
    const min = 10 ** (n - 1);
    const max = 10 ** n - 1;

    // Tìm root tối thiểu và tối đa sao cho root^3 nằm trong [min, max]
    const start = Math.ceil(Math.cbrt(min));   // căn bậc 3 nhỏ nhất
    const end = Math.floor(Math.cbrt(max));    // căn bậc 3 lớn nhất

    if (start > end) {
        // Không có số lập phương nào nằm trong số chữ số yêu cầu
        return null;
    }

    // Random một root trong khoảng [start, end]
    const root = Math.floor(Math.random() * (end - start + 1)) + start;

    // Trả về số lập phương và căn bậc 3
    return {
        number: root ** 3,
        cbrt: root
    };
}

module.exports = getRandomCubeNumberByDigits;
