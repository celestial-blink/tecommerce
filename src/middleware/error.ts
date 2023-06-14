import { Request, Response, NextFunction } from 'express';
import { Error } from 'mongoose';
import response from '../core/response';

export const logError = (err: any, req: Request, res: Response, next: NextFunction) => {
    console.log(err, err.name);
    next(err)
};

export const ornError = (err: any, req: Request, res: Response, next: NextFunction) => {
    console.log("is ornError");

    if (err instanceof Error.ValidationError) {
        res.status(409);
        response(req, res, {
            state: false,
            data: {},
            message: err.message
        });
    };
    next(err);
};

export const boomError = (err: any, req: Request, res: Response, next: NextFunction) => {
    console.log("is boomError");

    if (err.isBoom) {
        const { output } = err;
        res.status(output.statusCode);
        response(req, res, {
            state: false,
            data: {},
            message: err.message
        });
    } else {
        next(err);
    }
}

export const responseError = (err: any, req: Request, res: Response, next: NextFunction) => {
    console.log("is responseError");

    res.status(500);
    response(req, res, {
        state: false,
        data: {},
        message: err.message
    });
};
