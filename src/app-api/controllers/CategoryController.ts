import { Request, Response } from "@app-helpers/http.extends";
import { CategoryModelInterface } from "@app-repositories/models/Category";
import { EVENT_ACTION, EVENT_SCHEMA } from "@app-repositories/models/Event";
import { USER_ROLE, UserModelInterface } from "@app-repositories/models/User";
import TYPES from "@app-repositories/types";
import {
  ICategoryService,
  IEventService,
  IUserService,
} from "@app-services/interfaces";
import CONSTANTS from "@app-utils/constants";
import { inject, injectable } from "inversify";

@injectable()
class CategoryController {
  @inject(TYPES.CategoryService)
  private readonly categoryService: ICategoryService;
  @inject(TYPES.EventService) private readonly eventService: IEventService;
  @inject(TYPES.UserService) private readonly userService: IUserService;

  async createCategory(req: Request, res: Response) {
    try {
      const { userId } = req.headers;

      const user: UserModelInterface = await this.userService.getUserById(
        userId
      );

      if (!user) {
        return res.internal({});
      }

      const { role } = user;

      if (
        role !== USER_ROLE.ADMIN &&
        role !== USER_ROLE.QUALITY_ASSURANCE_MANAGER
      ) {
        return res.forbidden(CONSTANTS.SERVER_ERROR.NOT_ADMIN_OR_QAM);
      }

      const { name } = req.body;

      const category: CategoryModelInterface =
        await this.categoryService.getCategoryByName(name);

      if (category) {
        return res.errorRes(CONSTANTS.SERVER_ERROR.CATEGORY_EXISTED);
      }

      const newCategory: CategoryModelInterface =
        await this.categoryService.createCategory(name, req.headers.userId);

      if (!newCategory) {
        return res.internal({});
      }

      await this.eventService.createEvent({
        schema: EVENT_SCHEMA.CATEGORY,
        action: EVENT_ACTION.CREATE,
        schemaId: newCategory._id,
        actor: userId,
        description: "/category/create",
        createdAt: new Date(),
      });

      const result: CategoryModelInterface =
        await this.categoryService.getCategoryById(String(newCategory._id));

      return res.successRes({ data: result });
    } catch (error) {
      console.log("error", error);
      return res.internal({ message: error.message });
    }
  }
}

export default CategoryController;
