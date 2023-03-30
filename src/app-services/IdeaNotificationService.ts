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
      receiver: string;
      isAnonymous: boolean;
    },
    actor: string
  ): Promise<IdeaNotificationModelInterface> {
    const { content, type, idea, receiver, isAnonymous } = _notification;
    const notification: IdeaNotificationModelInterface =
      await IdeaNotification.create({
        content,
        type,
        idea,
        read: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        updatedBy: Types.ObjectId(actor),
        receiver: Types.ObjectId(receiver),
        isAnonymous,
      });

    return notification;
  }

  async getListNotification(
    filter: { page: number; limit: number },
    receiver: string
  ): Promise<{
    notifications: IdeaNotificationModelInterface[];
    total: number;
    page: number;
    totalPage: number;
  }> {
    const { page, limit } = filter;

    const skip = page * limit;

    const aggregation: Array<any> = [
      { $match: { receiver: Types.ObjectId(receiver) } },

      {
        $lookup: {
          from: "ideas",
          localField: "idea",
          foreignField: "_id",
          as: "idea",
          pipeline: [
            {
              $project: {
                _id: 1,
                title: 1,
              },
            },
          ],
        },
      },

      {
        $unwind: {
          path: "$idea",
        },
      },

      {
        $lookup: {
          from: "users",
          localField: "updatedBy",
          foreignField: "_id",
          as: "updatedBy",
          pipeline: [
            {
              $project: {
                _id: 1,
                firstName: 1,
                lastName: 1,
              },
            },
          ],
        },
      },

      {
        $unwind: {
          path: "$updatedBy",
        },
      },

      {
        $project: {
          _id: 1,
          content: 1,
          type: 1,
          idea: 1,
          read: 1,
          createdAt: 1,
          updatedAt: 1,
          updatedBy: 1,
          isAnonymous: 1,
        },
      },

      { $sort: { createdAt: 1 } },

      { $limit: limit },

      { $skip: skip },
    ];

    const [notifications, total] = await Promise.all([
      IdeaNotification.aggregate(aggregation),
      IdeaNotification.find({
        receiver: Types.ObjectId(receiver),
      }).countDocuments(),
    ]);

    return {
      notifications,
      total,
      page: page + 1,
      totalPage:
        total % limit === 0 ? total / limit : Math.floor(total / limit) + 1,
    };
  }
}

export default IdeaNotificationService;
