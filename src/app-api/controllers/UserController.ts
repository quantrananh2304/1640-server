import { Request, Response } from "@app-helpers/http.extends";
import { USER_STATUS, UserModelInterface } from "@app-repositories/models/User";
import TYPES from "@app-repositories/types";
import {
  IDepartmentService,
  IEventService,
  IUserService,
} from "@app-services/interfaces";
import CONSTANTS from "@app-utils/constants";
import { inject, injectable } from "inversify";
import bcrypt = require("bcryptjs");
import { EVENT_ACTION, EVENT_SCHEMA } from "@app-repositories/models/Event";
import { DepartmentModelInterface } from "@app-repositories/models/Department";

@injectable()
class UserController {
  @inject(TYPES.UserService) private readonly userService: IUserService;
  @inject(TYPES.EventService) private readonly eventService: IEventService;
  @inject(TYPES.DepartmentService)
  private readonly departmentService: IDepartmentService;

  async changePassword(req: Request, res: Response) {
    try {
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
        password,
        userId
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
          department: user.department,
        },
      });
    } catch (error) {
      console.log("error", error);
      return res.internal({ message: error.message });
    }
  }

  async updateProfile(req: Request, res: Response) {
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

      const updatedUser: UserModelInterface = await this.userService.update(
        userId,
        req.body
      );

      if (!updatedUser) {
        return res.internal({});
      }

      await this.eventService.createEvent({
        schema: EVENT_SCHEMA.USER,
        action: EVENT_ACTION.UPDATE,
        schemaId: userId,
        actor: req.headers.userId,
        description: "/user/update",
        createdAt: new Date(),
      });

      const result: UserModelInterface = await this.userService.getUserById(
        String(updatedUser._id)
      );

      return res.successRes({ data: result });
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
        await this.userService.uploadAvatar(userId, img, req.headers.userId);

      if (!updatedUser) {
        return res.internal({});
      }

      await this.eventService.createEvent({
        schema: EVENT_SCHEMA.USER,
        action: EVENT_ACTION.UPDATE,
        schemaId: userId,
        actor: req.headers.userId,
        description: "/user/upload-avatar",
        createdAt: new Date(),
      });

      return res.successRes({ data: {} });
    } catch (error) {
      console.log("error", error);
      return res.internal({ message: error.message });
    }
  }

  async getListUser(req: Request, res: Response) {
    try {
      const { page, limit, sort } = req.query;

      const user = await this.userService.getListUser({
        page: Number(page) - 1,
        limit: Number(limit),
        sort,
      });

      if (!user) {
        return res.internal({});
      }

      await this.eventService.createEvent({
        schema: EVENT_SCHEMA.USER,
        action: EVENT_ACTION.READ,
        schemaId: null,
        actor: req.headers.userId,
        description: "/user/list",
        createdAt: new Date(),
      });

      return res.successRes({
        data: user,
      });
    } catch (error) {
      console.log("error", error);
      return res.internal({ message: error.message });
    }
  }

  async changeDepartment(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      const { departmentId } = req.body;

      const user: any = await this.userService.getUserById(userId);

      if (!user) {
        return res.errorRes(CONSTANTS.SERVER_ERROR.USER_NOT_EXIST);
      }

      const department: DepartmentModelInterface =
        await this.departmentService.getDepartmentById(departmentId);

      if (!department) {
        return res.errorRes(CONSTANTS.SERVER_ERROR.DEPARTMENT_NOT_EXISTED);
      }

      if (String(user.department._id) === String(department._id)) {
        return res.errorRes(CONSTANTS.SERVER_ERROR.USER_ALREADY_IN_DEPARTMENT);
      }

      const updatedUser = await this.userService.changeDepartment(
        userId,
        departmentId,
        req.headers.userId
      );

      if (!updatedUser) {
        return res.internal({});
      }

      await this.eventService.createEvent({
        schema: EVENT_SCHEMA.USER,
        action: EVENT_ACTION.UPDATE,
        schemaId: user._id,
        actor: req.headers.userId,
        description: "/user/change-department",
        createdAt: new Date(),
      });

      const result: UserModelInterface = await this.userService.getUserById(
        String(updatedUser._id)
      );

      return res.successRes({ data: result });
    } catch (error) {
      return res.internal({ message: error.message });
    }
  }
}

export default UserController;
