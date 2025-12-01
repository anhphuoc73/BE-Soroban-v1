function getRandomCubeByDigits(n) {

    if (n < 1) return null;

    const start = Math.pow(10, n - 1); // số nhỏ nhất có n chữ số
    const end = Math.pow(10, n) - 1;   // số lớn nhất có n chữ số
    const random = Math.floor(Math.random() * (end - start + 1)) + start;
    return {
        number: random,
        result: Math.pow(random, 3)
    };
}

module.exports = getRandomCubeByDigits;
