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
      });

    return idea;
  }
}

export default IdeaService;
