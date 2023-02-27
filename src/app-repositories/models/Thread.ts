import { Schema, Types, model } from "mongoose";
import { BaseModelInterface } from "./BaseModelInterface";
import { USER_COLLECTION_NAME } from "./User";

export const THREAD_COLLECTION_NAME = "Threads";

export enum THREAD_STATUS {
  ACTIVE = "ACTIVE",
  SOFT_EXPIRED = "SOFT_EXPIRED",
  EXPIRED = "EXPIRED",
}

export interface ThreadModelInterface extends BaseModelInterface {
  name: string;
  description: string;
  note: string;
  closureDate: Date;
  finalClosureDate: Date;
  status: THREAD_STATUS;
  createdAt: Date;
  updatedAt: Date;
  updatedBy: string | Types.ObjectId;
}

const threadSchema = new Schema({
  name: {
    type: String,
    required: true,
    default: "",
  },

  description: {
    type: String,
    required: true,
    default: "",
  },

  note: {
    type: String,
    default: "",
  },

  closureDate: {
    type: Date,
    required: true,
    default: new Date(),
  },

  finalClosureDate: {
    type: Date,
    required: true,
    default: new Date(),
  },

  status: {
    type: THREAD_STATUS,
    required: true,
    default: THREAD_STATUS.ACTIVE,
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
});

export default model<ThreadModelInterface>(
  THREAD_COLLECTION_NAME,
  threadSchema
);
