declare interface TypePayloadToken {
    sub: string,
    name: string;
}

declare namespace Express {
    export interface Request {
        token: string;
        user: Partial<TypePayloadToken | any>
    }
}
