import { USER_GENDER, USER_ROLE } from "@app-repositories/models/User";
import CONSTANTS from "@app-utils/constants";
import { body, param } from "express-validator";
import { isValidObjectId } from "mongoose";

const AuthenticationMiddleware = {
  signUp: [
    body("firstName")
      .exists({ checkFalsy: true, checkNull: true })
      .isString()
      .isLength({ max: 50 }),

    body("lastName")
      .exists({ checkFalsy: true, checkNull: true })
      .isString()
      .isLength({ max: 50 }),

    body("email")
      .exists({ checkFalsy: true, checkNull: true })
      .isString()
      .custom((email: string) => {
        if (email.length > 50) {
          return false;
        }

        return new RegExp(
          /^[a-z0-9-](\.?-?_?[a-z0-9]){5,}@(gmail\.com)?(fpt\.edu\.vn)?$/
        ).test(email);
      }),

    body("avatar").exists({ checkNull: true }).isString(),

    body("role")
      .exists({ checkFalsy: true, checkNull: true })
      .isString()
      .custom((role: string) => {
        if (!USER_ROLE[role]) {
          return false;
        }

        return true;
      }),

    body("address")
      .exists({ checkNull: true })
      .isString()
      .isLength({ max: 255 }),

    body("dob")
      .exists({ checkFalsy: true, checkNull: true })
      .isString()
      .custom((dob: string) => !isNaN(Date.parse(dob))),

    body("phoneNumber")
      .exists({ checkFalsy: true, checkNull: true })
      .isString(),

    body("gender")
      .exists({ checkFalsy: true, checkNull: true })
      .isString()
      .custom((gender: string) => {
        if (!USER_GENDER[gender]) {
          return false;
        }

        return true;
      }),
  ],

  activateUserAccount: [
    param("userId")
      .exists({ checkFalsy: true, checkNull: true })
      .isString()
      .custom((userId: string) => isValidObjectId(userId)),

    param("code")
      .exists({ checkFalsy: true, checkNull: true })
      .isString()
      .isLength({ min: CONSTANTS.CODE_LENGTH, max: CONSTANTS.CODE_LENGTH }),
  ],

  login: [
    body("email")
      .exists({ checkFalsy: true, checkNull: true })
      .isString()
      .custom((email: string) => {
        if (email.length > 50) {
          return false;
        }

        return new RegExp(
          /^[a-z0-9-](\.?-?_?[a-z0-9]){5,}@(gmail\.com)?(fpt\.edu\.vn)?$/
        ).test(email);
      }),

    body("password").exists({ checkFalsy: true, checkNull: true }).isString(),
  ],
};

export default AuthenticationMiddleware;
