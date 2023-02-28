import AuthenticationController from "@app-api/controllers/AuthenticationController";
import CategoryController from "@app-api/controllers/CategoryController";
import DepartmentController from "@app-api/controllers/DepartmentController";
import IdeaController from "@app-api/controllers/IdeaController";
import ThreadController from "@app-api/controllers/ThreadController";
import UserController from "@app-api/controllers/UserController";
import AuthenticationMiddleware from "@app-api/middlewares/AuthenticationMiddleware";
import CategoryMiddleware from "@app-api/middlewares/CategoryMiddleware";
import DepartmentMiddleware from "@app-api/middlewares/DepartmentMiddleware";
import IdeaMiddleware from "@app-api/middlewares/IdeaMiddleware";
import ThreadMiddleware from "@app-api/middlewares/ThreadMiddleware";
import UserMiddleware from "@app-api/middlewares/UserMiddleware";
import checkToken, { checkAdmin } from "@app-api/middlewares/authorization";
import ParamsValidations from "@app-api/middlewares/paramsValidation";
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
const ThreadControllerInstance =
  container.get<ThreadController>(ThreadController);
const CategoryControllerInstance =
  container.get<CategoryController>(CategoryController);
const IdeaControllerInstance = container.get<IdeaController>(IdeaController);

router.get("/test", (req, res) => {
  res.send({ foo: "bar" });
});

// admin

/// auth

router.post(
  "/admin/auth/signup",
  AuthenticationMiddleware.signUp,
  ParamsValidations.validationRequest,
  ParamsValidations.preventUnknownData,
  checkToken,
  checkAdmin,
  AuthenticationControllerInstance.signup.bind(AuthenticationControllerInstance)
);

router.put(
  "/admin/auth/:userId/deactivate",
  AuthenticationMiddleware.deactivateUserAccount,
  ParamsValidations.validationRequest,
  ParamsValidations.preventUnknownData,
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
  ParamsValidations.validationRequest,
  ParamsValidations.preventUnknownData,
  checkToken,
  checkAdmin,
  DepartmentControllerInstance.createDepartment.bind(
    DepartmentControllerInstance
  )
);

router.get(
  "/admin/department/list",
  DepartmentMiddleware.getListDepartment,
  ParamsValidations.validationRequest,
  ParamsValidations.preventUnknownData,
  checkToken,
  checkAdmin,
  DepartmentControllerInstance.getListDepartment.bind(
    DepartmentControllerInstance
  )
);

/// user

router.get(
  "/admin/user/list",
  UserMiddleware.getListUser,
  ParamsValidations.validationRequest,
  ParamsValidations.preventUnknownData,
  checkToken,
  checkAdmin,
  UserControllerInstance.getListUser.bind(UserControllerInstance)
);

/// thread

router.post(
  "/admin/thread/create",
  ThreadMiddleware.create,
  ParamsValidations.validationRequest,
  ParamsValidations.preventUnknownData,
  checkToken,
  checkAdmin,
  ThreadControllerInstance.createThread.bind(ThreadControllerInstance)
);

// auth

router.put(
  "/auth/activate/:code",
  AuthenticationMiddleware.activateUserAccount,
  ParamsValidations.validationRequest,
  ParamsValidations.preventUnknownData,
  AuthenticationControllerInstance.activeUserAccount.bind(
    AuthenticationControllerInstance
  )
);

router.post(
  "/auth/login",
  AuthenticationMiddleware.login,
  ParamsValidations.validationRequest,
  ParamsValidations.preventUnknownData,
  AuthenticationControllerInstance.login.bind(AuthenticationControllerInstance)
);

router.put(
  "/auth/request-reset-password",
  AuthenticationMiddleware.requestResetPassword,
  ParamsValidations.validationRequest,
  ParamsValidations.preventUnknownData,
  AuthenticationControllerInstance.requestResetPassword.bind(
    AuthenticationControllerInstance
  )
);

router.put(
  "/auth/reset-password/:code",
  AuthenticationMiddleware.resetPassword,
  ParamsValidations.validationRequest,
  ParamsValidations.preventUnknownData,
  AuthenticationControllerInstance.resetPassword.bind(
    AuthenticationControllerInstance
  )
);

router.post(
  "/auth/request-activation-code",
  AuthenticationMiddleware.requestActivationCode,
  ParamsValidations.validationRequest,
  ParamsValidations.preventUnknownData,
  AuthenticationControllerInstance.requestActivationCode.bind(
    AuthenticationControllerInstance
  )
);

// user

router.put(
  "/user/:userId/change-password",
  UserMiddleware.changePassword,
  ParamsValidations.validationRequest,
  ParamsValidations.preventUnknownData,
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
  ParamsValidations.validationRequest,
  ParamsValidations.preventUnknownData,
  checkToken,
  UserControllerInstance.updateProfile.bind(UserControllerInstance)
);

router.put(
  "/user/:userId/upload-avatar",
  UserMiddleware.uploadAvatar,
  ParamsValidations.validationRequest,
  ParamsValidations.preventUnknownData,
  checkToken,
  // upload.single("picture"),
  UserControllerInstance.uploadAvatar.bind(UserControllerInstance)
);

// category

router.post(
  "/category/create",
  CategoryMiddleware.create,
  ParamsValidations.validationRequest,
  ParamsValidations.preventUnknownData,
  checkToken,
  CategoryControllerInstance.createCategory.bind(CategoryControllerInstance)
);

router.get(
  "/category/list",
  CategoryMiddleware.getListCategory,
  ParamsValidations.validationRequest,
  ParamsValidations.preventUnknownData,
  checkToken,
  CategoryControllerInstance.getListCategory.bind(CategoryControllerInstance)
);

router.put(
  "/category/:categoryId/deactivate",
  CategoryMiddleware.deactivate,
  ParamsValidations.validationRequest,
  ParamsValidations.preventUnknownData,
  checkToken,
  CategoryControllerInstance.deactivateCategory.bind(CategoryControllerInstance)
);

/// idea

router.post(
  "/idea/create",
  IdeaMiddleware.create,
  ParamsValidations.validationRequest,
  ParamsValidations.preventUnknownData,
  checkToken,
  IdeaControllerInstance.createIdea.bind(IdeaControllerInstance)
);

router.get(
  "/idea/list",
  IdeaMiddleware.getListIdea,
  ParamsValidations.validationRequest,
  ParamsValidations.preventUnknownData,
  checkToken,
  IdeaControllerInstance.getListIdea.bind(IdeaControllerInstance)
);

router.put(
  "/idea/:ideaId/like-dislike/:action",
  IdeaMiddleware.likeDislikeIdea,
  ParamsValidations.validationRequest,
  ParamsValidations.preventUnknownData,
  checkToken,
  IdeaControllerInstance.likeDislikeIdea.bind(IdeaControllerInstance)
);

router.put(
  "/idea/:ideaId/view",
  IdeaMiddleware.view,
  ParamsValidations.validationRequest,
  ParamsValidations.preventUnknownData,
  checkToken,
  IdeaControllerInstance.viewIdea.bind(IdeaControllerInstance)
);

router.put(
  "/idea/:ideaId/comment",
  IdeaMiddleware.addComment,
  ParamsValidations.validationRequest,
  ParamsValidations.preventUnknownData,
  checkToken,
  IdeaControllerInstance.addComment.bind(IdeaControllerInstance)
);

router.delete(
  "/idea/:ideaId/comment/:commentId/delete",
  IdeaMiddleware.deleteComment,
  ParamsValidations.validationRequest,
  ParamsValidations.preventUnknownData,
  checkToken,
  IdeaControllerInstance.deleteComment.bind(IdeaControllerInstance)
);

router.put(
  "/idea/:ideaId/edit-comment/:commentId",
  IdeaMiddleware.editComment,
  ParamsValidations.validationRequest,
  ParamsValidations.preventUnknownData,
  checkToken,
  IdeaControllerInstance.editComment.bind(IdeaControllerInstance)
);

router.use(function (req: Request, res: Response) {
  return res.errorRes({
    errorCode: "40",
    message: "Invalid API Route",
    data: {},
  });
});

export default router;
