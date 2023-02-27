import { Request, Response } from "@app-helpers/http.extends";
import {
  CATEGORY_STATUS,
  CategoryModelInterface,
} from "@app-repositories/models/Category";
import { EVENT_ACTION, EVENT_SCHEMA } from "@app-repositories/models/Event";
import { IdeaModelInterface } from "@app-repositories/models/Idea";
import { ThreadModelInterface } from "@app-repositories/models/Thread";
import TYPES from "@app-repositories/types";
import {
  ICategoryService,
  IEventService,
  IIdeaService,
  IThreadService,
} from "@app-services/interfaces";
import CONSTANTS from "@app-utils/constants";
import { isBefore } from "date-fns";
import { inject, injectable } from "inversify";

@injectable()
class IdeaController {
  @inject(TYPES.IdeaService) private readonly ideaService: IIdeaService;
  @inject(TYPES.ThreadService) private readonly threadService: IThreadService;
  @inject(TYPES.CategoryService)
  private readonly categoryService: ICategoryService;
  @inject(TYPES.EventService) private readonly eventService: IEventService;

  async createIdea(req: Request, res: Response) {
    try {
      const { title, description, documents, category, thread } = req.body;

      const idea: IdeaModelInterface = await this.ideaService.getIdeaByTitle(
        title
      );

      if (idea) {
        return res.errorRes(CONSTANTS.SERVER_ERROR.IDEA_EXISTED);
      }

      const threadDocument: ThreadModelInterface =
        await this.threadService.getThreadById(thread);

      if (!threadDocument) {
        return res.errorRes(CONSTANTS.SERVER_ERROR.THREAD_NOT_EXISTED);
      }

      const { finalClosureDate } = threadDocument;

      if (isBefore(new Date(finalClosureDate), new Date())) {
        return res.errorRes(CONSTANTS.SERVER_ERROR.THREAD_EXPIRED);
      }

      category.map(async (item: string) => {
        const categoryDocument: CategoryModelInterface =
          await this.categoryService.getCategoryById(item);

        if (!categoryDocument) {
          return res.errorRes(CONSTANTS.SERVER_ERROR.CATEGORY_NOT_EXISTED);
        }

        if (categoryDocument.status === CATEGORY_STATUS.INACTIVE) {
          return res.errorRes(CONSTANTS.SERVER_ERROR.CATEGORY_NOT_EXISTED);
        }
      });

      const newIdea: IdeaModelInterface = await this.ideaService.createIdea(
        {
          title,
          description,
          documents,
          category,
          thread,
        },
        req.headers.userId
      );

      if (!newIdea) {
        return res.internal({});
      }

      await this.eventService.createEvent({
        schema: EVENT_SCHEMA.IDEA,
        action: EVENT_ACTION.CREATE,
        schemaId: newIdea._id,
        actor: req.headers.userId,
        description: "/idea/create",
        createdAt: new Date(),
      });

      const result: IdeaModelInterface = await this.ideaService.getIdeaById(
        String(newIdea._id)
      );

      return res.successRes({ data: result });
    } catch (error) {
      console.log("error", error);
      return res.internal({ message: error.message });
    }
  }
}

export default IdeaController;
