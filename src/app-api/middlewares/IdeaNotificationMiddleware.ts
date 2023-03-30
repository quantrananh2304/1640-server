import CONSTANTS from "@app-utils/constants";
import { param, query } from "express-validator";
import { isValidObjectId } from "mongoose";

const IdeaNotificationMiddleware = {
  getListNotification: [
    query("page").exists({ checkNull: true }).isInt({ min: 1 }),

    query("limit")
      .exists({ checkFalsy: true, checkNull: true })
      .isInt({ min: 5 }),
  ],

  read: [
    param("notificationId")
      .exists({ checkFalsy: true, checkNull: true })
      .isString()
      .custom((notificationId: string) => isValidObjectId(notificationId))
      .withMessage(CONSTANTS.VALIDATION_MESSAGE.OBJECT_ID_NOT_VALID),
  ],
};

export default IdeaNotificationMiddleware;
