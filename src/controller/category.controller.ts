import Category from "../model/category.model";
import type { ICategory } from "../model/category.model";
import type { TypeFilter } from "../commons/TypesAndInterfaces";
import type { FilterQuery } from "mongoose";

export default class CategoryController {

    public async create(payload: ICategory) {
        const result = new Category(payload);
        const { _id } = await result.save();
        return _id;
    }

    public async update(payload: { _id: FilterQuery<Pick<ICategory, "_id">>, data: Partial<ICategory> }) {
        const result = await Category.findById(payload._id, { _id: 1 });
        if (result?.$set) {
            result.$set(payload.data);
            result.save();
        }
        return result;
    }

    public async remove(payload: { _id: FilterQuery<Pick<ICategory, "_id">> }) {
        const result = await Category.deleteOne({ _id: payload._id });
        return result;
    }

    public async filter(payload: TypeFilter<ICategory>) {
        const result = await Category.aggregate([
            { $match: payload.match },
            { $project: payload.project },
            { $sort: payload.sort },
            { $skip: payload.skip || 0 },
            { $limit: payload.limit || 10 }
        ]);
        return result;
    }

    public async totalFilter(payload: TypeFilter<ICategory>) {
        const result = await Category.aggregate<{ total: number, totalPages: number }>([
            { $match: payload.match },
            { $project: { _id: 1 } },
            { $count: "total" },
            {
                $addFields: {
                    totalPages: { $ceil: { $divide: ["$total", payload.limit] } },
                }
            }
        ]);
        return result;
    }

}
