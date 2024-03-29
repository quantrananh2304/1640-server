import { Schema, Types, model } from "mongoose";
import { USER_COLLECTION_NAME } from "./User";
import { BaseModelInterface } from "./BaseModelInterface";

export const EVENT_COLLECTION_NAME = "Events";

export enum EVENT_SCHEMA {
  CATEGORY = "CATEGORY",
  IDEA = "IDEA",
  IDEA_NOTIFICATION = "IDEA_NOTIFICATION",
  USER = "USER",
  DEPARTMENT = "DEPARTMENT",
  THREAD = "THREAD",
}

export enum EVENT_ACTION {
  CREATE = "CREATE",
  READ = "READ",
  UPDATE = "UPDATE",
  DELETE = "DELETE",
}

export interface EventModelInterface extends BaseModelInterface {
  schema: EVENT_SCHEMA;
  action: EVENT_ACTION;
  schemaId: string | Types.ObjectId;
  actor: string | Types.ObjectId | null;
  description: string;
  createdAt: Date;
}

const eventSchema = new Schema({
  schema: {
    type: EVENT_SCHEMA,
    required: true,
  },
  action: {
    type: EVENT_ACTION,
    required: true,
  },
  schemaId: {
    type: String && Types.ObjectId,
    required: false,
  },
  actor: {
    type: String && Types.ObjectId,
    ref: USER_COLLECTION_NAME,
    default: null,
  },
  description: {
    type: String,
    required: true,
    default: "",
  },
  createAt: {
    type: Date,
    required: true,
    default: new Date(),
  },
});

export default model<EventModelInterface>(EVENT_COLLECTION_NAME, eventSchema);
