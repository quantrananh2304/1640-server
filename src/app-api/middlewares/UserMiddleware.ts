import { GET_LIST_USER_SORT } from "@app-services/interfaces";
import CONSTANTS from "@app-utils/constants";
import { body, param, query } from "express-validator";
import { isValidObjectId } from "mongoose";

const UserMiddleware = {
  changePassword: [
    param("userId")
      .exists({ checkFalsy: true, checkNull: true })
      .custom((userId: string) => isValidObjectId(userId)),

    body("oldPassword")
      .exists({ checkFalsy: true, checkNull: true })
      .isString(),

    body("newPassword")
      .exists({ checkFalsy: true, checkNull: true })
      .isString()
      .isLength({
        min: CONSTANTS.PASSWORD_MIN_LENGTH,
        max: CONSTANTS.PASSWORD_MAX_LENGTH,
      })
      .custom((newPassword: string) =>
        new RegExp(
          /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,12}$/
        ).test(newPassword)
      )
      .withMessage(CONSTANTS.VALIDATION_MESSAGE.PASSWORD_NOT_VALID),

    body("confirmPassword")
      .exists({ checkFalsy: true, checkNull: true })
      .isString()
      .custom(
        (confirmPassword: string, { req }) =>
          confirmPassword === req.body.newPassword
      )
      .withMessage(CONSTANTS.VALIDATION_MESSAGE.CONFIRM_PASSWORD_DIFFERENT),
  ],

  updateProfile: [
    param("userId")
      .exists({ checkFalsy: true, checkNull: true })
      .custom((userId: string) => isValidObjectId(userId))
      .withMessage(CONSTANTS.VALIDATION_MESSAGE.OBJECT_ID_NOT_VALID),

    body("firstName")
      .exists({ checkFalsy: true, checkNull: true })
      .isString()
      .isLength({ max: 50 }),

    body("lastName")
      .exists({ checkFalsy: true, checkNull: true })
      .isString()
      .isLength({ max: 50 }),

    body("address")
      .exists({ checkNull: true })
      .isString()
      .isLength({ max: 255 }),

    body("dob")
      .exists({ checkFalsy: true, checkNull: true })
      .isString()
      .custom((dob: string) => !isNaN(Date.parse(dob)))
      .withMessage(CONSTANTS.VALIDATION_MESSAGE.DATE_FORMAT_NOT_VALID),

    body("phoneNumber")
      .exists({ checkFalsy: true, checkNull: true })
      .isString(),

    body("gender").exists({ checkFalsy: true, checkNull: true }).isString(),
  ],

  uploadAvatar: [
    param("userId")
      .exists({ checkFalsy: true, checkNull: true })
      .custom((userId: string) => isValidObjectId(userId))
      .withMessage(CONSTANTS.VALIDATION_MESSAGE.OBJECT_ID_NOT_VALID),

    body("img")
      .exists({ checkFalsy: true, checkNull: true })
      .isString()
      .isDataURI()
      .withMessage("asd"),
  ],

  getListUser: [
    query("page").exists({ checkNull: true }).isInt({ min: 1 }),

    query("limit")
      .exists({ checkFalsy: true, checkNull: true })
      .isInt({ min: 5 }),

    query("sort")
      .exists({ checkFalsy: true, checkNull: true })
      .isString()
      .custom((sort: string) => {
        if (!GET_LIST_USER_SORT[sort]) {
          return false;
        }

        return true;
      })
      .withMessage(CONSTANTS.VALIDATION_MESSAGE.SORT_OPTION_INVALID),
  ],
};

export default UserMiddleware;
