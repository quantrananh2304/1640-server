import { Request, Response } from "@app-helpers/http.extends";
import { EVENT_ACTION, EVENT_SCHEMA } from "@app-repositories/models/Event";
import { IdeaNotificationModelInterface } from "@app-repositories/models/IdeaNotification";
import TYPES from "@app-repositories/types";
import EventService from "@app-services/EventService";
import IdeaNotificationService from "@app-services/IdeaNotificationService";
import CONSTANTS from "@app-utils/constants";
import { inject, injectable } from "inversify";

@injectable()
class IdeaNotificationController {
  @inject(TYPES.IdeaNotificationService)
  private readonly ideaNotificationService: IdeaNotificationService;
  @inject(TYPES.EventService) private readonly eventService: EventService;

  async getListNotification(req: Request, res: Response) {
    try {
      const { page, limit } = req.query;
      const { userId } = req.headers;

      const notification =
        await this.ideaNotificationService.getListNotification(
          {
            page: Number(page) - 1,
            limit: Number(limit),
          },
          userId
        );

      if (!notification) {
        return res.internal({});
      }

      await this.eventService.createEvent({
        schema: EVENT_SCHEMA.IDEA_NOTIFICATION,
        action: EVENT_ACTION.READ,
        schemaId: null,
        actor: userId,
        description: "/idea-notification/list",
        createdAt: new Date(),
      });

      return res.successRes({
        data: {
          ...notification,
          notifications: notification.notifications.map((item) => {
            const { isAnonymous, updatedBy } = item;

            return { ...item, updatedBy: isAnonymous ? {} : updatedBy };
          }),
        },
      });
    } catch (error) {
      console.log("error", error);
      return res.internal({ message: error.message });
    }
  }

  async read(req: Request, res: Response) {
    try {
      const { notificationId } = req.params;
      const { userId } = req.headers;

      const ideaNotification: IdeaNotificationModelInterface =
        await this.ideaNotificationService.getNotificationById(notificationId);

      if (!ideaNotification) {
        return res.errorRes(CONSTANTS.SERVER_ERROR.NOTIFICATION_NOT_EXIST);
      }

      const { receiver } = ideaNotification;

      if (String(receiver) !== userId) {
        return res.errorRes(
          CONSTANTS.SERVER_ERROR.CANNOT_READ_OTHER_NOTIFICATION
        );
      }

      const updatedNotification: IdeaNotificationModelInterface =
        await this.ideaNotificationService.readNotification(notificationId);

      if (!updatedNotification) {
        return res.internal({});
      }

      await this.eventService.createEvent({
        schema: EVENT_SCHEMA.IDEA_NOTIFICATION,
        action: EVENT_ACTION.UPDATE,
        schemaId: notificationId,
        actor: userId,
        description: "/idea-notification/read",
        createdAt: new Date(),
      });

      return res.successRes({ data: {} });
    } catch (error) {
      console.log("error", error);
      return res.internal({ message: error.message });
    }
  }
}

export default IdeaNotificationController;
