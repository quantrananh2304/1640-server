import { injectable } from "inversify";
import { GET_LIST_CATEGORY_SORT, ICategoryService } from "./interfaces";
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

  async getListCategory(filter: {
    page: number;
    limit: number;
    sort: GET_LIST_CATEGORY_SORT;
  }): Promise<{
    categories: CategoryModelInterface[];
    total: number;
    page: number;
    totalPage: number;
  }> {
    const { page, limit } = filter;

    const skip = page * limit;

    let sort = {};

    switch (filter.sort) {
      case GET_LIST_CATEGORY_SORT.DATE_CRATED_DESC:
        sort = {
          createdAt: -1,
        };
        break;

      case GET_LIST_CATEGORY_SORT.DATE_CREATED_ASC:
        sort = {
          createdAt: 1,
        };
        break;

      case GET_LIST_CATEGORY_SORT.NAME_ASC:
        sort = {
          name: 1,
        };
        break;

      case GET_LIST_CATEGORY_SORT.NAME_DESC:
        sort = {
          name: -1,
        };
        break;

      default:
        break;
    }

    const [categories, total] = await Promise.all([
      Category.find({}).select("-__v").sort(sort).limit(limit).skip(skip),
      Category.find({}).countDocuments(),
    ]);

    return {
      categories,
      total,
      page: page + 1,
      totalPage:
        total % limit === 0 ? total / limit : Math.floor(total / limit) + 1,
    };
  }

  async deactivateCategory(
    _id: string,
    actor: string
  ): Promise<CategoryModelInterface> {
    const updatedCategory: CategoryModelInterface =
      await Category.findByIdAndUpdate(
        _id,
        {
          $set: {
            status: CATEGORY_STATUS.INACTIVE,
            updatedAt: new Date(),
            updatedBy: Types.ObjectId(actor),
          },
        },
        { new: true, useFindAndModify: false }
      );

    return updatedCategory;
  }
}

export default CategoryService;
