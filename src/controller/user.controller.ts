import User from "../model/user.model";
import type { IUser } from "../model/user.model";
import type { TypeFilter } from "../commons/TypesAndInterfaces";
import type { FilterQuery } from "mongoose";

export default class UserController {

    public async create(payload: IUser) {
        const result = new User(payload);
        const { _id } = await result.save();
        return _id;
    }

    public async getByUsername(payload: { username: string }) {
        const result = await User.findOne<Pick<IUser, "_id" | "name" | "password">>({ username: payload.username }, { _id: 1, name: 1, password: 1 }).exec();
        return result;
    }

    public async register(payload: Omit<IUser, "_id" | "createdAt" | "updatedAt">) {
        const user = new User(payload);
        const { _id } = await user.save();
        return { _id: _id.toString() };
    }

    public async login(payload: { username: string }) {
        const result = await User.findOne<Pick<IUser, "_id" | "name" | "password">>({ username: payload.username }, { _id: 1, name: 1, password: 1 }).exec();
        return result;
    }

    public async update(payload: { _id: FilterQuery<Pick<IUser, "_id">>, data: Partial<IUser> }) {
        const result = await User.findById(payload._id, { _id: 1 });
        if (result?.$set) {
            result.$set(payload.data);
            result.save();
        }
        return result;
    }

    public async filter(payload: TypeFilter<IUser>) {
        const result = await User.aggregate([
            { $match: payload.match },
            { $project: payload.project },
            { $sort: payload.sort },
            { $skip: payload.skip || 0 },
            { $limit: payload.limit || 10 }
        ]);
        return result;
    }

    public async totalFilter(payload: TypeFilter<IUser>) {
        const result = await User.aggregate<{ total: number, totalPages: number }>([
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

    public async validatePassword(payload: FilterQuery<Pick<IUser, "_id">>) {
        const result = await User.findOne<Pick<IUser, "_id" | "password">>({ _id: payload._id }, { _id: 1, password: 1 }).exec();
        return result;
    }

}
