//handles the user's projects

import express, { Request, Response, Router } from 'express';
import { attributes, returnWithErrorJson, USER_COLLECTION_NAME, PROJECT_COLLECTION_NAME } from "../util/constants";
import { getReqUser } from './login';
import { WithId, ObjectId } from 'mongodb';
import { User, Project } from '../util/types';
import { db } from '../util/db';
import { MongoClient } from "mongodb";

export const projectRouter: Router = express.Router();

//will add a project to a collection and then add that projectId to the user
projectRouter.post("/project/add", async  (req: Request, res: Response) => {
    const user: WithId<User> | null = await getReqUser(req);

    if(!user) {
        returnWithErrorJson(res, "User is required");
        return;
    }

    //check if user has verified email
    if(!user.isVerified) {
        returnWithErrorJson(res, "User email is not verified");
        return;
    }

    //creates instance of an empty project
    const emptyProject = {
        name: "",
        attributes: [],
        description: ""
    };

    try {
    //adds new blank project to the project database
        const insertResult = await db.collection<Project>(PROJECT_COLLECTION_NAME).insertOne({
        name: emptyProject.name, 
        attributes: emptyProject.attributes,
        description: emptyProject.description,
        createdBy: user._id,
        });

        //update user with new project document
        await db.collection<User>(USER_COLLECTION_NAME).updateOne(
            {_id: user._id},
            { $addToSet: { projects: insertResult.insertedId}}
        );

        res.status(200).json({
            message: "Project added successfully.",
        });

    } catch (error) {
        console.error(error);
        returnWithErrorJson(res, "Error creating empty project.");
    }
});

//delete the project that you want
projectRouter.post("/project/delete/:id", async (req: Request, res: Response) => {
    const user: WithId<User> | null = await getReqUser(req);

    if(!user) {
        returnWithErrorJson(res, "User is required.");
        return;
    }

    //check if user has verified email
    if(!user.isVerified) {
        returnWithErrorJson(res, "User email is not verified.");
        return;
    }

    const projectId = req.params.id;

    try {
        //delete the project from the database
        const deleteResult = await db.collection<Project>(PROJECT_COLLECTION_NAME).deleteOne({
            _id: new Object(projectId),
            createdBy: user._id,
        });

        //updates the user by removing the pID
        await db.collection<User>(USER_COLLECTION_NAME).updateOne(
            { _id: user._id },
            { $pull: { projects: new ObjectId(projectId) } }
        )

        res.status(200).json({
            message: "Project deleted successfully.",
        });
    } catch (error) {
        console.error(error);
        returnWithErrorJson(res, "Error deleting project.")
    }
});

//create function that updates a project (add/change attributes, add/change name, add/change desc)

//either in this file or another (preferrably another), allow users to request ot join and or delete their requests to join a project

export default projectRouter;
