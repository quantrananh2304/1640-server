import { EventModelInterface } from "@app-repositories/models/Event";
import {
  USER_GENDER,
  USER_ROLE,
  UserModelInterface,
} from "@app-repositories/models/User";

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

  getUserById(userId: string): Promise<UserModelInterface>;

  find(_user: any): Promise<UserModelInterface>;
}

export interface IEventService {
  createEvent(_event: EventModelInterface): Promise<EventModelInterface>;
}
