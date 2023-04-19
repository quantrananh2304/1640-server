import { Request, Response } from "@app-helpers/http.extends";
import TYPES from "@app-repositories/types";
import { USER_STATUS, UserModelInterface } from "@app-repositories/models/User";
import { IEventService, IUserService } from "@app-services/interfaces";
import CONSTANTS from "@app-utils/constants";
import bcrypt = require("bcryptjs");
import jwt = require("jsonwebtoken");
import { RANDOM_TOKEN_SECRET } from "@app-configs";
import { EVENT_ACTION, EVENT_SCHEMA } from "@app-repositories/models/Event";
import { differenceInSeconds, isBefore, sub } from "date-fns";
import { Types } from "mongoose";
import DepartmentService from "@app-services/DepartmentService";
import {
  DEPARTMENT_STATUS,
  DepartmentModelInterface,
} from "@app-repositories/models/Department";

import { inject, injectable } from "inversify";

@injectable()
class AuthenticationController {
  @inject(TYPES.UserService) private readonly userService: IUserService;
  @inject(TYPES.EventService) private readonly eventService: IEventService;
  @inject(TYPES.NodeMailer) private readonly nodeMailer: any;
  @inject(TYPES.DepartmentService)
  private readonly departmentService: DepartmentService;

  async login(req: Request, res: Response) {
    try {
      const user: UserModelInterface = await this.userService.getUserByEmail(
        req.body.email
      );

      if (!user) {
        return res.errorRes(CONSTANTS.SERVER_ERROR.USER_NOT_EXIST);
      }

      if (user.status !== USER_STATUS.ACTIVE) {
        return res.errorRes(CONSTANTS.SERVER_ERROR.ACCOUNT_NOT_ACTIVATED);
      }

      const isMatch: boolean = await bcrypt.compare(
        req.body.password,
        user.password
      );

      if (!isMatch) {
        return res.errorRes(CONSTANTS.SERVER_ERROR.WRONG_PASSWORD);
      }

      const token = jwt.sign(
        { userId: String(user._id), userRole: user.role },
        RANDOM_TOKEN_SECRET,
        {
          expiresIn: "1d",
        }
      );

      await this.eventService.createEvent({
        schema: EVENT_SCHEMA.USER,
        action: EVENT_ACTION.READ,
        schemaId: user._id,
        actor: user._id,
        description: "/auth/login",
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
          token,
        },
      });
    } catch (error) {
      return res.internal({ message: error.message });
    }
  }

  async signup(req: Request, res: Response) {
    try {
      const { department } = req.body;

      const departmentDoc: DepartmentModelInterface =
        await this.departmentService.getDepartmentById(department);

      if (
        !departmentDoc ||
        departmentDoc.status === DEPARTMENT_STATUS.INACTIVE
      ) {
        return res.errorRes(CONSTANTS.SERVER_ERROR.DEPARTMENT_NOT_EXISTED);
      }

      const user = await this.userService.createUser(req.body);

      const title = CONSTANTS.ACCOUNT_ACTIVATION;

      const body = CONSTANTS.ACCOUNT_ACTIVATION_BODY.replace(
        "{user.code}",
        user.code
      );

      await this.eventService.createEvent({
        schema: EVENT_SCHEMA.USER,
        action: EVENT_ACTION.CREATE,
        schemaId: user._id,
        actor: req.headers.userId,
        description: "/auth/signup",
        createdAt: new Date(),
      });

      await this.nodeMailer.nodeMailerSendMail([user.email], title, body);

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
      console.log("err", error);
      res.internal({ message: error.message });
    }
  }

  async activeUserAccount(req: Request, res: Response) {
    try {
      const { code } = req.params;

      const { email } = req.body;

      const user: UserModelInterface = await this.userService.getUserByEmail(
        email
      );

      const { codeExpires } = user;

      if (code !== user.code) {
        return res.errorRes(CONSTANTS.SERVER_ERROR.CODE_INVALID);
      }

      if (isBefore(new Date(codeExpires), new Date())) {
        return res.errorRes(CONSTANTS.SERVER_ERROR.CODE_EXPIRED);
      }

      if (user.status !== USER_STATUS.INACTIVE) {
        return res.errorRes(CONSTANTS.SERVER_ERROR.ACCOUNT_NOT_INACTIVE);
      }

      await this.userService.activateUser(String(user._id), user._id);

      await this.eventService.createEvent({
        schema: EVENT_SCHEMA.USER,
        action: EVENT_ACTION.UPDATE,
        schemaId: user._id,
        actor: user._id,
        description: "/auth/activate",
        createdAt: new Date(),
      });

      return res.successRes({
        data: {},
      });
    } catch (error) {
      console.log("error", error);
      res.internal({ message: error.message });
    }
  }

  async requestResetPassword(req: Request, res: Response) {
    try {
      const { email } = req.body;

      const user: UserModelInterface = await this.userService.getUserByEmail(
        email
      );

      if (!user) {
        return res.errorRes(CONSTANTS.SERVER_ERROR.USER_NOT_EXIST);
      }

      if (user.status !== USER_STATUS.ACTIVE) {
        return res.errorRes(CONSTANTS.SERVER_ERROR.ACCOUNT_NOT_ACTIVATED);
      }

      const updatedUser = await this.userService.generateNewCode(
        user._id,
        String(user._id)
      );

      const title = CONSTANTS.PASSWORD_RESET_REQUEST;

      const body = CONSTANTS.PASSWORD_RESET_REQUEST_BODY.replace(
        "{user.code}",
        updatedUser.code
      );

      await this.nodeMailer.nodeMailerSendMail([email], title, body);

      await this.eventService.createEvent({
        schema: EVENT_SCHEMA.USER,
        action: EVENT_ACTION.UPDATE,
        schemaId: updatedUser._id,
        actor: updatedUser._id,
        description: "/auth/request-reset-password",
        createdAt: new Date(),
      });

      res.successRes({ data: {} });
    } catch (error) {
      console.log("error", error);
      res.internal({ message: error.message });
    }
  }

  async resetPassword(req: Request, res: Response) {
    try {
      const { email, newPassword } = req.body;

      const { code } = req.params;

      const user: UserModelInterface = await this.userService.getUserByEmail(
        email
      );

      if (!user) {
        return res.errorRes(CONSTANTS.SERVER_ERROR.USER_NOT_EXIST);
      }

      const { codeExpires } = user;

      if (user.status !== USER_STATUS.ACTIVE) {
        return res.errorRes(CONSTANTS.SERVER_ERROR.ACCOUNT_NOT_ACTIVATED);
      }

      if (code !== user.code) {
        return res.errorRes(CONSTANTS.SERVER_ERROR.CODE_INVALID);
      }

      if (isBefore(new Date(codeExpires), new Date())) {
        return res.errorRes(CONSTANTS.SERVER_ERROR.CODE_EXPIRED);
      }

      const password = await bcrypt.hash(newPassword, 10);

      const updatedUser = await this.userService.resetPassword(
        user._id,
        password,
        String(user._id)
      );

      if (!updatedUser) {
        return res.internal({});
      }

      await this.eventService.createEvent({
        schema: EVENT_SCHEMA.USER,
        action: EVENT_ACTION.UPDATE,
        schemaId: user._id,
        actor: req.headers.userId,
        description: "/auth/reset-password",
        createdAt: new Date(),
      });

      return res.successRes({
        data: {},
      });
    } catch (error) {
      console.log("error", error);
      return res.internal({ message: error.message });
    }
  }

  async deactivateUserAccount(req: Request, res: Response) {
    try {
      const { userId } = req.params;

      const user: UserModelInterface = await this.userService.find({
        _id: Types.ObjectId(userId),
      });

      if (!user) {
        return res.errorRes(CONSTANTS.SERVER_ERROR.USER_NOT_EXIST);
      }

      const deactivatedUser: UserModelInterface =
        await this.userService.deactivateUser(userId, Types.ObjectId(userId));

      if (!deactivatedUser) {
        return res.internal({});
      }

      await this.eventService.createEvent({
        schema: EVENT_SCHEMA.USER,
        action: EVENT_ACTION.UPDATE,
        schemaId: userId,
        actor: userId,
        description: "/auth/deactivate",
        createdAt: new Date(),
      });

      return res.successRes({
        data: {
          firstName: deactivatedUser.firstName,
          lastName: deactivatedUser.lastName,
          email: deactivatedUser.email,
          avatar: deactivatedUser.avatar,
          status: deactivatedUser.status,
          role: deactivatedUser.role,
          address: deactivatedUser.address,
          dob: deactivatedUser.dob,
          phoneNumber: deactivatedUser.phoneNumber,
          gender: deactivatedUser.gender,
          createdAt: deactivatedUser.createdAt,
          _id: deactivatedUser._id,
        },
      });
    } catch (error) {
      return res.internal({ message: error.message });
    }
  }

  async requestActivationCode(req: Request, res: Response) {
    try {
      const { email } = req.body;

      const user: UserModelInterface = await this.userService.getUserByEmail(
        email
      );

      if (!user) {
        return res.errorRes(CONSTANTS.SERVER_ERROR.USER_NOT_EXIST);
      }

      if (user.status === USER_STATUS.ACTIVE) {
        return res.errorRes(CONSTANTS.SERVER_ERROR.ACCOUNT_ACTIVATED);
      }

      if (user.status !== USER_STATUS.INACTIVE) {
        return res.errorRes(CONSTANTS.SERVER_ERROR.ACCOUNT_LOCKED_OR_DELETED);
      }

      const { codeExpires } = user;

      const codeCreatedTime = new Date(
        sub(new Date(codeExpires), CONSTANTS.DEFAULT_CODE_EXPIRES)
      );

      if (
        differenceInSeconds(new Date(), new Date(codeCreatedTime)) <
        CONSTANTS.MIN_CODE_REQUEST_TIME
      ) {
        return res.errorRes(CONSTANTS.SERVER_ERROR.CANNOT_REQUEST_NEW_CODE_YET);
      }

      const newCodeUser: UserModelInterface =
        await this.userService.generateNewCode(user._id, String(user._id));

      const title = CONSTANTS.ACCOUNT_ACTIVATION;

      const body = CONSTANTS.ACCOUNT_ACTIVATION_BODY.replace(
        "{user.code}",
        newCodeUser.code
      );

      await this.nodeMailer.nodeMailerSendMail(
        [newCodeUser.email],
        title,
        body
      );

      await this.eventService.createEvent({
        schema: EVENT_SCHEMA.USER,
        action: EVENT_ACTION.CREATE,
        schemaId: newCodeUser._id,
        actor: newCodeUser._id,
        description: "/auth/signup",
        createdAt: new Date(),
      });

      return res.successRes({ data: {} });
    } catch (error) {
      console.log("error", error);
      return res.internal({ message: error.message });
    }
  }
}

export default AuthenticationController;
