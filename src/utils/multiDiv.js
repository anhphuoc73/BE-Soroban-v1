function getRandomNumberByDigits(n, exclude = []) {
    const min = 10 ** (n - 1);
    const max = 10 ** n - 1;

    const maxAttempts = 200;
    for (let t = 0; t < maxAttempts; t++) {
        const val = Math.floor(Math.random() * (max - min + 1)) + min;
        if (!exclude.includes(val)) return val;
    }

    // fallback (rare)
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getMulDiv(n1, n2, count) {
    if (count < 1) {
        return {
            expression: "",
            resultValue: null
        };
    }

    const usedNumbers = [];
    let currentValue = getRandomNumberByDigits(n1, [1]);
    usedNumbers.push(currentValue);

    let expression = `${currentValue}`;

    // count là số hạng → thực hiện count - 1 phép toán
    for (let i = 0; i < count - 1; i++) {
        const isMultiply = i % 2 === 0;
        const digit = isMultiply ? n2 : n1;

        if (isMultiply) {
            // ===== NHÂN =====
            const num = getRandomNumberByDigits(digit, [1]);
            usedNumbers.push(num);

            expression += ` x ${num}`;
            currentValue *= num;

        } else {
            // ===== CHIA =====
            let possibleDivisors = [];

            for (let j = 0; j < 200; j++) {
                const val = getRandomNumberByDigits(digit, [1]);
                if (
                    val !== 1 &&
                    val !== currentValue &&
                    !usedNumbers.includes(val) &&
                    currentValue % val === 0
                ) {
                    possibleDivisors.push(val);
                }
            }

            let divisor = null;

            if (possibleDivisors.length > 0) {
                divisor = possibleDivisors[Math.floor(Math.random() * possibleDivisors.length)];
            } else {
                // cố gắng tìm divisor chia được
                let attempts = 0;
                while (attempts++ < 1000) {
                    const val = getRandomNumberByDigits(digit);
                    if (val === 1) continue;
                    if (currentValue % val === 0) {
                        divisor = val;
                        break;
                    }
                }

                // nếu vẫn không tìm được → theo rule: chia chính nó
                if (!divisor) divisor = currentValue;
            }

            usedNumbers.push(divisor);
            expression += ` : ${divisor}`;
            currentValue /= divisor;
        }
    }

    return {
        expression,
        result: currentValue
    };
}

module.exports = getMulDiv;
