import { injectable } from "inversify";
import { IDepartmentService } from "./interfaces";
import Department, {
  DEPARTMENT_STATUS,
  DepartmentModelInterface,
} from "@app-repositories/models/Department";
import { Types } from "mongoose";

@injectable()
class DepartmentService implements IDepartmentService {
  async createDepartment(
    _department: { name: string; note: string },
    actor: string
  ): Promise<DepartmentModelInterface> {
    const newDepartment: DepartmentModelInterface = await Department.create({
      ..._department,
      status: DEPARTMENT_STATUS.ACTIVE,
      createdAt: new Date(),
      updatedAt: new Date(),
      updatedBy: Types.ObjectId(actor),
    });

    return newDepartment;
  }

  async getDepartmentByName(name: string): Promise<DepartmentModelInterface> {
    const department: DepartmentModelInterface = await Department.findOne({
      name,
    }).lean();

    return department;
  }
}

export default DepartmentService;
