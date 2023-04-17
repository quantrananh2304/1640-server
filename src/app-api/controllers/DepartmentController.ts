import { Request, Response } from "@app-helpers/http.extends";
import {
  DEPARTMENT_STATUS,
  DepartmentModelInterface,
} from "@app-repositories/models/Department";
import { EVENT_ACTION, EVENT_SCHEMA } from "@app-repositories/models/Event";
import TYPES from "@app-repositories/types";
import { IDepartmentService, IEventService } from "@app-services/interfaces";
import CONSTANTS from "@app-utils/constants";
import { inject, injectable } from "inversify";

@injectable()
class DepartmentController {
  @inject(TYPES.DepartmentService)
  private readonly departmentService: IDepartmentService;
  @inject(TYPES.EventService) private readonly eventService: IEventService;

  async createDepartment(req: Request, res: Response) {
    try {
      const { name, note } = req.body;

      const department: DepartmentModelInterface =
        await this.departmentService.getDepartmentByName(name);

      if (department) {
        return res.errorRes(CONSTANTS.SERVER_ERROR.DEPARTMENT_EXISTED);
      }

      const newDepartment: DepartmentModelInterface =
        await this.departmentService.createDepartment(
          { name, note },
          req.headers.userId
        );

      if (!newDepartment) {
        return res.internal({});
      }

      await this.eventService.createEvent({
        schema: EVENT_SCHEMA.DEPARTMENT,
        action: EVENT_ACTION.CREATE,
        schemaId: newDepartment._id,
        actor: req.headers.userId,
        description: "/department/create",
        createdAt: new Date(),
      });

      const result: DepartmentModelInterface =
        await this.departmentService.getDepartmentById(
          String(newDepartment._id)
        );

      return res.successRes({ data: result });
    } catch (error) {
      console.log("error", error);
      return res.internal({ message: error.message });
    }
  }

  async getListDepartment(req: Request, res: Response) {
    try {
      const { page, limit, sort } = req.query;

      const department = await this.departmentService.getListDepartment({
        page: Number(page) - 1,
        limit: Number(limit),
        sort,
      });

      if (!department) {
        return res.internal({});
      }

      await this.eventService.createEvent({
        schema: EVENT_SCHEMA.DEPARTMENT,
        action: EVENT_ACTION.READ,
        schemaId: null,
        actor: req.headers.userId,
        description: "/department/list",
        createdAt: new Date(),
      });

      return res.successRes({
        data: department,
      });
    } catch (error) {
      console.log("error", error);
      return res.internal({ message: error.message });
    }
  }

  async toggleActivateDepartment(req: Request, res: Response) {
    try {
      const { departmentId, action } = req.params;
      const { userId } = req.headers;

      const department: DepartmentModelInterface =
        await this.departmentService.getDepartmentById(departmentId);

      if (!department) {
        return res.errorRes(CONSTANTS.SERVER_ERROR.DEPARTMENT_NOT_EXISTED);
      }

      if (action === "activate") {
        if (department.status === DEPARTMENT_STATUS.ACTIVE) {
          return res.errorRes(CONSTANTS.SERVER_ERROR.DEPARTMENT_ALREADY_ACTIVE);
        }

        const newDepartment: DepartmentModelInterface =
          await this.departmentService.activateDepartment(departmentId, userId);

        if (!newDepartment) {
          return res.internal({});
        }
      } else if (action === "deactivate") {
        if (department.status === DEPARTMENT_STATUS.INACTIVE) {
          return res.errorRes(
            CONSTANTS.SERVER_ERROR.DEPARTMENT_ALREADY_INACTIVE
          );
        }

        const newDepartment: DepartmentModelInterface =
          await this.departmentService.deactivateDepartment(
            departmentId,
            userId
          );

        if (!newDepartment) {
          return res.internal({});
        }
      }

      await this.eventService.createEvent({
        schema: EVENT_SCHEMA.DEPARTMENT,
        action: EVENT_ACTION.UPDATE,
        schemaId: departmentId,
        actor: userId,
        description: `/department/${action}`,
        createdAt: new Date(),
      });

      const updatedDepartment: DepartmentModelInterface =
        await this.departmentService.getDepartmentById(departmentId);

      return res.successRes({ data: updatedDepartment });
    } catch (error) {
      console.log("error", error);
      return res.internal({ message: error.message });
    }
  }
}

export default DepartmentController;
