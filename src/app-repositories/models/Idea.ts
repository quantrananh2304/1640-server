import { Schema, Types, model } from "mongoose";
import { USER_COLLECTION_NAME, UserModelInterface } from "./User";
import { CATEGORY_COLLECTION_NAME } from "./Category";
import { BaseModelInterface } from "./BaseModelInterface";
import { THREAD_COLLECTION_NAME, ThreadModelInterface } from "./Thread";

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
    _id: string | Types.ObjectId;
    content: string;
    createdBy: string | Types.ObjectId | UserModelInterface;
    createdAt: Date;
    editHistory: Array<{
      content: string;
      createdAt: Date;
      updatedAt: Date;
    }>;
  }>;
  documents: Array<{
    contentType: string;
    name: string;
    url: string;
  }>;
  category: Array<string | Types.ObjectId>;
  thread: string | Types.ObjectId | ThreadModelInterface;
  subscribers: Array<string | Types.ObjectId>;
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
  like: {
    type: [
      {
        user: {
          type: Types.ObjectId,
          ref: USER_COLLECTION_NAME,
        },
        createdAt: Date,
      },
    ],
    default: [],
    _id: false,
  },
  dislike: {
    type: [
      {
        user: {
          type: Types.ObjectId,
          ref: USER_COLLECTION_NAME,
        },
        createdAt: Date,
      },
    ],
    default: [],
    _id: false,
  },
  views: {
    type: [
      {
        user: {
          type: Types.ObjectId,
          ref: USER_COLLECTION_NAME,
        },
        createdAt: Date,
      },
    ],
    default: [],
    _id: false,
  },
  comments: {
    type: [
      {
        content: String,
        createdAt: Date,
        createdBy: {
          type: Types.ObjectId,
          ref: USER_COLLECTION_NAME,
        },
        editHistory: {
          type: [
            {
              content: String,
              updatedAt: Date,
              createdAt: Date,
            },
          ],
          default: [],
        },
      },
    ],
    default: [],
  },
  documents: {
    type: [
      {
        contentType: String,
        name: String,
        url: String,
      },
    ],
    default: [],
    _id: false,
  },
  category: [
    {
      type: Types.ObjectId,
      ref: CATEGORY_COLLECTION_NAME,
      default: [],
      _id: false,
    },
  ],
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
  subscribers: {
    type: [
      {
        user: { type: Types.ObjectId, ref: USER_COLLECTION_NAME },
        createdAt: Date,
      },
    ],
    default: [],
    _id: false,
  },
});

export default model<IdeaModelInterface>(IDEA_COLLECTION_NAME, ideaSchema);
