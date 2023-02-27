import { injectable } from "inversify";
import { GET_LIST_IDEA_SORT, IIdeaService } from "./interfaces";
import Idea, { IdeaModelInterface } from "@app-repositories/models/Idea";
import { Types } from "mongoose";

@injectable()
class IdeaService implements IIdeaService {
  async createIdea(
    _idea: {
      title: string;
      description: string;
      documents: string[];
      category: Array<string>;
      thread: string;
    },
    actor: string
  ): Promise<IdeaModelInterface> {
    const newIdea: IdeaModelInterface = await Idea.create({
      ..._idea,
      category: _idea.category.map((item: string) => Types.ObjectId(item)),
      thread: Types.ObjectId(_idea.thread),
      like: [],
      dislike: [],
      views: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      updatedBy: Types.ObjectId(actor),
      comments: [],
      documents: _idea.documents,
      subscribers: [],
    });

    return newIdea;
  }

  async getIdeaByTitle(title: string): Promise<IdeaModelInterface> {
    const idea: IdeaModelInterface = await Idea.findOne({ title }).lean();

    return idea;
  }

  async getIdeaById(_id: string): Promise<IdeaModelInterface> {
    const idea: IdeaModelInterface = await Idea.findById(_id)
      .populate({ path: "category" })
      .populate({ path: "thread" })
      .populate({
        path: "updatedBy",
        populate: "department",
        select: "-__v -password -code -codeExpires",
      })
      .populate({
        path: "like.user",
        select: "-__v -password -code -codeExpires",
      })
      .populate({
        path: "dislike.user",
        select: "-__v -password -code -codeExpires",
      })
      .lean();

    return idea;
  }

  async getListIdea(filter: {
    page: number;
    limit: number;
    sort: GET_LIST_IDEA_SORT;
  }): Promise<{
    ideas: IdeaModelInterface[];
    total: number;
    page: number;
    totalPage: number;
  }> {
    const { page, limit } = filter;

    const skip = page * limit;

    let sort = {};

    switch (filter.sort) {
      case GET_LIST_IDEA_SORT.DATE_CREATED_ASC:
        sort = {
          createdAt: 1,
        };
        break;

      case GET_LIST_IDEA_SORT.DATE_CREATED_DESC:
        sort = {
          createdAt: -1,
        };
        break;

      case GET_LIST_IDEA_SORT.LATEST_COMMENT:
        sort = {
          commentsLastCreatedAt: 1,
        };
        break;

      case GET_LIST_IDEA_SORT.DISLIKE_ASC:
        sort = {
          dislikeCount: 1,
        };
        break;

      case GET_LIST_IDEA_SORT.DISLIKE_DESC:
        sort = {
          dislikeCount: -1,
        };
        break;

      case GET_LIST_IDEA_SORT.LIKE_ASC:
        sort = {
          likeCount: 1,
        };
        break;

      case GET_LIST_IDEA_SORT.LIKE_DESC:
        sort = {
          likeCount: -1,
        };
        break;

      case GET_LIST_IDEA_SORT.POPULARITY_ASC:
        sort = {
          viewCount: 1,
        };
        break;

      case GET_LIST_IDEA_SORT.POPULARITY_DESC:
        sort = {
          viewCount: -1,
        };
        break;

      default:
        break;
    }

    const aggregation = [
      {
        $lookup: {
          from: "threads",
          localField: "thread",
          foreignField: "_id",
          as: "thread",
        },
      },

      {
        $unwind: {
          path: "$thread",
        },
      },

      {
        $lookup: {
          from: "categories",
          localField: "category",
          foreignField: "_id",
          as: "category",
        },
      },

      {
        $unwind: {
          path: "$category",
          preserveNullAndEmptyArrays: true,
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
                email: 1,
                avatar: 1,
                status: 1,
                role: 1,
                address: 1,
                dob: 1,
                phoneNumber: 1,
                gender: 1,
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
          title: 1,
          createdAt: 1,
          like: 1,
          dislike: 1,
          views: 1,
          updatedAt: 1,
          updatedBy: 1,
          documents: 1,
          category: 1,
          thread: 1,
          subscribers: 1,
          _id: 1,

          dislikeCount: {
            $cond: {
              if: { $isArray: "$dislike" },
              then: { $size: "$dislike" },
              else: 0,
            },
          },

          likeCount: {
            $cond: {
              if: { $isArray: "$like" },
              then: { $size: "$like" },
              else: 0,
            },
          },

          viewCount: {
            $cond: {
              if: { $isArray: "$views" },
              then: { $size: "$views" },
              else: 0,
            },
          },

          commentLastCreated: {
            $cond: {
              if: { $isArray: "$comments" },
              then: { $max: "$comments.updatedAt" },
              else: null,
            },
          },
        },
      },

      { $sort: sort },

      { $limit: limit },

      { $skip: skip },
    ];

    const [ideas, total] = await Promise.all([
      Idea.aggregate(aggregation),
      Idea.find({}).countDocuments(),
    ]);

    return {
      ideas,
      total,
      page: page + 1,
      totalPage:
        total % limit === 0 ? total / limit : Math.floor(total / limit) + 1,
    };
  }

  async likeDislikeIdea(
    _id: string,
    action: "like" | "dislike",
    actor: string
  ): Promise<IdeaModelInterface> {
    const idea: IdeaModelInterface = await Idea.findById(_id);

    const { like, dislike } = idea;

    let update = {};

    if (action === "like") {
      if (like.map((item) => String(item.user)).includes(actor)) {
        update = {
          $pull: {
            like: {
              user: Types.ObjectId(actor),
            },
          },
        };
      } else {
        update = {
          $push: {
            like: {
              user: Types.ObjectId(actor),
              createdAt: new Date(),
            },
          },

          $pull: {
            dislike: {
              user: Types.ObjectId(actor),
            },
          },
        };
      }
    } else {
      if (dislike.map((item) => String(item.user)).includes(actor)) {
        update = {
          $pull: {
            dislike: {
              user: Types.ObjectId(actor),
            },
          },
        };
      } else {
        update = {
          $push: {
            dislike: {
              user: Types.ObjectId(actor),
              createdAt: new Date(),
            },
          },

          $pull: {
            like: {
              user: Types.ObjectId(actor),
            },
          },
        };
      }
    }

    const updatedIdea: IdeaModelInterface = await Idea.findByIdAndUpdate(
      _id,
      update,
      { new: true, useFindAndModify: false }
    );

    return updatedIdea;
  }

  async viewIdea(_id: string, actor: string): Promise<IdeaModelInterface> {
    const updatedIdea: IdeaModelInterface = await Idea.findByIdAndUpdate(
      _id,
      {
        $push: {
          views: {
            user: Types.ObjectId(actor),
            createdAt: new Date(),
          },
        },
      },
      { new: true, useFindAndModify: false }
    );

    return updatedIdea;
  }
}

export default IdeaService;
