//adding attributes updated

import express, { Request, Response, Router } from 'express';
import { attributes, returnWithErrorJson, USER_COLLECTION_NAME } from "../util/constants";
import { getReqUser } from './login';
import { WithId } from 'mongodb';
import { User } from '../util/types';
import { db } from '../util/db';

export const attributesRouter: Router = express.Router();

//returns attribute set
attributesRouter.get("/", async (req: Request, res: Response) => {
    res.status(200).json({attributes: [...attributes]});
});

interface AttributeBody {
    attribute: string,
};



export default attributesRouter;

