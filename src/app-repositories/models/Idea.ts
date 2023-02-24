import { Schema, Types, model } from "mongoose";
import { USER_COLLECTION_NAME } from "./User";
import { CATEGORY_COLLECTION_NAME } from "./Category";
import { BaseModelInterface } from "./BaseModelInterface";
import { THREAD_COLLECTION_NAME } from "./Thread";

export const IDEA_COLLECTION_NAME = "Ideas";

export interface IdeaModelInterface extends BaseModelInterface {
  title: string;
  description: string;
  like: Array<{
    user: string | Types.ObjectId;
    createdAt: Date;
  }>;
  dislike: Array<{
    user: string | Types.ObjectId;
    createdAt: Date;
  }>;
  views: Array<{
    user: string | Types.ObjectId;
    createdAt: Date;
  }>;
  createdAt: Date;
  updatedAt: Date;
  updatedBy: string | Types.ObjectId;
  comments: Array<{
    content: string;
    createdBy: string | Types.ObjectId;
    createdAt: Date;
    editHistory: Array<{
      content: string;
      updatedAt: Date;
    }>;
  }>;
  documents: Array<string>;
  category: string | Types.ObjectId;
  thread: string | Types.ObjectId;
}

const ideaSchema = new Schema({
  title: {
    type: String,
    required: true,
    default: "",
  },
  description: {
    type: String,
    required: true,
    default: "",
  },
  like: [
    {
      type: {
        user: {
          type: Types.ObjectId,
          ref: USER_COLLECTION_NAME,
        },
        createdAt: Date,
      },
      default: [],
      required: true,
    },
  ],
  dislike: [
    {
      type: {
        user: {
          type: Types.ObjectId,
          ref: USER_COLLECTION_NAME,
        },
        createdAt: Date,
      },
      default: [],
      required: true,
    },
  ],
  views: [
    {
      type: {
        user: {
          type: Types.ObjectId,
          ref: USER_COLLECTION_NAME,
        },
        createdAt: Date,
      },
      default: [],
      required: true,
    },
  ],
  comments: [
    {
      type: {
        content: String,
        createdBy: {
          type: Types.ObjectId,
          ref: USER_COLLECTION_NAME,
        },
        createdAt: Date,
        editHistory: [
          {
            type: {
              content: String,
              updatedAt: Date(),
            },
            default: [],
          },
        ],
      },
      required: true,
      default: [],
    },
  ],
  documents: [
    {
      type: String,
      required: true,
      default: [],
    },
  ],
  category: {
    type: Types.ObjectId,
    ref: CATEGORY_COLLECTION_NAME,
    required: true,
  },
  createdAt: {
    type: Date,
    required: true,
    default: new Date(),
  },
  updatedAt: {
    type: Date,
    required: true,
    default: new Date(),
  },
  updatedBy: {
    type: Types.ObjectId,
    required: true,
    ref: USER_COLLECTION_NAME,
  },
  thread: {
    type: Types.ObjectId,
    required: true,
    ref: THREAD_COLLECTION_NAME,
  },
});

export default model<IdeaModelInterface>(IDEA_COLLECTION_NAME, ideaSchema);
