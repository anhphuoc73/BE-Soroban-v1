const formatError = (error) => {
    const newErrors = [];
    for (let err of error.details) {
        const errKey = err.path[0];
        const errValue = err.message;

        newErrors.push({ [errKey]: errValue });
    }

    return newErrors;
};


module.exports = {
    formatError,
};