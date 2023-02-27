import { injectable } from "inversify";
import { IThreadService } from "./interfaces";
import Thread, {
  THREAD_STATUS,
  ThreadModelInterface,
} from "@app-repositories/models/Thread";
import { isBefore } from "date-fns";
import { Types } from "mongoose";

@injectable()
class ThreadService implements IThreadService {
  async createThread(
    _thread: {
      name: string;
      description: string;
      note: string;
      closureDate: string | Date;
      finalClosureDate: string | Date;
    },
    actor: string
  ): Promise<ThreadModelInterface> {
    const today: Date = new Date();
    const closureDate: Date = new Date(_thread.closureDate);
    const finalClosureDate: Date = new Date(_thread.finalClosureDate);

    const newThread: ThreadModelInterface = await Thread.create({
      ..._thread,
      closureDate,
      finalClosureDate,
      status: isBefore(new Date(_thread.finalClosureDate), today)
        ? THREAD_STATUS.EXPIRED
        : isBefore(new Date(_thread.closureDate), today)
        ? THREAD_STATUS.SOFT_EXPIRED
        : THREAD_STATUS.ACTIVE,
      createdAt: today,
      updatedAt: today,
      updatedBy: Types.ObjectId(actor),
    });

    return newThread;
  }

  async getThreadByName(name: string): Promise<ThreadModelInterface> {
    const thread: ThreadModelInterface = await Thread.findOne({ name }).lean();

    return thread;
  }
}

export default ThreadService;
