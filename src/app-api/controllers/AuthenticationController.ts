import { Request, Response, validateRequest } from "@app-helpers/http.extends";
import TYPES from "@app-repositories/types";
import { USER_STATUS, UserModelInterface } from "@app-repositories/models/User";
import { IEventService, IUserService } from "@app-services/interfaces";
import CONSTANTS from "@app-utils/constants";
import { Result } from "express-validator";
import { inject, injectable } from "inversify";
import bcrypt = require("bcryptjs");
import jwt = require("jsonwebtoken");
import { RANDOM_TOKEN_SECRET } from "@app-configs";
import { EVENT_ACTION, EVENT_SCHEMA } from "@app-repositories/models/Event";
import { isBefore } from "date-fns";

@injectable()
class AuthenticationController {
  @inject(TYPES.UserService) private readonly userService: IUserService;
  @inject(TYPES.EventService) private readonly eventService: IEventService;
  @inject(TYPES.NodeMailer) private readonly nodeMailer: any;

  async login(req: Request, res: Response) {
    try {
      const result: Result = validateRequest(req);

      if (!result.isEmpty()) {
        return res.errorRes({ errors: result.array() });
      }

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
        { userId: String(user._id) },
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
          ...user,
          token,
        },
      });
    } catch (error) {
      return res.internal({ message: error.message });
    }
  }

  async signup(req: Request, res: Response) {
    try {
      const result: Result = validateRequest(req);

      if (!result.isEmpty()) {
        return res.errorRes({ errors: result.array() });
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

      return res.successRes({ data: user });
    } catch (error) {
      console.log("err", error);
      res.internal({ message: error.message });
    }
  }

  async activeUserAccount(req: Request, res: Response) {
    try {
      const result: Result = validateRequest(req);

      if (!result.isEmpty()) {
        return res.errorRes({ errors: result.array() });
      }

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

      const activatedUser: UserModelInterface =
        await this.userService.activateUser(String(user._id), user._id);

      await this.eventService.createEvent({
        schema: EVENT_SCHEMA.USER,
        action: EVENT_ACTION.UPDATE,
        schemaId: user._id,
        actor: user._id,
        description: "/auth/activate",
        createdAt: new Date(),
      });

      return res.successRes({ data: activatedUser });
    } catch (error) {
      console.log("error", error);
      res.internal({ message: error.message });
    }
  }

  async requestResetPassword(req: Request, res: Response) {
    try {
      const result: Result = validateRequest(req);

      if (!result.isEmpty()) {
        return res.errorRes({ errors: result.array() });
      }

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

      const updatedUser = await this.userService.generateNewCode(user._id);

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
      const result: Result = validateRequest(req);

      if (!result.isEmpty()) {
        return res.errorRes({ errors: result.array() });
      }

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

      const updatedUser = await this.userService.updatePassword(
        user._id,
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
        description: "/auth/reset-password",
        createdAt: new Date(),
      });

      return res.successRes({ data: updatedUser });
    } catch (error) {
      console.log("error", error);
      return res.internal({ message: error.message });
    }
  }
}

export default AuthenticationController;
