import { Types } from "mongoose";

export interface BaseModelInterface {
  _id?: string | Types.ObjectId;
}
