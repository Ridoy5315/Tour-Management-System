"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handlerCastError = void 0;
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const handlerCastError = (err) => {
    return {
        statusCode: 400,
        message: "Please provide a valid id",
    };
};
exports.handlerCastError = handlerCastError;
