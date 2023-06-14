import mongoose from "mongoose";
import { env } from 'process';

mongoose.set("strictQuery", false);

export const connect = async () => {
    const url: string = env?.DB_URL ?? "";
    const connection = await mongoose.connect(url);
    return connection;
};
