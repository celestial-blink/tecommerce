import Product from "../model/product.model";
import type { IProduct } from "../model/product.model";
import type { TypeFilter } from "../commons/TypesAndInterfaces";
import type { FilterQuery } from "mongoose";

export default class ProductController {

    public async create(payload: IProduct) {
        const result = new Product(payload);
        const { _id } = await result.save();
        return _id;
    }

    public async update(payload: { _id: FilterQuery<Pick<IProduct, "_id">>, data: Partial<IProduct> }) {
        const result = await Product.findById(payload._id, { _id: 1 });
        if (result?.$set) {
            result.$set(payload.data);
            result.save();
        }
        return result;
    }

    public async remove(payload: { _id: FilterQuery<Pick<IProduct, "_id">> }) {
        const result = await Product.deleteOne({ _id: payload._id });
        return result;
    }

    public async filter(payload: TypeFilter<IProduct>) {
        const result = await Product.aggregate([
            { $match: payload.match },
            { $project: payload.project },
            { $sort: payload.sort },
            { $skip: payload.skip || 0 },
            { $limit: payload.limit || 10 }
        ]);
        return result;
    }

    public async totalFilter(payload: TypeFilter<IProduct>) {
        const result = await Product.aggregate<{ total: number, totalPages: number }>([
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
