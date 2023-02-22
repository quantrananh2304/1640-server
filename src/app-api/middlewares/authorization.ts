import { RANDOM_TOKEN_SECRET } from "@app-configs";
import { Request, Response } from "@app-helpers/http.extends";
import User, {
  USER_ROLE,
  UserModelInterface,
} from "@app-repositories/models/User";
import CONSTANTS from "@app-utils/constants";
import { NextFunction } from "express";
import jwt = require("jsonwebtoken");

export default async function checkToken(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const token = req.headers.authorization.split(" ")[1];

    jwt.verify(token, RANDOM_TOKEN_SECRET, (err: Error, payload: any) => {
      if (payload) {
        req.headers["userId"] = payload.userId;
        next();
      } else {
        if (err.name === "TokenExpiredError") {
          return res.forbidden(CONSTANTS.SERVER_ERROR.AUTHORIZATION_FORBIDDEN);
        }
        return res.unauthorize({
          message: CONSTANTS.SERVER_ERROR.AUTHORIZATION_UNAUTHORIZED.message,
        });
      }
    });
  } catch (err) {
    return res.forbidden(CONSTANTS.SERVER_ERROR.AUTHORIZATION_FORBIDDEN);
  }
}

export async function checkAdmin(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const token = req.headers.authorization.split(" ")[1];

    jwt.verify(token, RANDOM_TOKEN_SECRET, (err: Error, payload: any) => {
      if (payload) {
        const { userId } = payload;

        User.findById(userId).then((user: UserModelInterface) => {
          if (USER_ROLE[user.role] === USER_ROLE.ADMIN) {
            next();
          } else {
            return res.forbidden(CONSTANTS.SERVER_ERROR.ADMIN_ONLY);
          }
        });
      }
    });
  } catch (error) {
    return res.forbidden(CONSTANTS.SERVER_ERROR.ADMIN_ONLY);
  }
}
