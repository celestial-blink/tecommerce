import { Router } from "express";
import type { NextFunction, Request, Response } from "express";
import { Types } from "mongoose";
import response from "../../core/response";
import config from "../../../config";
import ImageController from "../../controller/image.controller";
import { refreshToken } from "../../middleware/auth";
import type { IImage } from "../../model/image.model";

const image = Router();
const imageController = new ImageController();

interface IFilter {
    sortby: string; sorttype: string; offset: string; rowcount: string; typeresult: string
}

image.post("/create", refreshToken,
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { _id, id_product, ...data } = req.body;
            const result = await imageController.create({ ...data, id_product: new Types.ObjectId(id_product) });
            response(req, res, {
                data: result,
                message: "",
                state: true
            });
        } catch (error) { next(error) }
    }
);

image.put("/update", refreshToken,
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { sub } = req.user;
            const { _id, id_product, ...data } = req.body;
            const result = await imageController.update({ _id: new Types.ObjectId(_id), data: { ...data, id_product: new Types.ObjectId(id_product) } });
            response(req, res, {
                data: result,
                message: "",
                state: true
            });
        } catch (error) { next(error); }
    }
);

image.delete("/remove", refreshToken,
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { _id } = req.body;

            const result = await imageController.remove({
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

image.get("/filter/:fields?", refreshToken,
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { sub = "" } = req.user;
            const { fields = "" } = req.params;

            const { limit, match, skip, sort, typeresult, offset } = prepareFilterParams(req.query, sub);

            const formatFields = fields.trim() ? fields.split(".") : [];
            const project = formatFields.length > 0 ? formatFields.reduce((pv, cv) => ({ ...pv, [cv]: 1 }), {}) : { _id: 1 };

            const result = typeresult === "onlycount"
                ? []
                : await imageController.filter({
                    match, project, skip,
                    sort, limit
                });

            const totalResult = typeresult === "onlyresult"
                ? [{ total: 0, totalPages: 0, currentPage: 0 }]
                : await imageController.totalFilter({
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
        _id = "", id_product = "", url = "", position = "",
        sortby = "_id", sorttype = "-1", offset = "0", rowcount = "10", typeresult = "all"
    } = payload as Record<keyof IImage, string> & IFilter;

    const match = Object.entries({
        _id: { value: _id, as: new Types.ObjectId(_id) },
        id_product: { value: id_product, as: new Types.ObjectId(id_product) },
        url: { value: url, as: { $regex: `${url}`, $options: "i" } },
        position: { value: position, as: parseInt(position) },
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

image.route("/api/image");

export default image;
