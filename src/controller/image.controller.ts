import Image from "../model/image.model";
import type { IImage } from "../model/image.model";
import type { TypeFilter } from "../commons/TypesAndInterfaces";
import type { FilterQuery } from "mongoose";


export default class ImageController {

    public async create(payload: IImage) {
        const result = new Image(payload);
        const { _id } = await result.save();
        return _id;
    }

    public async update(payload: { _id: FilterQuery<Pick<IImage, "_id">>, data: Partial<IImage> }) {
        const result = await Image.findById(payload._id, { _id: 1 });
        if (result?.$set) {
            result.$set(payload.data);
            result.save();
        }
        return result;
    }

    public async remove(payload: { _id: FilterQuery<Pick<IImage, "_id">> }) {
        const result = await Image.deleteOne({ _id: payload._id });
        return result;
    }

    public async filter(payload: TypeFilter<IImage>) {
        const result = await Image.aggregate([
            { $match: payload.match },
            { $project: payload.project },
            { $sort: payload.sort },
            { $skip: payload.skip || 0 },
            { $limit: payload.limit || 10 }
        ]);
        return result;
    }

    public async totalFilter(payload: TypeFilter<IImage>) {
        const result = await Image.aggregate<{ total: number, totalPages: number }>([
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
