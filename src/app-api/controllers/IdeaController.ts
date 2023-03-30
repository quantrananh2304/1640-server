import { Request, Response } from "@app-helpers/http.extends";
import {
  CATEGORY_STATUS,
  CategoryModelInterface,
} from "@app-repositories/models/Category";
import { EVENT_ACTION, EVENT_SCHEMA } from "@app-repositories/models/Event";
import { IdeaModelInterface } from "@app-repositories/models/Idea";
import { IDEA_NOTIFICATION_TYPE } from "@app-repositories/models/IdeaNotification";
import { ThreadModelInterface } from "@app-repositories/models/Thread";
import {
  USER_ROLE,
  USER_STATUS,
  UserModelInterface,
} from "@app-repositories/models/User";
import NodeMailer from "@app-repositories/smtp";
import TYPES from "@app-repositories/types";
import IdeaNotificationService from "@app-services/IdeaNotificationService";
import UserService from "@app-services/UserService";
import {
  ICategoryService,
  IEventService,
  IIdeaService,
  IThreadService,
} from "@app-services/interfaces";
import CONSTANTS from "@app-utils/constants";
import {
  endOfYear,
  format,
  getYear,
  isBefore,
  startOfYear,
  sub,
} from "date-fns";
import { inject, injectable } from "inversify";
import { Types } from "mongoose";

@injectable()
class IdeaController {
  @inject(TYPES.IdeaService) private readonly ideaService: IIdeaService;
  @inject(TYPES.ThreadService) private readonly threadService: IThreadService;
  @inject(TYPES.CategoryService)
  private readonly categoryService: ICategoryService;
  @inject(TYPES.EventService) private readonly eventService: IEventService;
  @inject(TYPES.UserService) private readonly userService: UserService;
  @inject(TYPES.IdeaNotificationService)
  private readonly ideaNotificationService: IdeaNotificationService;
  @inject(TYPES.NodeMailer) private readonly nodeMailer: NodeMailer;

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

      const QACUsers: Array<UserModelInterface> =
        await this.userService.getUserByRoles([
          USER_ROLE.QUALITY_ASSURANCE_COORDINATOR,
        ]);

      if (!QACUsers) {
        return res.internal({});
      }

      if (QACUsers.length) {
        const emailSubject = CONSTANTS.NEW_IDEA_NOTIFICATION_TITLE.replace(
          "${idea.title}",
          newIdea.title
        );

        const emailBody = isAnonymous
          ? CONSTANTS.NEW_ANONYMOUS_IDEA_NOTIFICATION_BODY.replace(
              "${idea.title}",
              newIdea.title
            )
              .replace("${thread.name}", threadDocument.name)
              .replace("${idea.createdAt}", format(new Date(), "MMM do yyyy"))
              .replace("${baseUrl}", CONSTANTS.BASE_URL)
              .replace("${idea._id}", String(newIdea._id))
          : CONSTANTS.NEW_IDEA_NOTIFICATION_BODY.replace(
              "${idea.title}",
              newIdea.title
            )
              .replace("${user.firstName}", user.firstName)
              .replace("${user.lastName}", user.lastName)
              .replace("${thread.name}", threadDocument.name)
              .replace("${idea.createdAt}", format(new Date(), "MMM do yyyy"))
              .replace("${baseUrl}", CONSTANTS.BASE_URL)
              .replace("${idea._id}", String(newIdea._id));

        const receivers = QACUsers.filter(
          (item) => item.status === USER_STATUS.ACTIVE
        ).map((item) => item.email);

        await this.nodeMailer.nodeMailerSendMail(
          receivers,
          // ["trananhquan23499@gmail.com"],
          emailSubject,
          emailBody
        );

        const createNotifications = (arr: Array<any>) => {
          const promises = arr.map(async (item: string) => {
            const notification =
              await this.ideaNotificationService.createNotification(
                {
                  content: `${user.firstName} ${user.lastName} submitted a new idea: ${newIdea.title}`,
                  type: IDEA_NOTIFICATION_TYPE.SUBMISSION,
                  idea: String(newIdea._id),
                },
                item
              );

            if (!notification) {
              return res.internal({});
            }

            return notification;
          });

          return Promise.all(promises);
        };

        await createNotifications(QACUsers.map((item) => String(item._id)));
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
      const { userId } = req.headers;

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
        userId
      );

      if (!updatedIdea) {
        return res.internal({});
      }

      const { updatedBy } = updatedIdea;

      if (String(updatedBy) !== userId) {
        const user: UserModelInterface = await this.userService.getUserById(
          userId
        );
        const receiver: UserModelInterface = await this.userService.getUserById(
          String(updatedBy)
        );

        const emailTitle =
          CONSTANTS.NEW_IDEA_COMMENT_NOTIFICATION_TITLE.replace(
            "${idea.title}",
            updatedIdea.title
          );
        const emailBody = isAnonymous
          ? CONSTANTS.NEW_ANONYMOUS_IDEA_COMMENT_NOTIFICATION_BODY.replace(
              "${comment.createdAt}",
              format(new Date(), "MMM do yyyy")
            )
              .replace("${baseUrl}", CONSTANTS.BASE_URL)
              .replace("${idea._id}", String(updatedIdea._id))
              .replace("${idea.title}", updatedIdea.title)
          : CONSTANTS.NEW_IDEA_COMMENT_NOTIFICATION_BODY.replace(
              "${user.firstName}",
              user.firstName
            )
              .replace("${user.lastName}", user.lastName)
              .replace(
                "${comment.createdAt}",
                format(new Date(), "MMM do yyyy")
              )
              .replace("${baseUrl}", CONSTANTS.BASE_URL)
              .replace("${idea._id}", String(updatedIdea._id))
              .replace("${idea.title}", updatedIdea.title);

        await this.nodeMailer.nodeMailerSendMail(
          [receiver.email],
          emailTitle,
          emailBody
        );

        await this.ideaNotificationService.createNotification(
          {
            content: `${user.firstName} ${user.lastName} added a new comment in idea: ${updatedIdea.title}`,
            type: IDEA_NOTIFICATION_TYPE.NEW_COMMENT,
            idea: String(updatedIdea._id),
          },
          userId
        );
      }

      await this.eventService.createEvent({
        schema: EVENT_SCHEMA.IDEA,
        action: EVENT_ACTION.UPDATE,
        schemaId: updatedIdea._id,
        actor: userId,
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

  async dashboardInfo(req: Request, res: Response) {
    try {
      const today: Date = new Date();
      const yesterday: Date = sub(today, { days: 1 });
      const firstDateOfYear: Date = startOfYear(today);
      const lastDateOfYear: Date = endOfYear(today);
      // const firstDateOfLastFourMonth: Date = startOfMonth(
      // sub(today, { months: 4 })
      // );
      const lastYear: Date = sub(today, { years: 1 });
      const lastTwoYear: Date = sub(today, { years: 2 });
      const lastThreeYear: Date = sub(today, { years: 3 });
      const lastFourYear: Date = sub(today, { years: 4 });

      const todayIdeas: Array<IdeaModelInterface> =
        await this.ideaService.getIdeaByDate(today, today);

      if (!todayIdeas) {
        return res.internal({});
      }

      const yesterdayIdeas: Array<IdeaModelInterface> =
        await this.ideaService.getIdeaByDate(yesterday, yesterday);

      if (!yesterdayIdeas) {
        return res.internal({});
      }

      const thisYearIdeas: Array<IdeaModelInterface> =
        await this.ideaService.getIdeaByDate(firstDateOfYear, lastDateOfYear);

      if (!thisYearIdeas) {
        return res.internal({});
      }

      const lastYearIdeas: Array<IdeaModelInterface> =
        await this.ideaService.getIdeaByDate(
          startOfYear(lastYear),
          endOfYear(lastYear)
        );

      if (!lastYearIdeas) {
        return res.internal({});
      }

      const lastTwoYearIdeas: Array<IdeaModelInterface> =
        await this.ideaService.getIdeaByDate(
          startOfYear(lastTwoYear),
          endOfYear(lastTwoYear)
        );

      if (!lastTwoYearIdeas) {
        return res.internal({});
      }

      const lastThreeYearIdeas: Array<IdeaModelInterface> =
        await this.ideaService.getIdeaByDate(
          startOfYear(lastThreeYear),
          endOfYear(lastThreeYear)
        );

      if (!lastThreeYearIdeas) {
        return res.internal({});
      }

      const lastFourYearIdeas: Array<IdeaModelInterface> =
        await this.ideaService.getIdeaByDate(
          startOfYear(lastFourYear),
          endOfYear(lastFourYear)
        );

      if (!lastFourYearIdeas) {
        return res.internal({});
      }

      await this.eventService.createEvent({
        schema: EVENT_SCHEMA.IDEA,
        action: EVENT_ACTION.READ,
        schemaId: null,
        actor: req.headers.userId,
        description: "/idea/dashboard",
        createdAt: new Date(),
      });

      return res.successRes({
        data: {
          todayIdeaCount: todayIdeas.length,
          yesterdayIdeaCount: yesterdayIdeas.length,
          [getYear(today)]: thisYearIdeas.length,
          [getYear(lastYear)]: lastYearIdeas.length,
          [getYear(lastTwoYear)]: lastTwoYearIdeas.length,
          [getYear(lastThreeYear)]: lastThreeYearIdeas.length,
          [getYear(lastFourYear)]: lastFourYearIdeas.length,
          ideaCountByDepartment: thisYearIdeas.reduce(
            (prev: any, current: IdeaModelInterface) => {
              const { department, createdAt, updatedBy } = current;
              const month: string = format(new Date(createdAt), "LLL");

              if (!prev[month]) {
                // new month

                prev[month] = {
                  // [department.name]: {
                  //   _id: String(department._id),
                  //   ideaCount: 1,
                  // },
                  departments: [
                    {
                      _id: String(department._id),
                      name: department.name,
                      ideaCount: 1,
                    },
                  ],
                  users: [updatedBy],
                  userCount: 1,
                };
              } else {
                // existed month

                if (
                  !prev[month].departments
                    .map(
                      (item: {
                        _id: string;
                        ideaCount: number;
                        name: string;
                      }) => item._id
                    )
                    .includes(String(department._id))
                ) {
                  // new department

                  prev[month].departments.push({
                    _id: String(department._id),
                    name: department.name,
                    ideaCount: 1,
                  });
                } else {
                  // existed department

                  const index = prev[month].departments
                    .map(
                      (item: {
                        _id: string;
                        ideaCount: number;
                        name: string;
                      }) => item._id
                    )
                    .indexOf(String(department._id));

                  prev[month].departments[index].ideaCount += 1;
                }

                if (
                  !prev[month].users
                    .map(
                      (item: {
                        firstName: string;
                        lastName: string;
                        _id: Types.ObjectId;
                      }) => String(item._id)
                    )
                    .includes(String(updatedBy._id))
                ) {
                  // new user
                  prev[month].users.push(updatedBy);
                  prev[month].userCount += 1;
                }
              }

              return prev;
            },
            {}
          ),
        },
      });
    } catch (error) {
      console.log("error", error);
      return res.internal({ message: error.message });
    }
  }
}

export default IdeaController;
