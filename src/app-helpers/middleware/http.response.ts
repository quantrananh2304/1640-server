import { NextFunction, Request as RequestEX } from "express";
import {
  Response,
  ErrorResParamType,
  BadRequestParamType,
  ForbiddenRequestParamType,
  UnauthorizedRequestParamType,
  InternalRequestParamType,
} from "../http.extends";

const httpResponse = (req: RequestEX, res: Response, next: NextFunction) => {
  res.successRes = function ({
    data = {},
    errorCode = 0,
    message = "Success",
  }) {
    return res.json({
      errorCode,
      message,
      data,
      errors: [],
    });
  };

  res.errorRes = function ({
    errorCode,
    message,
    data,
    errors,
  }: ErrorResParamType = {}) {
    errorCode = errorCode || -1;
    message = message || "Error";
    data = data || {};
    errors = errors || [];

    return res.json({
      errorCode,
      message,
      data,
      errors,
    });
  };

  res.badRequest = function ({
    message = "Bad Request",
  }: BadRequestParamType = {}) {
    return res.status(400).errorRes({ errorCode: 400, message: message });
  };

  res.forbidden = function ({
    message = "Forbidden",
    errorCode,
  }: ForbiddenRequestParamType = {}) {
    return res.status(403).errorRes({ errorCode: errorCode, message: message });
  };

  res.unauthorize = function ({
    message = "Unauthorized",
  }: UnauthorizedRequestParamType = {}) {
    return res.status(401).errorRes({ errorCode: 401, message: message });
  };

  res.internal = function ({
    message = "Internal Server Error",
  }: InternalRequestParamType = {}) {
    return res.status(500).errorRes({ errorCode: 500, message: message });
  };

  next();
};

export default httpResponse;
