import OnOffer from "../model/onoffer.model";
import type { IOnOffer } from "../model/onoffer.model";
import type { TypeFilter } from "../commons/TypesAndInterfaces";
import type { FilterQuery } from "mongoose";

export default class OnOfferController {

    public async create(payload: IOnOffer) {
        const result = new OnOffer(payload);
        const { _id } = await result.save();
        return _id;
    }

    public async update(payload: { _id: FilterQuery<Pick<IOnOffer, "_id">>, data: Partial<IOnOffer> }) {
        const result = await OnOffer.findById(payload._id, { _id: 1 });
        if (result?.$set) {
            result.$set(payload.data);
            result.save();
        }
        return result;
    }

    public async remove(payload: { _id: FilterQuery<Pick<IOnOffer, "_id">> }) {
        const result = await OnOffer.deleteOne({ _id: payload._id });
        return result;
    }

    public async filter(payload: TypeFilter<IOnOffer>) {
        const result = await OnOffer.aggregate([
            { $match: payload.match },
            { $project: payload.project },
            { $sort: payload.sort },
            { $skip: payload.skip || 0 },
            { $limit: payload.limit || 10 }
        ]);
        return result;
    }

    public async totalFilter(payload: TypeFilter<IOnOffer>) {
        const result = await OnOffer.aggregate<{ total: number, totalPages: number }>([
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
