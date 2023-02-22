import AuthenticationController from "@app-api/controllers/AuthenticationController";
import UserController from "@app-api/controllers/UserController";
import AuthenticationMiddleware from "@app-api/middlewares/AuthenticationMiddleware";
import UserMiddleware from "@app-api/middlewares/UserMiddleware";
import checkToken, { checkAdmin } from "@app-api/middlewares/authorization";
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
  checkToken,
  checkAdmin,
  AuthenticationMiddleware.signUp,
  AuthenticationControllerInstance.signup.bind(AuthenticationControllerInstance)
);

router.put(
  "/auth/activate/:code",
  AuthenticationMiddleware.activateUserAccount,
  AuthenticationControllerInstance.activeUserAccount.bind(
    AuthenticationControllerInstance
  )
);

router.post(
  "/auth/login",
  AuthenticationMiddleware.login,
  AuthenticationControllerInstance.login.bind(AuthenticationControllerInstance)
);

router.put(
  "/user/:userId/change-password",
  checkToken,
  UserMiddleware.changePassword,
  UserControllerInstance.changePassword.bind(UserControllerInstance)
);

router.use(function (req: Request, res: Response) {
  res.error({
    errors: "",
    errorCode: 40,
    message: "Invalid API Route",
    data: {},
  });
});

export default router;
