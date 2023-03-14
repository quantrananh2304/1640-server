import { GET_LIST_IDEA_SORT } from "@app-services/interfaces";
import CONSTANTS from "@app-utils/constants";
import { body, param, query } from "express-validator";
import { isValidObjectId } from "mongoose";

const IdeaMiddleware = {
  create: [
    body("title")
      .exists({ checkFalsy: true, checkNull: true })
      .isString()
      .isLength({ max: 50 }),

    body("description")
      .exists({ checkFalsy: true, checkNull: true })
      .isString()
      .isLength({ max: 255 }),

    body("documents")
      .exists({ checkNull: true, checkFalsy: true })
      .isArray()
      .custom((documents: Array<any>) => {
        if (!documents.length) {
          return true;
        }

        return documents.every(
          (item) => item.contentType && item.name && item.url
        );
      })
      .withMessage(CONSTANTS.VALIDATION_MESSAGE.DOCUMENT_INVALID),

    body("category")
      .exists({ checkFalsy: true, checkNull: true })
      .isArray()
      .custom((category: Array<string>) =>
        category.every((item: string) => isValidObjectId(item))
      )
      .withMessage(CONSTANTS.VALIDATION_MESSAGE.OBJECT_ID_NOT_VALID),

    body("thread")
      .exists({ checkFalsy: true, checkNull: true })
      .isString()
      .custom((thread: string) => isValidObjectId(thread))
      .withMessage(CONSTANTS.VALIDATION_MESSAGE.OBJECT_ID_NOT_VALID),

    body("isAnonymous").exists({ checkNull: true }).isBoolean(),
  ],

  getListIdea: [
    query("page").exists({ checkNull: true }).isInt({ min: 1 }),

    query("limit")
      .exists({ checkFalsy: true, checkNull: true })
      .isInt({ min: 5 }),

    query("sort")
      .exists({ checkFalsy: true, checkNull: true })
      .isString()
      .custom((sort: string) => {
        if (!GET_LIST_IDEA_SORT[sort]) {
          return false;
        }

        return true;
      })
      .withMessage(CONSTANTS.VALIDATION_MESSAGE.SORT_OPTION_INVALID),
  ],

  likeDislikeIdea: [
    param("ideaId")
      .exists({ checkFalsy: true, checkNull: true })
      .isString()
      .custom((ideaId: string) => isValidObjectId(ideaId))
      .withMessage(CONSTANTS.VALIDATION_MESSAGE.OBJECT_ID_NOT_VALID),

    param("action")
      .exists({ checkFalsy: true, checkNull: true })
      .isString()
      .custom((action: string) => action === "like" || action === "dislike")
      .withMessage(CONSTANTS.VALIDATION_MESSAGE.ACTION_INVALID),
  ],

  view: [
    param("ideaId")
      .exists({ checkFalsy: true, checkNull: true })
      .isString()
      .custom((ideaId: string) => isValidObjectId(ideaId))
      .withMessage(CONSTANTS.VALIDATION_MESSAGE.OBJECT_ID_NOT_VALID),
  ],

  addComment: [
    param("ideaId")
      .exists({ checkFalsy: true, checkNull: true })
      .isString()
      .custom((ideaId: string) => isValidObjectId(ideaId))
      .withMessage(CONSTANTS.VALIDATION_MESSAGE.OBJECT_ID_NOT_VALID),

    body("content")
      .exists({ checkFalsy: true, checkNull: false })
      .isString()
      .isLength({ max: 255 }),
  ],

  deleteComment: [
    param("ideaId")
      .exists({ checkFalsy: true, checkNull: true })
      .isString()
      .custom((ideaId: string) => isValidObjectId(ideaId))
      .withMessage(CONSTANTS.VALIDATION_MESSAGE.OBJECT_ID_NOT_VALID),

    param("commentId")
      .exists({ checkFalsy: true, checkNull: true })
      .isString()
      .custom((ideaId: string) => isValidObjectId(ideaId))
      .withMessage(CONSTANTS.VALIDATION_MESSAGE.OBJECT_ID_NOT_VALID),
  ],

  editComment: [
    param("ideaId")
      .exists({ checkFalsy: true, checkNull: true })
      .isString()
      .custom((ideaId: string) => isValidObjectId(ideaId))
      .withMessage(CONSTANTS.VALIDATION_MESSAGE.OBJECT_ID_NOT_VALID),

    param("commentId")
      .exists({ checkFalsy: true, checkNull: true })
      .isString()
      .custom((ideaId: string) => isValidObjectId(ideaId))
      .withMessage(CONSTANTS.VALIDATION_MESSAGE.OBJECT_ID_NOT_VALID),

    body("content")
      .exists({ checkFalsy: true, checkNull: false })
      .isString()
      .isLength({ max: 255 }),
  ],
};

export default IdeaMiddleware;
