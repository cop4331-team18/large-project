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

//adding the attribute to the user
attributesRouter.post("/user/add", async (req: Request, res: Response) => {
    
    try{
        const  body: AttributeBody = req.body;
        const user: WithId<User> | null = await getReqUser(req);

        if(!user || !body.attribute) {
            returnWithErrorJson(res, "User and attribute are required");
            return;
        }

        //check if user has verified email
        if(!user.isVerified) {
            returnWithErrorJson(res, "User email is not verified");
            return;
        } else if (!attributes.has(body.attribute)) {
            returnWithErrorJson(res, "Attribute does not match any available attributes.");
            return;
        }

        //update the user with the attribute
        const updateResult = await db.collection<User>(USER_COLLECTION_NAME).updateOne(
            { _id: user._id },
            { $addToSet: {attributes: body.attribute}}, 
        );

        //return status on added attribute
        if (updateResult.modifiedCount === 1) {
            res.status(200).json({ message: "Attribute added succesfully." });
            return;
        } else {
            returnWithErrorJson(res, "Attribute was not added successfully.");
            return;
        }


    } catch (error) {
        console.error("Error adding attribute:", error);
        returnWithErrorJson(res, "Attribute was not successfully added.");
    }
});

attributesRouter.post("/user/delete", async (req: Request, res: Response) => {
    try{
        const body: AttributeBody = req.body;
        const user: WithId<User> | null = await getReqUser(req);

        if(!user || !body.attribute) {
            returnWithErrorJson(res, "User and attribute are required");
            return;
        }

        //check if user has verified email
        if(!user.isVerified) {
             returnWithErrorJson(res, "User email is not verified" );
            return;
        } else if (!attributes.has(body.attribute)) {
            returnWithErrorJson(res, "Attribute does not match any available attributes.");
            return;
        }

         //update the user with the attribute
         const updateResult = await db.collection<User>(USER_COLLECTION_NAME).updateOne(
            { _id: user._id },
            { $pull: { attributes: body.attribute } }
        );

         //return status on added attribute
         if (updateResult.modifiedCount === 1) {
            res.status(200).json({ message: "Attribute deleted succesfully." });
            return;
        } else {
            returnWithErrorJson(res, "Attribute was not deleted successfully.");
            return;
        }


    } catch (error) {
        console.error("Error deleting attribute:", error);
        returnWithErrorJson(res, "Attribute was not successfully deleted.");
    }
});

export default attributesRouter;

