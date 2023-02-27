import AuthenticationController from "@app-api/controllers/AuthenticationController";
import UserService from "@app-services/UserService";
import { Container } from "inversify";
import TYPES from "./types";
import EventService from "@app-services/EventService";
import NodeMailer from "./smtp";
import UserController from "@app-api/controllers/UserController";
import DepartmentService from "@app-services/DepartmentService";
import DepartmentController from "@app-api/controllers/DepartmentController";
import ThreadController from "@app-api/controllers/ThreadController";
import ThreadService from "@app-services/ThreadService";
import CategoryController from "@app-api/controllers/CategoryController";
import CategoryService from "@app-services/CategoryService";
import IdeaController from "@app-api/controllers/IdeaController";
import IdeaService from "@app-services/IdeaService";

const container = new Container();

container.bind(AuthenticationController).toSelf();
container.bind(UserController).toSelf();
container.bind(DepartmentController).toSelf();
container.bind(ThreadController).toSelf();
container.bind(CategoryController).toSelf();
container.bind(IdeaController).toSelf();

container.bind<UserService>(TYPES.UserService).to(UserService);
container.bind<EventService>(TYPES.EventService).to(EventService);
container.bind<NodeMailer>(TYPES.NodeMailer).to(NodeMailer);
container
  .bind<DepartmentService>(TYPES.DepartmentService)
  .to(DepartmentService);
container.bind<ThreadService>(TYPES.ThreadService).to(ThreadService);
container.bind<CategoryService>(TYPES.CategoryService).to(CategoryService);
container.bind<IdeaService>(TYPES.IdeaService).to(IdeaService);

export { container };
