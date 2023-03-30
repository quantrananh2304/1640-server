import { query } from "express-validator";

const IdeaNotificationMiddleware = {
  getListNotification: [
    query("page").exists({ checkNull: true }).isInt({ min: 1 }),

    query("limit")
      .exists({ checkFalsy: true, checkNull: true })
      .isInt({ min: 5 }),
  ],
};

export default IdeaNotificationMiddleware;
