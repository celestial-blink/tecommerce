import type { Request, Response, NextFunction } from "express";
import passport from "passport";
import boom from "@hapi/boom";
import jwt, { verify } from "jsonwebtoken";
import config from "../../config";
import crypto from "crypto";

import UserController from "../controller/user.controller";
import { Types } from "mongoose";

const generateKey = (): Buffer => {
    let key = Buffer.from(config.jwt_secret_refresh, "utf-8");
    key = crypto.createHash("sha256").update(key).digest();
    return key;
}

const generateIv = (): string => {
    let iv: Buffer | string = crypto.randomBytes(16);
    iv = iv.toString("hex").slice(0, 16);
    return iv;
}

const decipherGcm = (payload: string, iv: string, tag: string) => {
    const key = generateKey();
    const decipher = crypto.createDecipheriv("aes-256-gcm", key, iv);
    decipher.setAuthTag(Buffer.from(tag, "hex"));

    let decrypted = decipher.update(payload, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
}

const cipherGcm = (payload: object, key: Buffer, iv: string): { tag: string, encrypted: string } => {
    const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);
    let encrypted = cipher.update(JSON.stringify(payload), 'utf-8', 'hex');
    encrypted += cipher.final("hex");
    const tag = cipher.getAuthTag().toString("hex");
    return { encrypted, tag };
}

export const refreshToken = (req: Request, res: Response, next: NextFunction) => {
    passport.authenticate("jwt", { session: false }, (err: any, user: any, info: any) => {
        if (!user) {
            const { iv = "", refresh_token = "", tag = "" } = req.cookies;
            if (!iv || !refresh_token || !tag) return next(boom.unauthorized());

            const payloadRefreshToken = verify(refresh_token, config.jwt_secret_refresh) as { refresh: string, iat: number, exp: number };
            const decipherString = decipherGcm(payloadRefreshToken.refresh, iv, tag);
            const preparePayload = JSON.parse(decipherString);

            const newIv = generateIv();
            const key = generateKey();

            const { encrypted: newEncrypted, tag: newTag } = cipherGcm(preparePayload, key, newIv);

            const refreshToken = jwt.sign({ refresh: newEncrypted }, config.jwt_secret_refresh, { expiresIn: '2d' });
            const token = jwt.sign(preparePayload, config.jwt_secret, { expiresIn: '3m' });

            res.cookie("refresh_token", refreshToken, { maxAge: Date.now() + (2 * 24 * 60 * 60 * 1000), httpOnly: true, secure: true });
            res.cookie("iv", newIv, { maxAge: Date.now() + (2 * 24 * 60 * 60 * 1000), httpOnly: true, secure: true });
            res.cookie("tag", newTag, { maxAge: Date.now() + (2 * 24 * 60 * 60 * 1000), httpOnly: true, secure: true });

            req.token = token;
            req.user = preparePayload;
        } else {
            req.user = user;
        }
        next();
    })(req, res, next);
}

export const isAdmin = async (req: Request, res: Response, next: NextFunction) => {
    const { sub } = req.user as TypePayloadToken;
    const userController = new UserController();
    const muser = await userController.filter({
        limit: 1,
        match: { _id: new Types.ObjectId(sub) },
        project: { role: 1 },
        skip: 0,
        sort: { _id: -1 }
    });
    if (muser[0].role === "admin") next();
    next(boom.unauthorized());
}
