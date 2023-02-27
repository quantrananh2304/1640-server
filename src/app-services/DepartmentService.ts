import { injectable } from "inversify";
import { GET_LIST_DEPARTMENT_SORT, IDepartmentService } from "./interfaces";
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

  async getListDepartment(filter: {
    page: number;
    limit: number;
    sort: GET_LIST_DEPARTMENT_SORT;
  }): Promise<{
    departments: DepartmentModelInterface[];
    total: number;
    page: number;
    totalPage: number;
  }> {
    const { page, limit } = filter;

    const skip = page * limit;

    let sort = {};

    switch (filter.sort) {
      case GET_LIST_DEPARTMENT_SORT.DATE_CREATED_ASC:
        sort = {
          createdAt: 1,
        };
        break;

      case GET_LIST_DEPARTMENT_SORT.DATE_CREATED_DESC:
        sort = {
          createdAt: -1,
        };
        break;

      case GET_LIST_DEPARTMENT_SORT.NAME_ASC:
        sort = {
          name: 1,
        };
        break;

      case GET_LIST_DEPARTMENT_SORT.NAME_DESC:
        sort = {
          name: -1,
        };
        break;

      default:
        break;
    }

    const [departments, total] = await Promise.all([
      Department.find({}).select("-__v").sort(sort).limit(limit).skip(skip),
      Department.find({}).countDocuments(),
    ]);

    return {
      departments,
      total,
      page: page + 1,
      totalPage:
        total % limit === 0 ? total / limit : Math.floor(total / limit) + 1,
    };
  }

  async getDepartmentById(_id: string): Promise<DepartmentModelInterface> {
    const department: DepartmentModelInterface = await Department.findById(_id);

    return department;
  }
}

export default DepartmentService;
