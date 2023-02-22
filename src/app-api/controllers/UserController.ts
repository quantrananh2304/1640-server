import { Request, Response, validateRequest } from "@app-helpers/http.extends";
import User, { UserModelInterface } from "@app-repositories/models/User";
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

      return res.successRes({ data: updatedUser });
    } catch (error) {
      return res.internal({ message: error.message });
    }
  }
}

export default UserController;
