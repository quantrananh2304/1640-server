import { Request, Response } from "@app-helpers/http.extends";
import { CategoryModelInterface } from "@app-repositories/models/Category";
import { EVENT_ACTION, EVENT_SCHEMA } from "@app-repositories/models/Event";
import { USER_ROLE } from "@app-repositories/models/User";
import TYPES from "@app-repositories/types";
import { ICategoryService, IEventService } from "@app-services/interfaces";
import CONSTANTS from "@app-utils/constants";
import { inject, injectable } from "inversify";

@injectable()
class CategoryController {
  @inject(TYPES.CategoryService)
  private readonly categoryService: ICategoryService;
  @inject(TYPES.EventService) private readonly eventService: IEventService;

  async createCategory(req: Request, res: Response) {
    try {
      const { userId, userRole } = req.headers;

      if (
        userRole !== USER_ROLE.ADMIN &&
        userRole !== USER_ROLE.QUALITY_ASSURANCE_MANAGER
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

  async getListCategory(req: Request, res: Response) {
    try {
      const { page, limit, sort } = req.query;
      const { userId } = req.headers;

      const category = await this.categoryService.getListCategory({
        page: Number(page) - 1,
        limit: Number(limit),
        sort,
      });

      if (!category) {
        return res.internal({});
      }

      await this.eventService.createEvent({
        schema: EVENT_SCHEMA.CATEGORY,
        action: EVENT_ACTION.READ,
        schemaId: null,
        actor: userId,
        description: "/category/list",
        createdAt: new Date(),
      });

      return res.successRes({
        data: category,
      });
    } catch (error) {
      console.log("error", error);
      return res.internal({ message: error.message });
    }
  }

  async deactivateCategory(req: Request, res: Response) {
    try {
      const { categoryId } = req.params;
      const { userRole, userId } = req.headers;

      if (
        userRole !== USER_ROLE.ADMIN &&
        userRole !== USER_ROLE.QUALITY_ASSURANCE_COORDINATOR
      ) {
        return res.errorRes(CONSTANTS.SERVER_ERROR.NOT_ADMIN_OR_QAM);
      }

      const updatedCategory: CategoryModelInterface =
        await this.categoryService.deactivateCategory(categoryId, userId);

      if (!updatedCategory) {
        return res.internal({});
      }

      await this.eventService.createEvent({
        schema: EVENT_SCHEMA.CATEGORY,
        action: EVENT_ACTION.DELETE,
        schemaId: updatedCategory._id,
        actor: userId,
        description: "/category/deactivate",
        createdAt: new Date(),
      });

      return res.successRes({ data: {} });
    } catch (error) {
      console.log("error", error);
      return res.internal({ message: error.message });
    }
  }
}

export default CategoryController;
