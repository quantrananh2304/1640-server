import { Request, Response } from "@app-helpers/http.extends";
import { EVENT_ACTION } from "@app-repositories/models/Event";
import { EVENT_SCHEMA } from "@app-repositories/models/Event";
import { ThreadModelInterface } from "@app-repositories/models/Thread";
import TYPES from "@app-repositories/types";
import { IEventService, IThreadService } from "@app-services/interfaces";
import CONSTANTS from "@app-utils/constants";
import { inject, injectable } from "inversify";

@injectable()
class ThreadController {
  @inject(TYPES.ThreadService) private readonly threadService: IThreadService;
  @inject(TYPES.EventService) private readonly eventService: IEventService;

  async createThread(req: Request, res: Response) {
    try {
      const { name, description, note, closureDate, finalClosureDate } =
        req.body;

      const thread: ThreadModelInterface =
        await this.threadService.getThreadByName(name);

      if (thread) {
        return res.errorRes(CONSTANTS.SERVER_ERROR.THREAD_EXISTED);
      }

      const newThread: ThreadModelInterface =
        await this.threadService.createThread(
          { name, description, note, closureDate, finalClosureDate },
          req.headers.userId
        );

      if (!newThread) {
        return res.internal({});
      }

      await this.eventService.createEvent({
        schema: EVENT_SCHEMA.THREAD,
        action: EVENT_ACTION.CREATE,
        schemaId: newThread._id,
        actor: req.headers.userId,
        description: "/thread/create",
        createdAt: new Date(),
      });

      const result: ThreadModelInterface =
        await this.threadService.getThreadById(String(newThread._id));

      return res.successRes({ data: result });
    } catch (error) {
      console.log("error", error);
      return res.internal({ message: error.message });
    }
  }

  async getListThread(req: Request, res: Response) {
    try {
      const { page, limit, sort } = req.query;

      const thread = await this.threadService.getListThread({
        page: Number(page) - 1,
        limit: Number(limit),
        sort,
      });

      if (!thread) {
        return res.internal({});
      }

      await this.eventService.createEvent({
        schema: EVENT_SCHEMA.THREAD,
        action: EVENT_ACTION.READ,
        schemaId: null,
        actor: req.headers.userId,
        description: "/thread/list",
        createdAt: new Date(),
      });

      return res.successRes({ data: thread });
    } catch (error) {
      console.log("error", error);
      return res.internal({ message: error.message });
    }
  }
}

export default ThreadController;
