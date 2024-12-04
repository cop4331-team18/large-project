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
import { User, Project, ChatMessage } from "../util/types";
import { db } from "../util/db";
import { io } from "../server";
import { saveMessageToDatabase, sendToAllMembers } from "./chat";

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

interface Swipe {
  projectId: string,
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
    returnWithErrorJson(res, "Error finding project");
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
    const insertResult = await db.collection<Project>(PROJECT_COLLECTION_NAME).insertOne({
        name: "New Project",
        attributes: [],
        description: "New Project description",
        createdBy: user._id,
        swipeLeft: [],
        swipeRight: [],
        lastReadAt: [],
        lastMessageAt: new Date(),
      });

    //update user with new project document
    await db
      .collection<User>(USER_COLLECTION_NAME)
      .updateOne(
        { _id: user._id },
        { $addToSet: { projects: insertResult.insertedId } }
      );

    if (!insertResult.insertedId) {
      returnWithErrorJson(res, "Error occured while creating project");
      return;
    }

    const project: WithId<Project> = (await db.collection<Project>(PROJECT_COLLECTION_NAME).findOne({_id: insertResult.insertedId}))!;

    const createProjectMessage: ChatMessage = {
      message: `New Project created by @${user.username}`,
      project: project._id,
      sender: user._id,
      createdAt: new Date(),
      messageType: 'CREATE',
    };

    await sendToAllMembers(project, await saveMessageToDatabase(createProjectMessage), io);

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

    const project: WithId<Project> | null = await db.collection<Project>(PROJECT_COLLECTION_NAME).findOne({
      _id: new ObjectId(projectId),
      createdBy: user._id
    });

    if (!project) {
      returnWithErrorJson(res, "No permission to delete project");
      return;
    }

    for (const idOfSwiper of project.swipeLeft) {
      await db.collection<User>(USER_COLLECTION_NAME).updateOne({
        _id: new ObjectId(idOfSwiper)
      }, {
        $pull: {swipeLeft: project._id}
      });
    }

    for (const idOfSwiper of project.swipeRight) {
      await db.collection<User>(USER_COLLECTION_NAME).updateOne({
        _id: new ObjectId(idOfSwiper)
      }, {
        $pull: {swipeRight: project._id}
      });
    }
    
    //updates the user by removing the pID
    await db
    .collection<User>(USER_COLLECTION_NAME)
    .updateOne(
      { _id: user._id },
      { 
        $pull: {
          projects: new ObjectId(projectId),
        } 
      }
    );
    
    await db.collection<Project>(PROJECT_COLLECTION_NAME).deleteOne({
        _id: new ObjectId(projectId),
        createdBy: user._id,
      });
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
    const updateResult = await db.collection<Project>(PROJECT_COLLECTION_NAME).updateOne({ 
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

projectRouter.post("/swipeLeft", async (req: Request, res: Response) => {

  const body: Swipe = req.body;
  const user: WithId<User> | null = await getReqUser(req);

  if (!user || !body.projectId) {
    returnWithErrorJson(res, "User and project id are required");
    return;
  }

   //check if user has verified email
   if (!user.isVerified) {
    returnWithErrorJson(res, "User email is not verified");
    return;
  }

  try {
    
    //checks if user was the one that made the project
    if(user.projects.find(val => val.equals(new ObjectId(body.projectId)))){
      returnWithErrorJson(res, "the user is the one that made this project");
      return;
    }

    if(user.swipeLeft.find(val => val.equals(new ObjectId(body.projectId)))) {
      returnWithErrorJson(res, "The user has already swiped left on this project");
      return;
    }

    if(user.swipeRight.find(val => val.equals(new ObjectId(body.projectId)))) {
      returnWithErrorJson(res, "The user has already swiped right on this project");
      return;
    }

  } catch (error) {
    console.error("the value is not in one of the arrays", error);
  }
  

  //adds user id to swipeLeft on projects
  const updateProjectSwipe = await db.collection<Project>(PROJECT_COLLECTION_NAME).updateOne(
      { _id : new ObjectId(body.projectId) },
      { $addToSet : { swipeLeft: new ObjectId(user._id) } }
  );
  
  //adds projectId to swipeLeft on user
  const updateUserSwipe = await db.collection<User>(USER_COLLECTION_NAME).updateOne(
    { _id : user._id },
    { $addToSet : { swipeLeft: new ObjectId(body.projectId) } }
  );


  if (updateProjectSwipe.modifiedCount === 1 && updateUserSwipe.modifiedCount === 1) {
    res.status(200).json({ message: "Added Swipe to Project" });
    return;
  } else {
    returnWithErrorJson(res, "Project Swipe was not successfully added.");
    return;
  }
});

projectRouter.post("/swipeRight", async (req: Request, res: Response) => {

  const body: Swipe = req.body;
  const user: WithId<User> | null = await getReqUser(req);

  if (!user || !body.projectId) {
    returnWithErrorJson(res, "User and project id are required");
    return;
  }

   //check if user has verified email
   if (!user.isVerified) {
    returnWithErrorJson(res, "User email is not verified");
    return;
  }

  try {
    //checks if user was the one that made the project
    if(user.projects.find(val => val.equals(new ObjectId(body.projectId)))){
      returnWithErrorJson(res, "the user is the one that made this project");
      return;
    }


    
    if(user.swipeLeft.find(val => val.equals(new ObjectId(body.projectId)))) {
      returnWithErrorJson(res, "The user has already swiped left on this project");
      return;
    }

    if(user.swipeRight.find(val => val.equals(new ObjectId(body.projectId)))) {
      returnWithErrorJson(res, "The user has already swiped right on this project");
      return;
    }
    
  } catch (error) {
    console.error("the value is not in one of the arrays", error);
  }
  

  //adds user id to swipeRight on projects
  const updateProjectSwipe = await db.collection<Project>(PROJECT_COLLECTION_NAME).updateOne(
      { _id : new ObjectId(body.projectId) },
      { $addToSet : { swipeRight: new ObjectId(user._id) } }
  );
  
  //adds projectId to swipeRight on user
  const updateUserSwipe = await db.collection<User>(USER_COLLECTION_NAME).updateOne(
    { _id : user._id },
    { $addToSet : { swipeRight: new ObjectId(body.projectId) } }
  );


  if (updateProjectSwipe.modifiedCount === 1 && updateUserSwipe.modifiedCount === 1) {
    res.status(200).json({ message: "Added Swipe to Project" });
    return;
  } else {
    returnWithErrorJson(res, "Project Swipe was not successfully added.");
    return;
  }
});
export const getProjectIfMember = async (user: Express.User, projectId: ObjectId | null | undefined): Promise<WithId<Project> | null> => {
  try {
    if (!projectId) {
      return null;
    }
    const project: WithId<Project> | null = await db.collection<Project>(PROJECT_COLLECTION_NAME).findOne({
      _id: projectId,
    });
    // TODO: check if user is in project
    if (project && project.createdBy.equals(user._id)) {
      return project;
    }
    return null;
  } catch (error) {
    console.log(error);
    return null;
  }
}

export default projectRouter;
