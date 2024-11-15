import dotenv from 'dotenv';
import { Response } from 'express';
dotenv.config();

export const PORT: string = process.env.PORT || "5000";
export const MONGO_CONNECTION_STRING: string = process.env.MONGO_CONNECTION_STRING!;
export const MONGO_DB_NAME: string = process.env.MONGO_DB_NAME!;
export const USER_COLLECTION_NAME: string = "Users";
export const SESSION_SECRET: string = process.env.SESSION_SECRET!;

export function returnWithErrorJson(res: Response, error: string) {
    return res.status(406).json({error: error});
}

export function returnWithOKJson(res: Response) {
    return res.status(200).json({status: "OK"});
}
