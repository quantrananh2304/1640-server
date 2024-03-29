import { Schema, Types, model } from "mongoose";
import { USER_COLLECTION_NAME, UserModelInterface } from "./User";
import { CATEGORY_COLLECTION_NAME } from "./Category";
import { BaseModelInterface } from "./BaseModelInterface";
import { THREAD_COLLECTION_NAME, ThreadModelInterface } from "./Thread";
import { DEPARTMENT_COLLECTION_NAME } from "./Department";

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
  updatedBy:
    | string
    | Types.ObjectId
    | { firstName: string; lastName: string; _id: string | Types.ObjectId }
    | any;
  comments: Array<{
    isAnonymous: boolean;
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
  category: string | Types.ObjectId;
  thread: string | Types.ObjectId | ThreadModelInterface;
  subscribers: Array<string | Types.ObjectId>;
  isAnonymous: boolean;
  department: string | Types.ObjectId | { name: string } | any;
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
        isAnonymous: Boolean,
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
  isAnonymous: {
    type: Boolean,
    default: false,
    required: true,
  },
  department: {
    type: Types.ObjectId,
    required: true,
    ref: DEPARTMENT_COLLECTION_NAME,
  },
});

export default model<IdeaModelInterface>(IDEA_COLLECTION_NAME, ideaSchema);
