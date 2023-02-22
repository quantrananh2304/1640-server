import { Request, Response } from "@app-helpers/http.extends";
import CONSTANTS from "@app-utils/constants";
import { NextFunction } from "express";
import { matchedData } from "express-validator";

function preventUnknownData(req: Request, res: Response, next: NextFunction) {
  const requiredData = matchedData(req, { includeOptionals: false });

  if (Object.keys(req.body).length > Object.keys(requiredData).length) {
    return res.send(CONSTANTS.SERVER_ERROR.UNKNOWN_DATA);
  }

  next();
}

export default preventUnknownData;
