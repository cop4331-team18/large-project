//handles the user's projects

import express, { Request, Response, Router } from "express";
import {
  attributes,
  returnWithErrorJson,
  USER_COLLECTION_NAME,
  PROJECT_COLLECTION_NAME,
} from "../util/constants";
import { getReqUser } from "./login";
import { WithId, ObjectId } from "mongodb";
import { User, Project } from "../util/types";
import { db } from "../util/db";

export const projectRouter: Router = express.Router();
interface UpdateProject {
  id: string;
  name: string;
  description: string;
}

interface ProjectAttribute {
  id: string;
  attribute: string;
}

projectRouter.get("/get", async (req: Request, res: Response) => {
  const user: WithId<User> | null = await getReqUser(req);

  if (!user) {
    returnWithErrorJson(res, "User is required");
    return;
  }

  //check if user has verified email
  if (!user.isVerified) {
    returnWithErrorJson(res, "User email is not verified");
    return;
  }

  try {
    const results: WithId<Project>[] | null = await db
      .collection<Project>(PROJECT_COLLECTION_NAME)
      .find({ createdBy: new ObjectId(user._id) })
      .toArray();

    res.status(200).json({
      projects: results,
    });
  } catch (error) {
    console.error(error);
    returnWithErrorJson(res, "Error creating empty project.");
  }
});

//will add a project to a collection and then add that projectId to the user
projectRouter.post("/add", async (req: Request, res: Response) => {
  const user: WithId<User> | null = await getReqUser(req);

  if (!user) {
    returnWithErrorJson(res, "User is required");
    return;
  }

  //check if user has verified email
  if (!user.isVerified) {
    returnWithErrorJson(res, "User email is not verified");
    return;
  }

  try {
    //adds new blank project to the project database
    const insertResult = await db
      .collection<Project>(PROJECT_COLLECTION_NAME)
      .insertOne({
        name: "New Project",
        attributes: [],
        description: "New Project description",
        createdBy: user._id,
      });

    //update user with new project document
    await db
      .collection<User>(USER_COLLECTION_NAME)
      .updateOne(
        { _id: user._id },
        { $addToSet: { projects: insertResult.insertedId } }
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
projectRouter.post("/delete/:id", async (req: Request, res: Response) => {
  const user: WithId<User> | null = await getReqUser(req);

  if (!user) {
    returnWithErrorJson(res, "User is required.");
    return;
  }

  //check if user has verified email
  if (!user.isVerified) {
    returnWithErrorJson(res, "User email is not verified.");
    return;
  }

  const projectId = req.params.id;

  try {
    //delete the project from the database
    await db.collection<Project>(PROJECT_COLLECTION_NAME).deleteOne({
        _id: new ObjectId(projectId),
        createdBy: user._id,
      });

    //updates the user by removing the pID
    await db
      .collection<User>(USER_COLLECTION_NAME)
      .updateOne(
        { _id: user._id },
        { $pull: { projects: new ObjectId(projectId) } }
      );

    res.status(200).json({
      message: "Project deleted successfully.",
    });
  } catch (error) {
    console.error(error);
    returnWithErrorJson(res, "Error deleting project.");
  }
});

//create function that updates a project (add/change attributes, add/change name, add/change desc)
projectRouter.post("/update", async (req: Request, res: Response) => {
  const user: WithId<User> | null = await getReqUser(req);
  const body: UpdateProject = req.body;

  if (!user || !body.id || !body.description || !body.name) {
    returnWithErrorJson(res, "User and update fields are required.");
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
      .collection<Project>(PROJECT_COLLECTION_NAME)
      .updateOne({ 
          _id: new ObjectId(body.id),
          createdBy: user._id,
        },
        { $set: { name: body.name, description: body.description } }
      );

    res.status(200).json({
      message: "Project updated successfully.",
    });
  } catch (error) {
    console.error(error);
    returnWithErrorJson(res, "Error updating project.");
  }
});

projectRouter.post("/attribute/add", async (req: Request, res: Response) => {
  try {
    const body: ProjectAttribute = req.body;
    const user: WithId<User> | null = await getReqUser(req);

    if (!user || !body.attribute || !body.id) {
      returnWithErrorJson(res, "User, attribute, and project id are required");
      return;
    }

    //check if user has verified email
    if (!user.isVerified) {
      returnWithErrorJson(res, "User email is not verified");
      return;
    } else if (!attributes.has(body.attribute)) {
      returnWithErrorJson(
        res,
        "Attribute does not match any available attributes."
      );
      return;
    }

    //update the user with the attribute
    const updateResult = await db
      .collection<Project>(PROJECT_COLLECTION_NAME)
      .updateOne({ 
          _id: new ObjectId(body.id),
          createdBy: user._id,
        },
        { $addToSet: { attributes: body.attribute } }
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

projectRouter.post("/attribute/delete", async (req: Request, res: Response) => {
    try {
      const body: ProjectAttribute = req.body;
      const user: WithId<User> | null = await getReqUser(req);
  
      if (!user || !body.attribute || !body.id) {
        returnWithErrorJson(res, "User, attribute, and project id are required");
        return;
      }
  
      //check if user has verified email
      if (!user.isVerified) {
        returnWithErrorJson(res, "User email is not verified");
        return;
      } else if (!attributes.has(body.attribute)) {
        returnWithErrorJson(res,"Attribute does not match any available attributes.");
        return;
      }
  
      //update the user with the attribute
      const updateResult = await db
        .collection<Project>(PROJECT_COLLECTION_NAME)
        .updateOne({ 
            _id: new ObjectId(body.id),
            createdBy: user._id,
          },
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

export default projectRouter;
