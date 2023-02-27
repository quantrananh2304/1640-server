import { injectable } from "inversify";
import { ICategoryService } from "./interfaces";
import Category, {
  CATEGORY_STATUS,
  CategoryModelInterface,
} from "@app-repositories/models/Category";
import { Types } from "mongoose";

@injectable()
class CategoryService implements ICategoryService {
  async createCategory(
    name: string,
    actor: string
  ): Promise<CategoryModelInterface> {
    const newCategory: CategoryModelInterface = await Category.create({
      name,
      status: CATEGORY_STATUS.ACTIVE,
      createdAt: new Date(),
      updatedAt: new Date(),
      updatedBy: Types.ObjectId(actor),
    });

    return newCategory;
  }

  async getCategoryByName(name: string): Promise<CategoryModelInterface> {
    const category: CategoryModelInterface = await Category.findOne({
      name,
    }).lean();

    return category;
  }

  async getCategoryById(_id: string): Promise<CategoryModelInterface> {
    const category: CategoryModelInterface = await Category.findById(_id)
      .populate({
        path: "updatedBy",
        select: "-__v -password -code -codeExpires",
      })
      .lean();

    return category;
  }
}

export default CategoryService;
