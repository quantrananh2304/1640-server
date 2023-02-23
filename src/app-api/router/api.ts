import AuthenticationController from "@app-api/controllers/AuthenticationController";
import UserController from "@app-api/controllers/UserController";
import AuthenticationMiddleware from "@app-api/middlewares/AuthenticationMiddleware";
import UserMiddleware from "@app-api/middlewares/UserMiddleware";
import checkToken, { checkAdmin } from "@app-api/middlewares/authorization";
import preventUnknownData from "@app-api/middlewares/preventUnmatchedData";
import { Request, Response } from "@app-helpers/http.extends";
import { container } from "@app-repositories/ioc";
import express = require("express");

const router = express.Router();

const AuthenticationControllerInstance =
  container.get<AuthenticationController>(AuthenticationController);
const UserControllerInstance = container.get<UserController>(UserController);

router.get("/test", (req, res) => {
  res.send({ foo: "bar" });
});

router.post(
  "/admin/auth/signup",
  AuthenticationMiddleware.signUp,
  preventUnknownData,
  checkToken,
  checkAdmin,
  AuthenticationControllerInstance.signup.bind(AuthenticationControllerInstance)
);

router.put(
  "/auth/activate/:code",
  AuthenticationMiddleware.activateUserAccount,
  preventUnknownData,
  AuthenticationControllerInstance.activeUserAccount.bind(
    AuthenticationControllerInstance
  )
);

router.post(
  "/auth/login",
  AuthenticationMiddleware.login,
  preventUnknownData,
  AuthenticationControllerInstance.login.bind(AuthenticationControllerInstance)
);

router.put(
  "/user/:userId/change-password",
  UserMiddleware.changePassword,
  preventUnknownData,
  checkToken,
  UserControllerInstance.changePassword.bind(UserControllerInstance)
);

router.put(
  "/auth/request-reset-password",
  AuthenticationMiddleware.requestResetPassword,
  preventUnknownData,
  AuthenticationControllerInstance.requestResetPassword.bind(
    AuthenticationControllerInstance
  )
);

router.put(
  "/auth/reset-password/:code",
  AuthenticationMiddleware.resetPassword,
  preventUnknownData,
  AuthenticationControllerInstance.resetPassword.bind(
    AuthenticationControllerInstance
  )
);

router.get(
  "/user/profile",
  checkToken,
  UserControllerInstance.getProfile.bind(UserControllerInstance)
);

router.put(
  "/user/:userId/update",
  UserMiddleware.updateProfile,
  preventUnknownData,
  checkToken,
  UserControllerInstance.updateProfile.bind(UserControllerInstance)
);

router.put(
  "/auth/:userId/deactivate",
  AuthenticationMiddleware.deactivateUserAccount,
  preventUnknownData,
  checkToken,
  checkAdmin,
  AuthenticationControllerInstance.deactivateUserAccount.bind(
    AuthenticationControllerInstance
  )
);

router.post(
  "/auth/request-activation-code",
  AuthenticationMiddleware.requestActivationCode,
  preventUnknownData,
  AuthenticationControllerInstance.requestActivationCode.bind(
    AuthenticationControllerInstance
  )
);

router.use(function (req: Request, res: Response) {
  return res.errorRes({
    errorCode: "40",
    message: "Invalid API Route",
    data: {},
  });
});

export default router;
