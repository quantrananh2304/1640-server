import { Request, Response } from "@app-helpers/http.extends";
import {
  CATEGORY_STATUS,
  CategoryModelInterface,
} from "@app-repositories/models/Category";
import { EVENT_ACTION, EVENT_SCHEMA } from "@app-repositories/models/Event";
import { IdeaModelInterface } from "@app-repositories/models/Idea";
import { ThreadModelInterface } from "@app-repositories/models/Thread";
import { USER_ROLE, UserModelInterface } from "@app-repositories/models/User";
import TYPES from "@app-repositories/types";
import UserService from "@app-services/UserService";
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
  @inject(TYPES.UserService) private readonly userService: UserService;

  async createIdea(req: Request, res: Response) {
    try {
      const { title, description, documents, category, thread, isAnonymous } =
        req.body;

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

      const categoryDocument: CategoryModelInterface =
        await this.categoryService.getCategoryById(category);

      if (
        !categoryDocument ||
        categoryDocument.status === CATEGORY_STATUS.INACTIVE
      ) {
        return res.errorRes(CONSTANTS.SERVER_ERROR.CATEGORY_NOT_EXISTED);
      }

      const user: UserModelInterface = await this.userService.getUserById(
        req.headers.userId
      );

      const { department } = user;

      const newIdea: IdeaModelInterface = await this.ideaService.createIdea(
        {
          title,
          description,
          documents,
          category,
          thread,
          isAnonymous,
          department: department._id,
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

  async getListIdea(req: Request, res: Response) {
    try {
      const { page, limit, sort, category, thread, department } = req.query;

      const idea = await this.ideaService.getListIdea({
        page: Number(page) - 1,
        limit: Number(limit),
        sort,
        filteredBy: {
          category: category || [],
          thread: thread || [],
          department: department || [],
        },
      });

      if (!idea) {
        return res.internal({});
      }

      await this.eventService.createEvent({
        schema: EVENT_SCHEMA.IDEA,
        action: EVENT_ACTION.READ,
        schemaId: null,
        actor: req.headers.userId,
        description: "/idea/list",
        createdAt: new Date(),
      });

      return res.successRes({
        data: {
          ...idea,
          ideas: idea.ideas.map((item) => {
            const { comments, isAnonymous } = item;

            return {
              ...item,
              updatedBy: isAnonymous ? {} : item.updatedBy,
              comments: comments.map((comment) => {
                return {
                  ...comment,
                  createdBy: comment.isAnonymous ? {} : comment.createdBy,
                };
              }),
            };
          }),
        },
      });
    } catch (error) {
      console.log("error", error);
      return res.internal({ message: error.message });
    }
  }

  async likeDislikeIdea(req: Request, res: Response) {
    try {
      const { ideaId, action } = req.params;

      const idea: IdeaModelInterface = await this.ideaService.getIdeaById(
        ideaId
      );

      if (!idea) {
        return res.errorRes(CONSTANTS.SERVER_ERROR.IDEA_NOT_EXISTED);
      }

      const updatedIdea: IdeaModelInterface =
        await this.ideaService.likeDislikeIdea(
          ideaId,
          action,
          req.headers.userId
        );

      if (!updatedIdea) {
        return res.internal({});
      }

      await this.eventService.createEvent({
        schema: EVENT_SCHEMA.IDEA,
        action: EVENT_ACTION.UPDATE,
        schemaId: updatedIdea._id,
        actor: req.headers.userId,
        description: "/idea/like-dislike",
        createdAt: new Date(),
      });

      const result: IdeaModelInterface = await this.ideaService.getIdeaById(
        String(updatedIdea._id)
      );

      const likeCount = result.like.length;
      const dislikeCount = result.dislike.length;
      const commentsCount = result.comments.length;
      const viewCount = result.views.length;

      return res.successRes({
        data: {
          ...result,
          likeCount,
          dislikeCount,
          commentsCount,
          viewCount,
          comments: result.comments.map((item) => {
            const { isAnonymous, createdBy } = item;

            return {
              ...item,
              createdBy: isAnonymous ? {} : createdBy,
            };
          }),
        },
      });
    } catch (error) {
      console.log("error", error);
      return res.internal({ message: error.message });
    }
  }

  async viewIdea(req: Request, res: Response) {
    try {
      const { ideaId } = req.params;

      const idea: IdeaModelInterface = await this.ideaService.getIdeaById(
        ideaId
      );

      if (!idea) {
        return res.errorRes(CONSTANTS.SERVER_ERROR.IDEA_NOT_EXISTED);
      }

      const updatedIdea = await this.ideaService.viewIdea(
        ideaId,
        req.headers.userId
      );

      if (!updatedIdea) {
        return res.internal({});
      }

      await this.eventService.createEvent({
        schema: EVENT_SCHEMA.IDEA,
        action: EVENT_ACTION.UPDATE,
        schemaId: updatedIdea._id,
        actor: req.headers.userId,
        description: "/idea/view",
        createdAt: new Date(),
      });

      return res.successRes({ data: {} });
    } catch (error) {
      console.log("error", error);
      return res.internal({ message: error.message });
    }
  }

  async addComment(req: Request, res: Response) {
    try {
      const { ideaId } = req.params;
      const { content, isAnonymous } = req.body;

      const idea: any = await this.ideaService.getIdeaById(ideaId);

      if (!idea) {
        return res.errorRes(CONSTANTS.SERVER_ERROR.IDEA_NOT_EXISTED);
      }

      const { thread } = idea;

      if (isBefore(new Date(thread.finalClosureDate), new Date())) {
        return res.errorRes(CONSTANTS.SERVER_ERROR.THREAD_EXPIRED);
      }

      const updatedIdea: IdeaModelInterface = await this.ideaService.addComment(
        ideaId,
        content,
        isAnonymous,
        req.headers.userId
      );

      if (!updatedIdea) {
        return res.internal({});
      }

      await this.eventService.createEvent({
        schema: EVENT_SCHEMA.IDEA,
        action: EVENT_ACTION.UPDATE,
        schemaId: updatedIdea._id,
        actor: req.headers.userId,
        description: "/idea/add-comment",
        createdAt: new Date(),
      });

      return res.successRes({ data: {} });
    } catch (error) {
      console.log("error", error);
      return res.internal({ message: error.message });
    }
  }

  async deleteComment(req: Request, res: Response) {
    try {
      const { ideaId, commentId } = req.params;
      const { userId, userRole } = req.headers;

      const idea: IdeaModelInterface = await this.ideaService.getIdeaById(
        ideaId
      );

      if (!idea) {
        return res.errorRes(CONSTANTS.SERVER_ERROR.IDEA_NOT_EXISTED);
      }

      const comment: any = idea.comments.filter(
        (item) => String(item._id) === commentId
      )[0];

      if (!comment) {
        return res.errorRes(CONSTANTS.SERVER_ERROR.COMMENT_NOT_EXISTED);
      }

      if (
        userId !== String(comment.createdBy._id) &&
        userRole !== USER_ROLE.ADMIN
      ) {
        return res.errorRes(CONSTANTS.SERVER_ERROR.CANNOT_DELETE_OTHER_COMMENT);
      }

      const updatedIdea: IdeaModelInterface =
        await this.ideaService.deleteComment(ideaId, commentId);

      if (!updatedIdea) {
        return res.internal({});
      }

      await this.eventService.createEvent({
        schema: EVENT_SCHEMA.IDEA,
        action: EVENT_ACTION.DELETE,
        schemaId: updatedIdea._id,
        actor: userId,
        description: "/idea/comment/delete",
        createdAt: new Date(),
      });

      const result: IdeaModelInterface = await this.ideaService.getIdeaById(
        String(updatedIdea._id)
      );

      return res.successRes({
        data: {
          ...result,
          comments: result.comments.map((item) => {
            const { isAnonymous, createdBy } = item;

            return {
              ...item,
              createdBy: isAnonymous ? {} : createdBy,
            };
          }),
        },
      });
    } catch (error) {
      console.log("error", error);
      return res.internal({ message: error.message });
    }
  }

  async editComment(req: Request, res: Response) {
    try {
      const { ideaId, commentId } = req.params;
      const { content } = req.body;
      const { userId, userRole } = req.headers;

      const idea: IdeaModelInterface = await this.ideaService.getIdeaById(
        ideaId
      );

      if (!idea) {
        return res.errorRes(CONSTANTS.SERVER_ERROR.IDEA_NOT_EXISTED);
      }

      const comment: any = idea.comments.filter(
        (item) => String(item._id) === commentId
      )[0];

      if (!comment) {
        return res.errorRes(CONSTANTS.SERVER_ERROR.COMMENT_NOT_EXISTED);
      }

      if (
        userId !== String(comment.createdBy._id) &&
        userRole !== USER_ROLE.ADMIN
      ) {
        return res.errorRes(CONSTANTS.SERVER_ERROR.CANNOT_EDIT_OTHER_COMMENT);
      }

      const updatedIdea: IdeaModelInterface =
        await this.ideaService.editComment(ideaId, commentId, content);

      if (!updatedIdea) {
        return res.internal({});
      }

      await this.eventService.createEvent({
        schema: EVENT_SCHEMA.IDEA,
        action: EVENT_ACTION.UPDATE,
        schemaId: updatedIdea._id,
        actor: userId,
        description: "/idea/comment/edit",
        createdAt: new Date(),
      });

      const result: IdeaModelInterface = await this.ideaService.getIdeaById(
        String(updatedIdea._id)
      );

      return res.successRes({
        data: {
          ...result,
          comments: result.comments.map((item) => {
            const { isAnonymous, createdBy } = item;

            return {
              ...item,
              createdBy: isAnonymous ? {} : createdBy,
            };
          }),
        },
      });
    } catch (error) {
      console.log("error", error);
      return res.internal({ message: error.message });
    }
  }

  async getIdeaDetail(req: Request, res: Response) {
    try {
      const { ideaId } = req.query;

      const idea: IdeaModelInterface = await this.ideaService.getIdeaById(
        ideaId
      );

      if (!idea) {
        return res.errorRes(CONSTANTS.SERVER_ERROR.IDEA_NOT_EXISTED);
      }

      if (idea.isAnonymous) {
        delete idea.updatedBy;
      }

      const likeCount = idea.like.length;
      const dislikeCount = idea.dislike.length;
      const viewCount = idea.views.length;
      const commentsCount = idea.comments.length;

      await this.eventService.createEvent({
        schema: EVENT_SCHEMA.IDEA,
        action: EVENT_ACTION.READ,
        schemaId: idea._id,
        actor: req.headers.userId,
        description: "/idea/detail",
        createdAt: new Date(),
      });

      return res.successRes({
        data: {
          ...idea,
          comments: idea.comments.map((item) => {
            const { isAnonymous, createdBy } = item;

            return {
              ...item,
              createdBy: isAnonymous ? {} : createdBy,
            };
          }),
          likeCount,
          dislikeCount,
          viewCount,
          commentsCount,
        },
      });
    } catch (error) {
      console.log("error", error);
      return res.internal({ message: error.message });
    }
  }
}

export default IdeaController;
