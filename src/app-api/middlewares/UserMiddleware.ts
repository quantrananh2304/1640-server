import CONSTANTS from "@app-utils/constants";
import { body, param } from "express-validator";
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
};

export default UserMiddleware;
