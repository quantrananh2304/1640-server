import { injectable } from "inversify";
import { IIdeaNotificationService } from "./interfaces";
import IdeaNotification, {
  IDEA_NOTIFICATION_TYPE,
  IdeaNotificationModelInterface,
} from "@app-repositories/models/IdeaNotification";
import { Types } from "mongoose";

@injectable()
class IdeaNotificationService implements IIdeaNotificationService {
  async createNotification(
    _notification: {
      content: string;
      type: IDEA_NOTIFICATION_TYPE;
      idea: string;
    },
    actor: string
  ): Promise<IdeaNotificationModelInterface> {
    const { content, type, idea } = _notification;
    const notification: IdeaNotificationModelInterface =
      await IdeaNotification.create({
        content,
        type,
        idea,
        read: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        updatedBy: Types.ObjectId(actor),
      });

    return notification;
  }
}

export default IdeaNotificationService;
