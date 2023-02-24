import AuthenticationController from "@app-api/controllers/AuthenticationController";
import DepartmentController from "@app-api/controllers/DepartmentController";
import UserController from "@app-api/controllers/UserController";
import AuthenticationMiddleware from "@app-api/middlewares/AuthenticationMiddleware";
import DepartmentMiddleware from "@app-api/middlewares/DepartmentMiddleware";
import UserMiddleware from "@app-api/middlewares/UserMiddleware";
import checkToken, { checkAdmin } from "@app-api/middlewares/authorization";
import preventUnknownData from "@app-api/middlewares/preventUnmatchedData";
import { Request, Response } from "@app-helpers/http.extends";
import { container } from "@app-repositories/ioc";
import express = require("express");
// import multer = require("multer");

// const storage = multer.diskStorage({
//   destination: (req: Request, file, cb) => {
//     cb(null, "uploads");
//   },

//   filename: (req: Request, file, cb) => {
//     cb(null, file.filename + "-" + Date.now());
//   },
// });

// export const upload = multer({ storage });

const router = express.Router();

const AuthenticationControllerInstance =
  container.get<AuthenticationController>(AuthenticationController);
const UserControllerInstance = container.get<UserController>(UserController);
const DepartmentControllerInstance =
  container.get<DepartmentController>(DepartmentController);

router.get("/test", (req, res) => {
  res.send({ foo: "bar" });
});

// admin

/// auth

router.post(
  "/admin/auth/signup",
  AuthenticationMiddleware.signUp,
  preventUnknownData,
  checkToken,
  checkAdmin,
  AuthenticationControllerInstance.signup.bind(AuthenticationControllerInstance)
);

router.put(
  "/admin/auth/:userId/deactivate",
  AuthenticationMiddleware.deactivateUserAccount,
  preventUnknownData,
  checkToken,
  checkAdmin,
  AuthenticationControllerInstance.deactivateUserAccount.bind(
    AuthenticationControllerInstance
  )
);

/// department
router.post(
  "/admin/department/create",
  DepartmentMiddleware.create,
  preventUnknownData,
  checkToken,
  checkAdmin,
  DepartmentControllerInstance.createDepartment.bind(
    DepartmentControllerInstance
  )
);

// auth
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

router.post(
  "/auth/request-activation-code",
  AuthenticationMiddleware.requestActivationCode,
  preventUnknownData,
  AuthenticationControllerInstance.requestActivationCode.bind(
    AuthenticationControllerInstance
  )
);

// user

router.put(
  "/user/:userId/change-password",
  UserMiddleware.changePassword,
  preventUnknownData,
  checkToken,
  UserControllerInstance.changePassword.bind(UserControllerInstance)
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
  "/user/:userId/upload-avatar",
  UserMiddleware.uploadAvatar,
  preventUnknownData,
  checkToken,
  // upload.single("picture"),
  UserControllerInstance.uploadAvatar.bind(UserControllerInstance)
);

router.use(function (req: Request, res: Response) {
  return res.errorRes({
    errorCode: "40",
    message: "Invalid API Route",
    data: {},
  });
});

export default router;
