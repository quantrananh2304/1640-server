import AuthenticationController from "@app-api/controllers/AuthenticationController";
import AuthenticationMiddleware from "@app-api/middlewares/AuthenticationMiddleware";
import { Request, Response } from "@app-helpers/http.extends";
import { container } from "@app-repositories/ioc";
import express = require("express");

const router = express.Router();

const AuthenticationControllerInstance =
  container.get<AuthenticationController>(AuthenticationController);

router.get("/test", (req, res) => {
  res.send({ foo: "bar" });
});

router.post(
  "/admin/auth/signup",
  AuthenticationMiddleware.signUp,
  AuthenticationControllerInstance.signup.bind(AuthenticationControllerInstance)
);

router.put(
  "/auth/:userId/activate/:code",
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

router.use(function (req: Request, res: Response) {
  res.error({
    errors: "",
    errorCode: 40,
    message: "Invalid API Route",
    data: {},
  });
});

export default router;
