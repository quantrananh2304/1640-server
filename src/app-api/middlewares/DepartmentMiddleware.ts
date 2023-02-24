import { GET_LIST_DEPARTMENT_SORT } from "@app-services/interfaces";
import CONSTANTS from "@app-utils/constants";
import { body, query } from "express-validator";

const DepartmentMiddleware = {
  create: [
    body("name")
      .exists({ checkFalsy: true, checkNull: true })
      .isString()
      .isLength({ max: 50 }),

    body("note").exists({ checkNull: true }).isString().isLength({ max: 255 }),
  ],

  getListUser: [
    query("page").exists({ checkNull: true }).isInt({ min: 0 }),

    query("limit")
      .exists({ checkFalsy: true, checkNull: true })
      .isInt({ min: 5 }),

    query("sort")
      .exists({ checkFalsy: true, checkNull: true })
      .isString()
      .custom((sort: string) => {
        if (!GET_LIST_DEPARTMENT_SORT[sort]) {
          return false;
        }

        return true;
      })
      .withMessage(CONSTANTS.VALIDATION_MESSAGE.SORT_OPTION_INVALID),
  ],
};

export default DepartmentMiddleware;
