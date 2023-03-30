import { Request, Response } from "@app-helpers/http.extends";
import { EVENT_ACTION, EVENT_SCHEMA } from "@app-repositories/models/Event";
import TYPES from "@app-repositories/types";
import EventService from "@app-services/EventService";
import IdeaNotificationService from "@app-services/IdeaNotificationService";
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
}

export default IdeaNotificationController;
