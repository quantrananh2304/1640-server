import { body } from "express-validator";

const DepartmentMiddleware = {
  create: [
    body("name")
      .exists({ checkFalsy: true, checkNull: true })
      .isString()
      .isLength({ max: 50 }),

    body("note").exists({ checkNull: true }).isString().isLength({ max: 255 }),
  ],
};

export default DepartmentMiddleware;
