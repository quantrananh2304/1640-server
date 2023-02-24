import { EventModelInterface } from "@app-repositories/models/Event";
import {
  USER_GENDER,
  USER_ROLE,
  UserModelInterface,
} from "@app-repositories/models/User";
import { Types } from "mongoose";
import {
  DEPARTMENT_STATUS,
  DepartmentModelInterface,
} from "@app-repositories/models/Department";

export interface IUserService {
  createUser(_user: {
    firstName: string;
    lastName: string;
    email: string;
    avatar: string;
    password: string;
    role: USER_ROLE;
    address: string;
    dob: string | Date;
    phoneNumber: string;
    gender: USER_GENDER;
  }): Promise<any>;

  getUserByEmail(email: string): Promise<UserModelInterface>;

  activateUser(userId: string, actor?: any): Promise<UserModelInterface>;

  deactivateUser(userId: string, actor?: any): Promise<UserModelInterface>;

  getUserById(userId: string): Promise<UserModelInterface>;

  find(_user: any): Promise<UserModelInterface>;

  updatePassword(
    userId: string | Types.ObjectId,
    password: string
  ): Promise<UserModelInterface>;

  generateNewCode(userId: string | Types.ObjectId): Promise<UserModelInterface>;

  update(
    userId: string | Types.ObjectId,
    _user: {
      firstName: string;
      lastName: string;
      address: string;
      dob: string | Date;
      phoneNumber: string;
      gender: USER_GENDER;
    }
  ): Promise<UserModelInterface>;

  resetPassword(
    userId: string | Types.ObjectId,
    password: string
  ): Promise<UserModelInterface>;

  uploadAvatar(
    userId: string | Types.ObjectId,
    image: string
  ): Promise<UserModelInterface>;
}

export interface IEventService {
  createEvent(_event: EventModelInterface): Promise<EventModelInterface>;
}

export interface IDepartmentService {
  createDepartment(
    _department: { name: string; note: string },
    actor: string
  ): Promise<DepartmentModelInterface>;

  getDepartmentByName(name: string): Promise<DepartmentModelInterface>;
}
