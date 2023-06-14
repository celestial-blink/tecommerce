import { Router } from "express";
import type { NextFunction, Request, Response } from "express";
import { Types } from "mongoose";
import response from "../../core/response";
import config from "../../../config";
import OnOfferController from "../../controller/onoffer.controller";
import { refreshToken } from "../../middleware/auth";
import type { IOnOffer } from "../../model/onoffer.model";

const onoffer = Router();
const onOfferController = new OnOfferController();

interface IFilter {
    sortby: string; sorttype: string; offset: string; rowcount: string; typeresult: string
}

onoffer.post("/create", refreshToken,
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { _id, ...data } = req.body;
            const prepareData = {
                ...data,
                id_product: new Types.ObjectId(data.id_product),
                id_offer: new Types.ObjectId(data.id_offer),
            };
            const result = await onOfferController.create(prepareData);
            response(req, res, {
                data: result,
                message: "",
                state: true
            });

        } catch (error) { next(error) }
    }
);

onoffer.put("/update", refreshToken,
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { _id, ...data } = req.body;
            const result = await onOfferController.update({ _id: new Types.ObjectId(_id), data });
            response(req, res, {
                data: result,
                message: "",
                state: true
            });
        } catch (error) { next(error); }
    }
);

onoffer.delete("/remove", refreshToken,
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { _id } = req.body;

            const result = await onOfferController.remove({
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

onoffer.get("/filter/:fields?", refreshToken,
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { sub = "" } = req.user;
            const { fields = "" } = req.params;

            const { limit, match, skip, sort, typeresult, offset } = prepareFilterParams(req.query, sub);

            const formatFields = fields.trim() ? fields.split(".") : [];
            const project = formatFields.length > 0 ? formatFields.reduce((pv, cv) => ({ ...pv, [cv]: 1 }), {}) : { _id: 1 };

            const result = typeresult === "onlycount"
                ? []
                : await onOfferController.filter({
                    match, project, skip,
                    sort, limit
                });

            const totalResult = typeresult === "onlyresult"
                ? [{ total: 0, totalPages: 0, currentPage: 0 }]
                : await onOfferController.totalFilter({
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
        _id = "", id_product = "", id_offer = "", expired = "", expired_in = "", createdAt = "", updatedAt = "",
        sortby = "_id", sorttype = "-1", offset = "0", rowcount = "10", typeresult = "all"
    } = payload as Record<keyof IOnOffer, string> & IFilter;

    const match = Object.entries({
        _id: { value: _id, as: new Types.ObjectId(_id) },
        id_product: { value: id_product, as: new Types.ObjectId(id_product) },
        id_offer: { value: id_offer, as: new Types.ObjectId(id_offer) },
        expired: { value: expired, as: expired },
        expired_in: { value: expired_in, as: new Date(expired_in) },
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

onoffer.route("/api/onoffer");

export default onoffer;
