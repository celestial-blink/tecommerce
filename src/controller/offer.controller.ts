import Offer from "../model/offer.model";
import type { IOffer } from "../model/offer.model";
import type { TypeFilter } from "../commons/TypesAndInterfaces";
import type { FilterQuery } from "mongoose";

export default class OfferController {

    public async create(payload: IOffer) {
        const result = new Offer(payload);
        const { _id } = await result.save();
        return _id;
    }

    public async update(payload: { _id: FilterQuery<Pick<IOffer, "_id">>, data: Partial<IOffer> }) {
        const result = await Offer.findById(payload._id, { _id: 1 });
        if (result?.$set) {
            result.$set(payload.data);
            result.save();
        }
        return result;
    }

    public async remove(payload: { _id: FilterQuery<Pick<IOffer, "_id">> }) {
        const result = await Offer.deleteOne({ _id: payload._id });
        return result;
    }

    public async filter(payload: TypeFilter<IOffer>) {
        const result = await Offer.aggregate([
            { $match: payload.match },
            { $project: payload.project },
            { $sort: payload.sort },
            { $skip: payload.skip || 0 },
            { $limit: payload.limit || 10 }
        ]);
        return result;
    }

    public async totalFilter(payload: TypeFilter<IOffer>) {
        const result = await Offer.aggregate<{ total: number, totalPages: number }>([
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
