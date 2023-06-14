import { Router } from "express";
import type { NextFunction, Request, Response } from "express";
import { Types } from "mongoose";
import response from "../../core/response";
import config from "../../../config";
import ProductController from "../../controller/product.controller";
import { refreshToken } from "../../middleware/auth";
import type { IProduct } from "../../model/product.model";

const product = Router();
const productController = new ProductController();

interface IFilter {
    sortby: string; sorttype: string; offset: string; rowcount: string; typeresult: string
}

product.post("/create", refreshToken,
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { sub } = req.user;
            const { _id, ...data } = req.body;
            const prepareData = {
                ...data,
                id_category: new Types.ObjectId(data.id_category),
                id_user: new Types.ObjectId(sub)
            };
            const result = await productController.create(prepareData);
            response(req, res, {
                data: result,
                message: "",
                state: true
            });

        } catch (error) { next(error) }
    }
);

product.put("/update", refreshToken,
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { _id, id_user, ...data } = req.body;
            const result = await productController.update({ _id: new Types.ObjectId(_id), data });
            response(req, res, {
                data: result,
                message: "",
                state: true
            });
        } catch (error) { next(error); }
    }
);

product.delete("/remove", refreshToken,
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { _id } = req.body;
            const result = await productController.remove({
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

product.get("/filter/:fields?", refreshToken,
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { sub = "" } = req.user;
            const { fields = "" } = req.params;

            const { limit, match, skip, sort, typeresult, offset } = prepareFilterParams(req.query, sub);

            const formatFields = fields.trim() ? fields.split(".") : [];
            const project = formatFields.length > 0 ? formatFields.reduce((pv, cv) => ({ ...pv, [cv]: 1 }), {}) : { _id: 1 };

            const result = typeresult === "onlycount"
                ? []
                : await productController.filter({
                    match, project, skip,
                    sort, limit
                });

            const totalResult = typeresult === "onlyresult"
                ? [{ total: 0, totalPages: 0, currentPage: 0 }]
                : await productController.totalFilter({
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
        _id = "", name = "", description = "", price = "", quantity = "", id_category = "", id_user = "", createdAt = "", updatedAt = "",
        sortby = "_id", sorttype = "-1", offset = "0", rowcount = "10", typeresult = "all"
    } = payload as Record<keyof IProduct, string> & IFilter;

    const match = Object.entries({
        _id: { value: _id, as: new Types.ObjectId(_id) },
        name: { value: name, as: { $regex: `${name}`, $options: "i" } },
        description: { value: description, as: { $regex: `${description}`, $options: "i" } },
        price: { value: price, as: parseInt(price) },
        quantity: { value: quantity, as: parseInt(quantity) },
        id_category: { value: id_category, as: new Types.ObjectId(id_category) },
        id_user: { value: id_user, as: new Types.ObjectId(id_user) },
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

product.route("/api/product");

export default product;
