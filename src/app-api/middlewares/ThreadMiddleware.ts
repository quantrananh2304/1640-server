import CONSTANTS from "@app-utils/constants";
import { isBefore } from "date-fns";
import { body } from "express-validator";

const ThreadMiddleware = {
  create: [
    body("name")
      .exists({ checkFalsy: true, checkNull: true })
      .isString()
      .isLength({ max: 50 }),

    body("description")
      .exists({ checkFalsy: true, checkNull: true })
      .isString()
      .isLength({ max: 255 }),

    body("note").exists({ checkNull: true }).isString().isLength({ max: 50 }),

    body("closureDate")
      .exists({ checkFalsy: true, checkNull: true })
      .isString()
      .custom((closureDate: string) => !isNaN(Date.parse(closureDate)))
      .withMessage(CONSTANTS.VALIDATION_MESSAGE.DATE_FORMAT_NOT_VALID),

    body("finalClosureDate")
      .exists({ checkFalsy: true, checkNull: true })
      .isString()
      .custom((finalClosureDate: string, { req }) => {
        const { closureDate } = req.body;

        if (isBefore(new Date(finalClosureDate), new Date(closureDate))) {
          return false;
        }

        if (isNaN(Date.parse(finalClosureDate))) {
          return false;
        }

        return true;
      })
      .withMessage(
        CONSTANTS.VALIDATION_MESSAGE.DATE_FORMAT_NOT_VALID +
          " or " +
          CONSTANTS.VALIDATION_MESSAGE
            .FINAL_CLOSURE_DATE_NOTE_BEFORE_CLOSURE_DATE
      ),
  ],
};

export default ThreadMiddleware;
