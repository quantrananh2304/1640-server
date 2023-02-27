import { injectable } from "inversify";
import { IIdeaService } from "./interfaces";
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
}

export default IdeaService;
