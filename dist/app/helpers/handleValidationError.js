"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleValidationError = void 0;
//isActive, isDeleted type verification error
const handleValidationError = (err) => {
    const errorSources = [];
    const errors = Object.values(err.errors);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    errors.forEach((errorObject) => errorSources.push({
        path: errorObject.path,
        message: errorObject.message,
    }));
    return {
        statusCode: 400,
        message: err.message,
        errorSources
    };
};
exports.handleValidationError = handleValidationError;
