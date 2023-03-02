import { injectable } from "inversify";
import { GET_LIST_USER_SORT, IUserService } from "./interfaces";
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
      avatar: "",
      password,
      code,
      codeExpires: new Date(add(new Date(), CONSTANTS.DEFAULT_CODE_EXPIRES)),
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
    const user: UserModelInterface = await User.findById(Types.ObjectId(userId))
      .populate({ path: "department" })
      .select("-__v -password -code -codeExpires")
      .lean();

    return user;
  }

  async activateUser(userId: string, actor?: any): Promise<UserModelInterface> {
    const updatedUser: UserModelInterface = await User.findByIdAndUpdate(
      userId,
      {
        $set: {
          status: USER_STATUS.ACTIVE,
          updatedBy: actor ? actor : Types.ObjectId(userId),
          updatedAt: new Date(),
          codeExpires: new Date(),
        },
      },
      { new: true, useFindAndModify: false }
    );
    return updatedUser;
  }

  async deactivateUser(
    userId: string,
    actor?: any
  ): Promise<UserModelInterface> {
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
          status: USER_STATUS.INACTIVE,
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
    password: string,
    actor: string
  ): Promise<UserModelInterface> {
    const user: UserModelInterface = await User.findByIdAndUpdate(
      userId,
      {
        $set: {
          password,
          updatedAt: new Date(),
          updatedBy: Types.ObjectId(actor),
        },
      },
      { new: true, useFindAndModify: false }
    );

    return user;
  }

  async resetPassword(
    userId: string | Types.ObjectId,
    password: string,
    actor: string
  ): Promise<UserModelInterface> {
    const user: UserModelInterface = await User.findByIdAndUpdate(
      userId,
      {
        $set: {
          password,
          codeExpires: new Date(),
          updatedAt: new Date(),
          updatedBy: Types.ObjectId(actor),
        },
      },
      { new: true, useFindAndModify: false }
    );

    return user;
  }

  async generateNewCode(
    userId: string | Types.ObjectId,
    actor: string
  ): Promise<UserModelInterface> {
    const code = stringGenerator(CONSTANTS.CODE_LENGTH);

    const user: UserModelInterface = await User.findByIdAndUpdate(
      userId,
      {
        $set: {
          code,
          codeExpires: new Date(
            add(new Date(), CONSTANTS.DEFAULT_CODE_EXPIRES)
          ),
          updatedAt: new Date(),
          updatedBy: Types.ObjectId(actor),
        },
      },
      { new: true, useFindAndModify: false }
    );

    return user;
  }

  async update(
    userId: string | Types.ObjectId,
    {
      firstName,
      lastName,
      address,
      dob,
      phoneNumber,
      gender,
    }: {
      firstName: string;
      lastName: string;
      address: string;
      dob: string | Date;
      phoneNumber: string;
      gender: USER_GENDER;
    }
  ): Promise<UserModelInterface> {
    const user: UserModelInterface = await User.findByIdAndUpdate(
      userId,
      {
        $set: {
          firstName,
          lastName,
          address,
          dob: new Date(dob),
          phoneNumber,
          gender,
          updatedAt: new Date(),
          updatedBy: userId,
        },
      },
      { new: true, useFindAndModify: false }
    );

    return user;
  }

  async uploadAvatar(
    userId: string | Types.ObjectId,
    image: string,
    actor: string
  ): Promise<UserModelInterface> {
    const user: UserModelInterface = await User.findByIdAndUpdate(
      userId,
      {
        $set: {
          avatar: image,
          updatedAt: new Date(),
          updatedBy: Types.ObjectId(actor),
        },
      },
      { new: true, useFindAndModify: false }
    );

    return user;
  }

  async getListUser(filter: {
    page: number;
    limit: number;
    sort: GET_LIST_USER_SORT;
  }): Promise<{
    users: UserModelInterface[];
    total: number;
    page: number;
    totalPage: number;
  }> {
    const { page, limit } = filter;

    const skip = page * limit;

    let sort = {};

    switch (filter.sort) {
      case GET_LIST_USER_SORT.DATE_CREATED_ASC:
        sort = {
          createdAt: 1,
        };
        break;

      case GET_LIST_USER_SORT.DATE_CREATED_DESC:
        sort = {
          createdAt: -1,
        };
        break;

      case GET_LIST_USER_SORT.EMAIL_ASC:
        sort = {
          email: 1,
        };
        break;

      case GET_LIST_USER_SORT.EMAIL_DESC:
        sort = {
          email: -1,
        };
        break;

      case GET_LIST_USER_SORT.NAME_ASC:
        sort = {
          name: 1,
        };
        break;

      case GET_LIST_USER_SORT.NAME_DESC:
        sort = {
          name: -1,
        };
        break;

      default:
        break;
    }

    const [users, total] = await Promise.all([
      User.find({})
        .select("-password -code -codeExpires -__v")
        .populate("department")
        .sort(sort)
        .limit(limit)
        .skip(skip),
      User.find({}).countDocuments(),
    ]);

    return {
      users,
      total,
      page: page + 1,
      totalPage:
        total % limit === 0 ? total / limit : Math.floor(total / limit) + 1,
    };
  }

  async changeDepartment(
    userId: string | Types.ObjectId,
    departmentId: string,
    actor: string
  ): Promise<UserModelInterface> {
    const updatedUser: UserModelInterface = await User.findByIdAndUpdate(
      userId,
      {
        $set: {
          department: departmentId,
          updatedAt: new Date(),
          updatedBy: Types.ObjectId(actor),
        },
      },
      { new: true, useFindAndModify: false }
    );

    return updatedUser;
  }
}

export default UserService;
