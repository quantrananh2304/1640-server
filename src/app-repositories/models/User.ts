import { Schema, model, Types } from "mongoose";
import { BaseModelInterface } from "./BaseModelInterface";

export const USER_COLLECTION_NAME = "Users";

export enum USER_GENDER {
  MALE = "MALE",
  FEMALE = "FEMALE",
}

export enum USER_STATUS {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
  DELETED = "DELETED",
  LOCKED = "LOCKED",
}

export enum USER_ROLE {
  QUALITY_ASSURANCE_MANAGER = "QUALITY_ASSURANCE_MANAGER",
  QUALITY_ASSURANCE_COORDINATOR = "QUALITY_ASSURANCE_COORDINATOR",
  STAFF = "STAFF",
  ADMIN = "ADMIN",
}

export interface UserModelInterface extends BaseModelInterface {
  firstName: string;
  lastName: string;
  email: string;
  avatar: string;
  password: string;
  status: USER_STATUS;
  code: string;
  codeExpires: Date;
  role: string;
  address: string;
  dob: Date;
  phoneNumber: string;
  gender: USER_GENDER | string;
  accountStatusUpdate: Array<{
    status: USER_STATUS;
    reason: string;
    updatedAt: Date;
    updatedBy: string | Types.ObjectId;
  }>;
  createdAt: Date;
  updatedAt: Date;
  updatedBy: string | Types.ObjectId;
}

const userSchema = new Schema({
  firstName: {
    type: String,
    required: true,
    default: "",
  },
  lastName: {
    type: String,
    required: true,
    default: "",
  },
  email: {
    type: String,
    required: true,
    default: "",
  },
  avatar: {
    type: String,
    default: "",
    // data: Buffer,
    // contentType: String,
  },
  password: {
    type: String,
    required: true,
    default: "",
  },
  status: {
    type: USER_STATUS,
    required: true,
    default: USER_STATUS.INACTIVE,
  },
  // code for activating the account and resetting the account's password
  code: {
    type: String,
    required: true,
    default: {},
  },
  codeExpires: {
    type: Date,
    required: true,
    default: new Date(),
  },
  role: {
    type: USER_ROLE,
    required: true,
    default: USER_ROLE.STAFF,
  },
  address: {
    type: String,
    default: "",
  },
  dob: {
    type: Date,
    required: true,
    default: new Date(),
  },
  phoneNumber: {
    type: String,
    required: true,
    default: "",
  },
  gender: {
    type: USER_GENDER && String,
    required: true,
    default: "",
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
    type: Types.ObjectId && String,
  },
});

export default model<UserModelInterface>(USER_COLLECTION_NAME, userSchema);
