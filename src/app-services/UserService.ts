import { injectable } from "inversify";
import { IUserService } from "./interfaces";
import {
  USER_GENDER,
  USER_ROLE,
  USER_STATUS,
  UserModelInterface,
} from "@app-repositories/models/User";
import User from "@app-repositories/models/User";
import { ServerError } from "@app-utils/ServerError";
import bcrypt = require("bcryptjs");
import { stringGenerator } from "@app-utils/utils";
import CONSTANTS from "@app-utils/constants";
import { add } from "date-fns";
import { Types } from "mongoose";

@injectable()
class UserService implements IUserService {
  async createUser(_user: {
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
  }): Promise<any> {
    const { email, dob } = _user;

    const existedUser: UserModelInterface = await this.getUserByEmail(email);

    if (existedUser) {
      throw new ServerError(
        CONSTANTS.SERVER_ERROR.USER_EXISTED.errorCode,
        CONSTANTS.SERVER_ERROR.USER_EXISTED.message
      );
    }

    const password = await bcrypt.hash(CONSTANTS.DEFAULT_PASSWORD, 10);
    const code = stringGenerator(CONSTANTS.CODE_LENGTH);

    const user = await User.create({
      ..._user,
      password,
      code,
      codeExpires: new Date(add(new Date(), { days: 1 })),
      dob: new Date(dob),
      accountStatusUpdate: [],
      status: USER_STATUS.INACTIVE,
      createdAt: new Date(),
      updatedAt: new Date(),
      updatedBy: null,
    });

    return user;
  }

  async getUserByEmail(email: string): Promise<UserModelInterface> {
    const user: UserModelInterface = await User.findOne({
      email,
    }).lean();

    return user;
  }

  async getUserById(userId: string): Promise<UserModelInterface> {
    const user: UserModelInterface = await User.findById(
      Types.ObjectId(userId)
    ).lean();

    return user;
  }

  async activateUser(userId: string, actor?: any): Promise<UserModelInterface> {
    const currentUser = await this.getUserById(userId);

    if (!currentUser) {
      throw new ServerError(
        CONSTANTS.SERVER_ERROR.USER_EXISTED.errorCode,
        CONSTANTS.SERVER_ERROR.USER_EXISTED.message
      );
    }

    const updatedUser: UserModelInterface = await User.findByIdAndUpdate(
      userId,
      {
        $set: {
          status: USER_STATUS.ACTIVE,
          updatedBy: actor ? actor : Types.ObjectId(userId),
          updatedAt: new Date(),
        },
      },
      { new: true, useFindAndModify: false }
    );

    return updatedUser;
  }

  async find(_user: any): Promise<UserModelInterface> {
    const user: UserModelInterface = await User.findOne(_user);

    return user;
  }

  async updatePassword(
    userId: string | Types.ObjectId,
    password: string
  ): Promise<UserModelInterface> {
    const user: UserModelInterface = await User.findByIdAndUpdate(
      userId,
      {
        $set: { password },
      },
      { new: true, useFindAndModify: false }
    );

    return user;
  }
}

export default UserService;