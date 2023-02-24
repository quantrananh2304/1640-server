import { Schema, Types, model } from "mongoose";
import { BaseModelInterface } from "./BaseModelInterface";

export const DEPARTMENT_COLLECTION_NAME = "Departments";

export enum DEPARTMENT_STATUS {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
}

export interface DepartmentModelInterface extends BaseModelInterface {
  name: string;
  note: string;
  status: DEPARTMENT_STATUS;
  createdAt: Date;
  updatedAt: Date;
  updatedBy: string | Types.ObjectId;
}

const departmentSchema = new Schema({
  name: {
    type: String,
    required: true,
    default: "",
  },

  note: {
    type: String,
    default: "",
  },

  status: {
    type: DEPARTMENT_STATUS,
    required: true,
    default: DEPARTMENT_STATUS.ACTIVE,
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
    ref: "users",
  },
});

export default model<DepartmentModelInterface>(
  DEPARTMENT_COLLECTION_NAME,
  departmentSchema
);
