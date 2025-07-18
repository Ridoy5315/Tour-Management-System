import { handleValidationError } from "./../helpers/handleValidationError";
import { handlerCastError } from "./../helpers/handleCastError";
import { handleDuplicateError } from "./../helpers/handleDuplicateError";
/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextFunction, Request, Response } from "express";
import { envVars } from "../config/env";
import AppError from "../errorHelpers/AppError";
import { handleZodError } from "../helpers/handleZodError";
import { TErrorSources } from "../interfaces/error.types";

export const globalErrorHandler = (
  err: any,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction
) => {
  if (envVars.NODE_ENV === "development") {
    console.log(err);
  }
  let statusCode = 500;
  let message = "Something Went Wrong!! ";

  let errorSources: TErrorSources[] = [];

  //duplicate error
  if (err.code === 11000) {
    const simplifiedError = handleDuplicateError(err);
    statusCode = simplifiedError.statusCode;
    message = simplifiedError.message;
  }

  //Object ID error. / cast error
  else if (err.name === "CastError") {
    const simplifiedError = handlerCastError(err);
    statusCode = simplifiedError.statusCode;
    message = simplifiedError.message;
  } 
  
  else if (err.name === "ZodError") {
    const simplifiedError = handleZodError(err);
    statusCode = simplifiedError.statusCode;
    message = simplifiedError.message;
    errorSources = simplifiedError.errorSources as TErrorSources[];
  } 
  
  else if (err.name === "ValidationError") {
    const simplifiedError = handleValidationError(err);
    statusCode = simplifiedError.statusCode;
    errorSources = simplifiedError.errorSources as TErrorSources[];
    message = simplifiedError.message;
  } 
  
  else if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
  } 
  
  else if (err instanceof Error) {
    statusCode = 500;
    message = err.message;
  }

  res.status(statusCode).json({
    success: false,
    message,
    errorSources,
    err: envVars.NODE_ENV === "development" ? err : null,
    stack: envVars.NODE_ENV === "development" ? err.stack : null,
  });
};
