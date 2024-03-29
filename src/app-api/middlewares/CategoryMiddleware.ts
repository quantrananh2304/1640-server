import { GET_LIST_CATEGORY_SORT } from "@app-services/interfaces";
import CONSTANTS from "@app-utils/constants";
import { body, param, query } from "express-validator";
import { isValidObjectId } from "mongoose";

const CategoryMiddleware = {
  create: [
    body("name")
      .exists({ checkFalsy: true, checkNull: true })
      .isString()
      .isLength({ max: 50 }),
  ],

  getListCategory: [
    query("page").exists({ checkNull: true }).isInt({ min: 1 }),

    query("limit")
      .exists({ checkFalsy: true, checkNull: true })
      .isInt({ min: 5 }),

    query("sort")
      .exists({ checkFalsy: true, checkNull: true })
      .isString()
      .custom((sort: string) => {
        if (!GET_LIST_CATEGORY_SORT[sort]) {
          return false;
        }

        return true;
      })
      .withMessage(CONSTANTS.VALIDATION_MESSAGE.SORT_OPTION_INVALID),
  ],

  deactivate: [
    param("categoryId")
      .exists({ checkFalsy: true, checkNull: true })
      .isString()
      .custom((ideaId: string) => isValidObjectId(ideaId))
      .withMessage(CONSTANTS.VALIDATION_MESSAGE.OBJECT_ID_NOT_VALID),
  ],

  updateName: [
    param("categoryId")
      .exists({ checkFalsy: true, checkNull: true })
      .isString()
      .custom((ideaId: string) => isValidObjectId(ideaId))
      .withMessage(CONSTANTS.VALIDATION_MESSAGE.OBJECT_ID_NOT_VALID),

    body("name")
      .exists({ checkFalsy: true, checkNull: true })
      .isString()
      .isLength({ max: 50 }),
  ],
};

export default CategoryMiddleware;
