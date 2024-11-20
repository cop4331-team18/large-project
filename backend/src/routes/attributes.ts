//adding attributes updated

import express, { Request, Response } from 'express';
import { attributes, returnWithErrorJson, returnWithOKJson, USER_COLLECTION_NAME } from "../util/constants";
import { PORT } from "../util/constants";
import { getReqUser } from './login';
import { Db, WithId } from 'mongodb';
import { User } from '../util/types';
import { db } from '../util/db';

const attr = express.Router();
const port = PORT;
attr.use(express.json());

interface userAttributes {
    username: string,
}

//returns attribute set
attr.get("/attributes", async (req: Request, res: Response) => {
    res.status(200).json({attributes: attributes});
});

interface AttributeBody {
    attribute: string,
};

//adding the attribute to the user
attr.post("/attributes/user/add", async (req: Request, res: Response) => {
    
    try{
        const  body: AttributeBody = req.body;
        const user: WithId<User> | null = await getReqUser(req);

        if(!user || !body.attribute) {
            returnWithErrorJson(res, "User and attribute are required");
            return;
        }

        //check if user has verified email
        if(!user.isVerified) {
            res.status(500).json({ message: "User email is not verified" });
            return;
        }

        user.attributes.add(body.attribute);

        //update the user with the attribute
        const updateResult = await db.collection<User>(USER_COLLECTION_NAME).updateOne(
            { _id: user._id },
            { $set: { attributes: user.attributes } }
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

attr.post("/attributes/user/delete", async (req: Request, res: Response) => {
    try{
        const body: AttributeBody = req.body;
        const user: WithId<User> | null = await getReqUser(req);

        if(!user || !body.attribute) {
            returnWithErrorJson(res, "User and attribute are required");
            return;
        }

        //check if user has verified email
        if(!user.isVerified) {
            res.status(500).json({ message: "User email is not verified" });
            return;
        }

        user.attributes.delete(body.attribute);

         //update the user with the attribute
         const updateResult = await db.collection<User>(USER_COLLECTION_NAME).updateOne(
            { _id: user._id },
            { $set: { attributes: user.attributes } }
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
});





