import { Schema, Types, model } from "mongoose";
import { IDEA_COLLECTION_NAME } from "./Idea";
import { USER_COLLECTION_NAME } from "./User";
import { BaseModelInterface } from "./BaseModelInterface";

export const IDEA_NOTIFICATION_COLLECTION_NAME = "Idea_Notifications";

export enum IDEA_NOTIFICATION_TYPE {
  SUBMISSION = "SUBMISSION",
  UPDATE = "UPDATE",
  NEW_COMMENT = "NEW_COMMENT",
}

export interface IdeaNotificationModelInterface extends BaseModelInterface {
  content: string;
  type: IDEA_NOTIFICATION_TYPE;
  idea: string | Types.ObjectId;
  read: boolean;
  createdAt: Date;
  updatedAt: Date;
  updatedBy: string | Types.ObjectId;
  receiver: string | Types.ObjectId;
  isAnonymous: boolean;
}

const ideaNotificationSchema = new Schema({
  content: {
    type: String,
    required: true,
    default: "",
  },
  type: {
    type: IDEA_NOTIFICATION_TYPE,
    required: true,
    default: IDEA_NOTIFICATION_TYPE.SUBMISSION,
  },
  idea: {
    type: Types.ObjectId,
    ref: IDEA_COLLECTION_NAME,
    required: true,
  },
  read: {
    type: Boolean,
    required: true,
    default: false,
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
    ref: USER_COLLECTION_NAME,
  },
  receiver: {
    type: Types.ObjectId,
    ref: USER_COLLECTION_NAME,
  },
  isAnonymous: {
    type: Boolean,
    required: true,
    default: false,
  },
});

export default model<IdeaNotificationModelInterface>(
  IDEA_NOTIFICATION_COLLECTION_NAME,
  ideaNotificationSchema
);
