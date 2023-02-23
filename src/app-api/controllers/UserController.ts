import { Request, Response, validateRequest } from "@app-helpers/http.extends";
import { USER_STATUS, UserModelInterface } from "@app-repositories/models/User";
import TYPES from "@app-repositories/types";
import { IEventService, IUserService } from "@app-services/interfaces";
import CONSTANTS from "@app-utils/constants";
import { Result } from "express-validator";
import { inject, injectable } from "inversify";
import bcrypt = require("bcryptjs");
import { EVENT_ACTION, EVENT_SCHEMA } from "@app-repositories/models/Event";

@injectable()
class UserController {
  @inject(TYPES.UserService) private readonly userService: IUserService;
  @inject(TYPES.EventService) private readonly eventService: IEventService;

  async changePassword(req: Request, res: Response) {
    try {
      const result: Result = validateRequest(req);

      if (!result.isEmpty()) {
        return res.errorRes({ errors: result.array() });
      }

      const { userId } = req.params;
      const { oldPassword, newPassword } = req.body;

      const user: UserModelInterface = await this.userService.getUserById(
        userId
      );

      if (!user) {
        return res.errorRes(CONSTANTS.SERVER_ERROR.USER_NOT_EXIST);
      }

      const isMatch: boolean = await bcrypt.compare(oldPassword, user.password);

      if (!isMatch) {
        return res.errorRes(CONSTANTS.SERVER_ERROR.WRONG_PASSWORD);
      }

      const password = await bcrypt.hash(newPassword, 10);

      const updatedUser = await this.userService.updatePassword(
        userId,
        password
      );

      if (!updatedUser) {
        return res.internal({});
      }

      await this.eventService.createEvent({
        schema: EVENT_SCHEMA.USER,
        action: EVENT_ACTION.UPDATE,
        schemaId: user._id,
        actor: req.headers.userId,
        description: "/user/change-password",
        createdAt: new Date(),
      });

      return res.successRes({
        data: {
          firstName: updatedUser.firstName,
          lastName: updatedUser.lastName,
          email: updatedUser.email,
          avatar: updatedUser.avatar,
          status: updatedUser.status,
          role: updatedUser.role,
          address: updatedUser.address,
          dob: updatedUser.dob,
          phoneNumber: updatedUser.phoneNumber,
          gender: updatedUser.gender,
          createdAt: updatedUser.createdAt,
          _id: updatedUser._id,
        },
      });
    } catch (error) {
      return res.internal({ message: error.message });
    }
  }

  async getProfile(req: Request, res: Response) {
    try {
      const result: Result = validateRequest(req);

      if (!result.isEmpty()) {
        return res.errorRes({ errors: result.array() });
      }

      const { userId } = req.headers;

      const user: UserModelInterface = await this.userService.getUserById(
        userId
      );

      if (!user) {
        return res.errorRes(CONSTANTS.SERVER_ERROR.USER_NOT_EXIST);
      }

      await this.eventService.createEvent({
        schema: EVENT_SCHEMA.USER,
        action: EVENT_ACTION.READ,
        schemaId: userId,
        actor: userId,
        description: "/user/profile",
        createdAt: new Date(),
      });

      return res.successRes({
        data: {
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          avatar: user.avatar,
          status: user.status,
          role: user.role,
          address: user.address,
          dob: user.dob,
          phoneNumber: user.phoneNumber,
          gender: user.gender,
          createdAt: user.createdAt,
          _id: user._id,
        },
      });
    } catch (error) {
      console.log("error", error);
      return res.internal({ message: error.message });
    }
  }

  async updateProfile(req: Request, res: Response) {
    try {
      const result: Result = validateRequest(req);

      if (!result.isEmpty()) {
        return res.errorRes({ errors: result.array() });
      }

      const { userId } = req.params;

      const user: UserModelInterface = await this.userService.getUserById(
        userId
      );

      if (!user) {
        return res.errorRes(CONSTANTS.SERVER_ERROR.USER_NOT_EXIST);
      }

      if (user.status !== USER_STATUS.ACTIVE) {
        return res.errorRes(CONSTANTS.SERVER_ERROR.ACCOUNT_NOT_ACTIVATED);
      }

      const updatedUser: UserModelInterface = await this.userService.update(
        userId,
        req.body
      );

      if (!updatedUser) {
        return res.internal({});
      }

      return res.successRes({
        data: {
          firstName: updatedUser.firstName,
          lastName: updatedUser.lastName,
          email: updatedUser.email,
          avatar: updatedUser.avatar,
          status: updatedUser.status,
          role: updatedUser.role,
          address: updatedUser.address,
          dob: updatedUser.dob,
          phoneNumber: updatedUser.phoneNumber,
          gender: updatedUser.gender,
          createdAt: updatedUser.createdAt,
          _id: updatedUser._id,
        },
      });
    } catch (error) {
      console.log("error", error);
      return res.internal({ message: error.message });
    }
  }

  async uploadAvatar(req: Request, res: Response) {
    try {
      const { userId } = req.params;

      const user: UserModelInterface = await this.userService.getUserById(
        userId
      );

      if (!user) {
        return res.errorRes(CONSTANTS.SERVER_ERROR.USER_NOT_EXIST);
      }

      if (user.status !== USER_STATUS.ACTIVE) {
        return res.errorRes(CONSTANTS.SERVER_ERROR.ACCOUNT_NOT_ACTIVATED);
      }

      const { img } = req.body;

      const updatedUser: UserModelInterface =
        await this.userService.uploadAvatar(userId, img);

      if (!updatedUser) {
        return res.internal({});
      }

      return res.successRes({ data: {} });
    } catch (error) {
      console.log("error", error);
      return res.internal({ message: error.message });
    }
  }
}

export default UserController;
