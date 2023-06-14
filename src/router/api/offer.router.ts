import { Router } from "express";
import type { NextFunction, Request, Response } from "express";
import { Types } from "mongoose";
import response from "../../core/response";
import config from "../../../config";
import OfferController from "../../controller/offer.controller";
import { refreshToken } from "../../middleware/auth";
import type { IOffer } from "../../model/offer.model";

const offer = Router();
const offerController = new OfferController();

interface IFilter {
    sortby: string; sorttype: string; offset: string; rowcount: string; typeresult: string
}

offer.post("/create", refreshToken,
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { sub } = req.user;
            const { _id, ...data } = req.body;
            const result = await offerController.create({ ...data, id_user: new Types.ObjectId(sub) });
            response(req, res, {
                data: result,
                message: "",
                state: true
            });
        } catch (error) { next(error) }
    }
);

offer.put("/update", refreshToken,
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { sub } = req.user;
            const { _id, ...data } = req.body;
            const result = await offerController.update({ _id: new Types.ObjectId(_id), data: { ...data, id_user: new Types.ObjectId(sub) } });
            response(req, res, {
                data: result,
                message: "",
                state: true
            });
        } catch (error) { next(error); }
    }
);

offer.delete("/remove", refreshToken,
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { _id } = req.body;

            const result = await offerController.remove({
                _id: new Types.ObjectId(_id)
            })
            response(req, res, {
                data: result,
                message: "",
                state: true
            });
        } catch (error) { next(error); }
    }
);

offer.get("/filter/:fields?", refreshToken,
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { sub = "" } = req.user;
            const { fields = "" } = req.params;

            const { limit, match, skip, sort, typeresult, offset } = prepareFilterParams(req.query, sub);

            const formatFields = fields.trim() ? fields.split(".") : [];
            const project = formatFields.length > 0 ? formatFields.reduce((pv, cv) => ({ ...pv, [cv]: 1 }), {}) : { _id: 1 };

            const result = typeresult === "onlycount"
                ? []
                : await offerController.filter({
                    match, project, skip,
                    sort, limit
                });

            const totalResult = typeresult === "onlyresult"
                ? [{ total: 0, totalPages: 0, currentPage: 0 }]
                : await offerController.totalFilter({
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
        _id = "", name = "", discount = "", type = "", id_user = "", createdAt = "", updatedAt = "",
        sortby = "_id", sorttype = "-1", offset = "0", rowcount = "10", typeresult = "all"
    } = payload as Record<keyof IOffer, string> & IFilter;

    const match = Object.entries({
        _id: { value: _id, as: new Types.ObjectId(_id) },
        name: { value: name, as: { $regex: `${name}`, $options: "i" } },
        discount: { value: discount, as: parseInt(discount) },
        type: { value: type, as: type },
        id_user: { value: type, as: new Types.ObjectId(id_user) },
        createdAt: { value: createdAt, as: new Date(createdAt) },
        updatedAt: { value: updatedAt, as: new Date(updatedAt) },
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

offer.route("/api/offer");

export default offer;
