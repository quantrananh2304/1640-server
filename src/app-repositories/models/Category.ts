import { Schema, Types, model } from "mongoose";
import { USER_COLLECTION_NAME } from "./User";
import { BaseModelInterface } from "./BaseModelInterface";

export const CATEGORY_COLLECTION_NAME = "Categories";

export enum CATEGORY_STATUS {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
}

export interface CategoryModelInterface extends BaseModelInterface {
  name: string;
  status: CATEGORY_STATUS;
  closureDate: Date;
  finalClosureDate: Date;
  createdAt: Date;
  updatedAt: Date;
  updatedBy: string | Types.ObjectId;
}

const categorySchema = new Schema({
  name: {
    type: String,
    required: true,
    default: "",
  },
  status: {
    type: CATEGORY_STATUS,
    required: true,
    default: CATEGORY_STATUS.ACTIVE,
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

export default model<CategoryModelInterface>(
  CATEGORY_COLLECTION_NAME,
  categorySchema
);
