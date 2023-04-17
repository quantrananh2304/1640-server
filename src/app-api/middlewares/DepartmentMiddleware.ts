import { GET_LIST_DEPARTMENT_SORT } from "@app-services/interfaces";
import CONSTANTS from "@app-utils/constants";
import { body, param, query } from "express-validator";
import { isValidObjectId } from "mongoose";

const DepartmentMiddleware = {
  create: [
    body("name")
      .exists({ checkFalsy: true, checkNull: true })
      .isString()
      .isLength({ max: 50 }),

    body("note").exists({ checkNull: true }).isString().isLength({ max: 255 }),
  ],

  getListDepartment: [
    query("page").exists({ checkNull: true }).isInt({ min: 1 }),

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

  toggleActivateDeactivate: [
    param("departmentId")
      .exists({ checkFalsy: true, checkNull: true })
      .isString()
      .custom((departmentId) => isValidObjectId(departmentId))
      .withMessage(CONSTANTS.VALIDATION_MESSAGE.OBJECT_ID_NOT_VALID),

    param("action")
      .exists({ checkFalsy: true, checkNull: true })
      .isString()
      .custom((action) => action === "activate" || action === "deactivate")
      .withMessage(CONSTANTS.VALIDATION_MESSAGE.ACTION_INVALID),
  ],
};

export default DepartmentMiddleware;
