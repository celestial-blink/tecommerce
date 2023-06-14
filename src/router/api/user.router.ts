import { Router } from "express";
import type { NextFunction, Request, Response } from "express";
import { Types } from "mongoose";
import response from "../../core/response";
import config from "../../../config";
import UserController from "../../controller/user.controller";
import { refreshToken } from "../../middleware/auth";
import type { IUser } from "../../model/user.model";

const user = Router();
const userController = new UserController();

interface IFilter {
    sortby: string; sorttype: string; offset: string; rowcount: string; typeresult: string
}

user.post("/create", refreshToken,
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { _id, ...data } = req.body;
            const result = await userController.create({...data});
            response(req, res, {
                data: result,
                message: "",
                state: true
            });

        } catch (error) { next(error) }
    }
);

user.put("/update", refreshToken,
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { _id, ...data } = req.body;
            const result = await userController.update({ _id: new Types.ObjectId(_id), data });
            response(req, res, {
                data: result,
                message: "",
                state: true
            });
        } catch (error) { next(error); }
    }
);

user.get("/filter/:fields?", refreshToken,
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { sub = "" } = req.user;
            const { fields = "" } = req.params;

            const { limit, match, skip, sort, typeresult, offset } = prepareFilterParams(req.query, sub);

            const formatFields = fields.trim() ? fields.split(".") : [];
            const project = formatFields.length > 0 ? formatFields.reduce((pv, cv) => ({ ...pv, [cv]: 1 }), {}) : { _id: 1 };

            const result = typeresult === "onlycount"
                ? []
                : await userController.filter({
                    match, project, skip,
                    sort, limit
                });

            const totalResult = typeresult === "onlyresult"
                ? [{ total: 0, totalPages: 0, currentPage: 0 }]
                : await userController.totalFilter({
                    match, project, skip,
                    sort, limit
                });

            const prepareData = {
                result, total: { ...totalResult[0], currentPage: offset + 1 }
            }

            response(req, res, {
                data: prepareData,
                message: "",
                state: true
            });
        } catch (error) { next(error); }
    }
);

const prepareFilterParams = (payload = {}, sub: string) => {

    const {
        _id = "", username = "", name = "", lastname = "", role = "", createdAt = "", updatedAt = "",
        sortby = "_id", sorttype = "-1", offset = "0", rowcount = "10", typeresult = "all"
    } = payload as Record<keyof IUser, string> & IFilter;

    const match = Object.entries({
        _id: { value: _id, as: new Types.ObjectId(_id) },
        username: { value: username, as: { $regex: `${username}`, $options: "i" } },
        name: { value: name, as: { $regex: `${name}`, $options: "i" } },
        lastname: { value: lastname, as: { $regex: `${lastname}`, $options: "i" } },
        role: { value: role, as: role },
        createdAt: { value: createdAt, as: new Date(createdAt) },
        updatedAt: { value: updatedAt, as: new Date(updatedAt) }
    }).reduce((pv, cv) => {
        return cv[1].value ? { ...pv, [cv[0]]: cv[1].as } : pv;
    }, {});

    const sort = { [sortby]: parseInt(sorttype) };
    const skip = (parseInt(offset)) * (parseInt(rowcount));
    const limit = parseInt(rowcount) || config.moongose_limit;
    const prepareOffset = parseInt(offset);

    return {
        match, sort, skip, limit, typeresult, offset: prepareOffset
    }
};

user.route("/api/user");

export default user;
