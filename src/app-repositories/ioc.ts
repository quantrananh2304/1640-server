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

const container = new Container();

container.bind(AuthenticationController).toSelf();
container.bind(UserController).toSelf();
container.bind(DepartmentController).toSelf();
container.bind(ThreadController).toSelf();

container.bind<UserService>(TYPES.UserService).to(UserService);
container.bind<EventService>(TYPES.EventService).to(EventService);
container.bind<NodeMailer>(TYPES.NodeMailer).to(NodeMailer);
container
  .bind<DepartmentService>(TYPES.DepartmentService)
  .to(DepartmentService);
container.bind<ThreadService>(TYPES.ThreadService).to(ThreadService);

export { container };
