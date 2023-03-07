import { injectable } from "inversify";
import { GET_LIST_THREAD_SORT, IThreadService } from "./interfaces";
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

  async getThreadById(_id: string): Promise<ThreadModelInterface> {
    const thread: ThreadModelInterface = await Thread.findById(_id)
      .populate({
        path: "updatedBy",
        select: "-__v -password -code -codeExpires",
      })
      .lean();

    return thread;
  }

  async getListThread(filter: {
    page: number;
    limit: number;
    sort: GET_LIST_THREAD_SORT;
  }): Promise<{
    threads: ThreadModelInterface[];
    total: number;
    page: number;
    totalPage: number;
  }> {
    const { page, limit } = filter;

    const skip = page * limit;

    let sort = {};

    switch (filter.sort) {
      case GET_LIST_THREAD_SORT.CLOSURE_DATE_ASC:
        sort = {
          closureDate: 1,
        };
        break;

      case GET_LIST_THREAD_SORT.CLOSURE_DATE_DESC:
        sort = {
          closureDate: -1,
        };
        break;

      case GET_LIST_THREAD_SORT.DATE_CRATED_DESC:
        sort = {
          createdAt: -1,
        };
        break;

      case GET_LIST_THREAD_SORT.DATE_CREATED_ASC:
        sort = {
          createdAt: 1,
        };
        break;

      case GET_LIST_THREAD_SORT.FINAL_CLOSURE_DATE_ASC:
        sort = {
          finalClosureDate: 1,
        };
        break;

      case GET_LIST_THREAD_SORT.FINAL_CLOSURE_DATE_DESC:
        sort = {
          finalClosureDate: -1,
        };
        break;

      case GET_LIST_THREAD_SORT.NAME_ASC:
        sort = {
          name: 1,
        };
        break;

      case GET_LIST_THREAD_SORT.NAME_DESC:
        sort = {
          name: -1,
        };
        break;

      default:
        break;
    }

    const [threads, total] = await Promise.all([
      Thread.find({}).select("-__v").sort(sort).limit(limit).skip(skip),
      Thread.find({}).countDocuments(),
    ]);

    return {
      threads,
      total,
      page: page + 1,
      totalPage:
        total % limit === 0 ? total / limit : Math.floor(total / limit) + 1,
    };
  }
}

export default ThreadService;
