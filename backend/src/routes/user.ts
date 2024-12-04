import express, { Request, Response, Router } from 'express';
import { attributes, returnWithErrorJson, USER_COLLECTION_NAME } from "../util/constants";
import { getReqUser } from './login';
import { WithId } from 'mongodb';
import { User } from '../util/types';
import { db } from '../util/db';

export const userRouter: Router = express.Router();

interface AttributeBody {
    attribute: string,
};

interface UpdateUserBody {
    firstName : string;
    lastName : string;
    bio: string;
}

//adding the attribute to the user
userRouter.post("/attribute/add", async (req: Request, res: Response) => {
    
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

userRouter.post("/attribute/delete", async (req: Request, res: Response) => {
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


userRouter.post("/update", async (req: Request, res: Response) => {
    const user: WithId<User> | null = await getReqUser(req);
    const body: UpdateUserBody = req.body;
  
    if (!user) {
      returnWithErrorJson(res, "User is required.");
      return;
    }
  
    //check if user has verified email
    if (!user.isVerified) {
      returnWithErrorJson(res, "User email is not verified.");
      return;
    }
  
    try {
      //body: name, description
      await db
        .collection<User>(USER_COLLECTION_NAME)
        .updateOne({ 
            _id: user._id,
          },
          { $set: { firstName: body.firstName, lastName: body.lastName, bio: body.bio } }
        );
  
      res.status(200).json({
        message: "User updated successfully.",
      });
    } catch (error) {
      console.error(error);
      returnWithErrorJson(res, "Error updating User.");
    }
  });

export default userRouter;