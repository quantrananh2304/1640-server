import { EventModelInterface } from "@app-repositories/models/Event";
import {
  USER_GENDER,
  USER_ROLE,
  UserModelInterface,
} from "@app-repositories/models/User";
import { Types } from "mongoose";
import { DepartmentModelInterface } from "@app-repositories/models/Department";
import { ThreadModelInterface } from "@app-repositories/models/Thread";
import { CategoryModelInterface } from "@app-repositories/models/Category";
import { IdeaModelInterface } from "@app-repositories/models/Idea";
import {
  IDEA_NOTIFICATION_TYPE,
  IdeaNotificationModelInterface,
} from "@app-repositories/models/IdeaNotification";

export enum GET_LIST_USER_SORT {
  EMAIL_ASC = "EMAIL_ASC",
  EMAIL_DESC = "EMAIL_DESC",
  NAME_ASC = "NAME_ASC",
  NAME_DESC = "NAME_DESC",
  DATE_CREATED_ASC = "DATE_CREATED_ASC",
  DATE_CREATED_DESC = "DATE_CREATED_DESC",
}

export enum GET_LIST_DEPARTMENT_SORT {
  NAME_ASC = "NAME_ASC",
  NAME_DESC = "NAME_DESC",
  DATE_CREATED_ASC = "DATE_CREATED_ASC",
  DATE_CREATED_DESC = "DATE_CREATED_DESC",
}

export enum GET_LIST_IDEA_SORT {
  POPULARITY_ASC = "POPULARITY_ASC",
  POPULARITY_DESC = "POPULARITY_DESC",
  DATE_CREATED_ASC = "DATE_CREATED_ASC",
  DATE_CREATED_DESC = "DATE_CREATED_DESC",
  LATEST_COMMENT = "LATEST_COMMENT",
  LIKE_ASC = "LIE_ASC",
  LIKE_DESC = "LIKE_DESC",
  DISLIKE_ASC = "DISLIKE_ASC",
  DISLIKE_DESC = "DISLIKE_DESC",
}

export enum GET_LIST_CATEGORY_SORT {
  NAME_ASC = "NAME_ASC",
  NAME_DESC = "NAME_DESC",
  DATE_CREATED_ASC = "DATE_CREATED_ASC",
  DATE_CRATED_DESC = "DATE_CREATED_DESC",
}

export enum GET_LIST_THREAD_SORT {
  NAME_ASC = "NAME_ASC",
  NAME_DESC = "NAME_DESC",
  CLOSURE_DATE_ASC = "CLOSURE_DATE_ASC",
  CLOSURE_DATE_DESC = "CLOSURE_DATE_DESC",
  FINAL_CLOSURE_DATE_ASC = "FINAL_CLOSURE_DATE_ASC",
  FINAL_CLOSURE_DATE_DESC = "FINAL_CLOSURE_DATE_DESC",
  DATE_CREATED_ASC = "DATE_CREATED_ASC",
  DATE_CRATED_DESC = "DATE_CREATED_DESC",
}

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
    department: string;
  }): Promise<any>;

  getUserByEmail(email: string): Promise<UserModelInterface>;

  activateUser(userId: string, actor?: any): Promise<UserModelInterface>;

  deactivateUser(userId: string, actor?: any): Promise<UserModelInterface>;

  getUserById(userId: string): Promise<UserModelInterface>;

  find(_user: any): Promise<UserModelInterface>;

  updatePassword(
    userId: string | Types.ObjectId,
    password: string,
    actor: string
  ): Promise<UserModelInterface>;

  generateNewCode(
    userId: string | Types.ObjectId,
    actor: string
  ): Promise<UserModelInterface>;

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
    password: string,
    actor: string
  ): Promise<UserModelInterface>;

  uploadAvatar(
    userId: string | Types.ObjectId,
    image: string,
    actor: string
  ): Promise<UserModelInterface>;

  getListUser(filter: {
    page: number;
    limit: number;
    sort: GET_LIST_USER_SORT;
  }): Promise<{
    users: Array<UserModelInterface>;
    total: number;
    page: number;
    totalPage: number;
  }>;

  changeDepartment(
    userId: string,
    departmentId: string,
    actor: string
  ): Promise<UserModelInterface>;

  getUserByRoles(roles: Array<USER_ROLE>): Promise<Array<UserModelInterface>>;
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

  getListDepartment(filter: {
    page: number;
    limit: number;
    sort: GET_LIST_DEPARTMENT_SORT;
  }): Promise<{
    departments: Array<DepartmentModelInterface>;
    total: number;
    page: number;
    totalPage: number;
  }>;

  getDepartmentById(_id: string): Promise<DepartmentModelInterface>;
}

export interface IThreadService {
  createThread(
    _thread: {
      name: string;
      description: string;
      note: string;
      closureDate: string | Date;
      finalClosureDate: string | Date;
    },
    actor: string
  ): Promise<ThreadModelInterface>;

  getThreadByName(name: string): Promise<ThreadModelInterface>;

  getThreadById(_id: string): Promise<ThreadModelInterface>;

  getListThread(filter: {
    page: number;
    limit: number;
    sort: GET_LIST_THREAD_SORT;
  }): Promise<{
    threads: Array<ThreadModelInterface>;
    total: number;
    page: number;
    totalPage: number;
  }>;
}

export interface ICategoryService {
  createCategory(name: string, actor: string): Promise<CategoryModelInterface>;

  getCategoryByName(name: string): Promise<CategoryModelInterface>;

  getCategoryById(_id: string): Promise<CategoryModelInterface>;

  getListCategory(filter: {
    page: number;
    limit: number;
    sort: GET_LIST_CATEGORY_SORT;
  }): Promise<{
    categories: Array<CategoryModelInterface>;
    total: number;
    page: number;
    totalPage: number;
  }>;

  deactivateCategory(
    _id: string,
    actor: string
  ): Promise<CategoryModelInterface>;
}

export interface IIdeaService {
  createIdea(
    _idea: {
      title: string;
      description: string;
      documents: Array<string>;
      category: string;
      thread: string;
      isAnonymous: boolean;
      department: string;
    },
    actor: string
  ): Promise<IdeaModelInterface>;

  getIdeaByTitle(title: string): Promise<IdeaModelInterface>;

  getIdeaById(_id: string): Promise<IdeaModelInterface>;

  getListIdea(filter: {
    page: number;
    limit: number;
    sort: GET_LIST_IDEA_SORT;
    filteredBy: {
      category: Array<string>;
      thread: Array<string>;
      department: Array<string>;
    };
  }): Promise<{
    ideas: Array<IdeaModelInterface>;
    total: number;
    page: number;
    totalPage: number;
  }>;

  likeDislikeIdea(
    _id: string,
    action: "like" | "dislike",
    actor: string
  ): Promise<IdeaModelInterface>;

  viewIdea(_id: string, actor: string): Promise<IdeaModelInterface>;

  addComment(
    _id: string,
    content: string,
    isAnonymous: boolean,
    actor: string
  ): Promise<IdeaModelInterface>;

  deleteComment(ideaId: string, commentId: string): Promise<IdeaModelInterface>;

  editComment(
    ideaId: string,
    commentId: string,
    content: string
  ): Promise<IdeaModelInterface>;
}

export interface IIdeaNotificationService {
  createNotification(
    _notification: {
      content: string;
      type: IDEA_NOTIFICATION_TYPE;
      idea: string;
    },
    actor: string
  ): Promise<IdeaNotificationModelInterface>;
}
