import { body } from "express-validator";

const CategoryMiddleware = {
  create: [
    body("name")
      .exists({ checkFalsy: true, checkNull: true })
      .isString()
      .isLength({ max: 50 }),
  ],
};

export default CategoryMiddleware;
