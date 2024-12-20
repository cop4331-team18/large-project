//handles the user's projects

import express, { Request, Response, Router } from "express";
import {
  attributes,
  returnWithErrorJson,
  USER_COLLECTION_NAME,
  PROJECT_COLLECTION_NAME,
  returnWithOKJson,
} from "../util/constants";
import { getReqUser } from "./login";
import { WithId, ObjectId, Filter } from "mongodb";
import { User, Project, ChatMessage, ProjectLastReadAt } from "../util/types";
import { db } from "../util/db";
import { io } from "../server";
import { saveMessageToDatabase, sendToAllMembers } from "./chat";

export const projectRouter: Router = express.Router();

interface GetMatchOptionsParams {
  attributes: string[];
  pageSize: string;
}

interface GetMatchOptionsResponse {
  hasNext: boolean;
  projects: WithId<Project>[];
}

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

interface Accept {
  projectId: string,
  collaborator: string,
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
      .find(
        {
          $or: [
            {createdBy: new ObjectId(user._id)},
            {acceptedUsers: {$in: [user._id]}},
          ],
      })
      .toArray();

    res.status(200).json({
      projects: results,
    });
  } catch (error) {
    console.error(error);
    returnWithErrorJson(res, "Error finding project");
  }
});

projectRouter.get("/get-match-options", async (req: Request, res: Response) => {
  try {
    const user: WithId<User> | null = await getReqUser(req);
    if (!user) {
      returnWithErrorJson(res, "User is required");
      return;
    }
    const params: GetMatchOptionsParams = req.query as unknown as GetMatchOptionsParams;
    const pageSize = parseInt(params.pageSize);
    if (Number.isNaN(pageSize) || pageSize < 0) {
      returnWithErrorJson(res, "Invalid pageSize");
      return;
    }
    if (params.attributes) {
      for (const attribute of params.attributes) {
        if (!attributes.has(attribute)) {
          returnWithErrorJson(res, "At least one invalid attribute");
          return;
        }
      }
    }
    const filter: Filter<Project> = {
      $and: [
        {swipeLeft: {$nin: [user._id]}},
        {swipeRight: {$nin: [user._id]}},
        {createdBy: {$ne: user._id}},
      ],
    };
    if (params.attributes && params.attributes.length > 0) {
      filter.attributes = {$all: params.attributes}
    };
    const page: WithId<Project>[] = await db.collection<Project>(PROJECT_COLLECTION_NAME).aggregate<WithId<Project>>([{$match: filter}, {$sample: {size: pageSize+1}}]).toArray();
    let hasNext = false;
    if (page.length === pageSize+1) {
      hasNext = true;
      page.pop();
    }
    const resJson: GetMatchOptionsResponse = {
      hasNext: hasNext,
      projects: page,
    };
    res.status(200).send(resJson);
  } catch (error) {
    console.log(error);
    returnWithErrorJson(res, "Error occurred");
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
    // 01/01/1970 UTC, the beginning of time...
    const lastReadAt: ProjectLastReadAt = {
      userId: user._id,
      date: new Date(0),
  };
    //adds new blank project to the project database
    const insertResult = await db.collection<Project>(PROJECT_COLLECTION_NAME).insertOne({
        name: "New Project",
        attributes: [],
        description: "New Project description",
        createdBy: user._id,
        swipeLeft: [],
        swipeRight: [],
        acceptedUsers: [],
        rejectedUsers: [],
        lastReadAt: [lastReadAt],
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

    //pull all Ids from acceptedUsers
    for (const idOfAcceptedUser of project.acceptedUsers) {
      await db.collection<User>(USER_COLLECTION_NAME).updateOne(
        { _id: new ObjectId(idOfAcceptedUser) },
        { $pull: {joinedProjects: project._id} }
      )
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
    
    // This is just for anyone who had this project loaded up already, this will delete the project for them automatically.
    const deleteProjectMessage: ChatMessage = {
      message: `Project was deleted by @${user.username}`,
      project: new ObjectId(projectId),
      sender: user._id,
      createdAt: new Date(),
      messageType: 'DELETE',
    };
    await sendToAllMembers(new ObjectId(projectId), await saveMessageToDatabase(deleteProjectMessage), io);
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
    if (!user.projects.find(val => val.equals(new ObjectId(body.id)))) {
      returnWithErrorJson(res, "Only project creator can update project");
      return;
    }
    const updateResult = await db
      .collection<Project>(PROJECT_COLLECTION_NAME)
      .updateOne({ 
          _id: new ObjectId(body.id),
          createdBy: user._id,
        },
        { $set: { name: body.name, description: body.description } }
      );

    if (updateResult.modifiedCount === 1) {
      const updateProjectMessage: ChatMessage = {
        message: `Project was updated by @${user.username}`,
        project: new ObjectId(body.id),
        sender: user._id,
        createdAt: new Date(),
        messageType: 'UPDATE',
      };
      await sendToAllMembers(new ObjectId(body.id), await saveMessageToDatabase(updateProjectMessage), io);
    }

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
      const updateProjectMessage: ChatMessage = {
        message: `@${user.username} added the attribute '${body.attribute}' to the project`,
        project: new ObjectId(body.id),
        sender: user._id,
        createdAt: new Date(),
        messageType: 'UPDATE',
      };
      await sendToAllMembers(new ObjectId(body.id), await saveMessageToDatabase(updateProjectMessage), io);
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
      const updateProjectMessage: ChatMessage = {
        message: `@${user.username} deleted the attribute '${body.attribute}' to the project`,
        project: new ObjectId(body.id),
        sender: user._id,
        createdAt: new Date(),
        messageType: 'UPDATE',
      };
      await sendToAllMembers(new ObjectId(body.id), await saveMessageToDatabase(updateProjectMessage), io);
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

    //adds user id to swipeLeft on projects
    const updateProjectSwipe = await db.collection<Project>(PROJECT_COLLECTION_NAME).updateOne(
        { _id : new ObjectId(body.projectId) },
        { $addToSet : { swipeLeft: user._id } }
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
  } catch (error) {
    console.error("the value is not in one of the arrays", error);
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

    //check if user already swiped left
    if(user.swipeLeft.find(val => val.equals(new ObjectId(body.projectId)))) {
      returnWithErrorJson(res, "The user has already swiped left on this project");
      return;
    }

    //check if user already swiped right
    if(user.swipeRight.find(val => val.equals(new ObjectId(body.projectId)))) {
      returnWithErrorJson(res, "The user has already swiped right on this project");
      return;
    }
    
    //adds user id to swipeRight on projects
    const updateProjectSwipe = await db.collection<Project>(PROJECT_COLLECTION_NAME).updateOne(
      { _id : new ObjectId(body.projectId) },
      { $addToSet : { swipeRight: user._id } }
    );
    
    //adds projectId to swipeRight on user
    const updateUserSwipe = await db.collection<User>(USER_COLLECTION_NAME).updateOne(
      { _id : user._id },
      { $addToSet : { swipeRight: new ObjectId(body.projectId) } }
    );
  
  
    if (updateProjectSwipe.modifiedCount === 1 && updateUserSwipe.modifiedCount === 1) {
      const swipeRightUserMessage: ChatMessage = {
        message: `@${user.username} swiped right on the project`,
        project: new ObjectId(body.projectId),
        sender: user._id,
        createdAt: new Date(),
        messageType: 'SWIPE_RIGHT',
      };
  
      await sendToAllMembers(new ObjectId(body.projectId), await saveMessageToDatabase(swipeRightUserMessage), io);
      res.status(200).json({ message: "Added Swipe to Project" });
      return;
    } else {
      returnWithErrorJson(res, "Project Swipe was not successfully added.");
      return;
    }
  } catch (error) {
    console.error("the value is not in one of the arrays", error);
  }
  

});

//Allows user to accept others onto their project
projectRouter.post("/acceptUser", async (req: Request, res: Response) => {
  const body: Accept = req.body;
  const user: WithId<User> | null = await getReqUser(req);

  if (!user || !body.projectId || !body.collaborator) {
    returnWithErrorJson(res, "User and project id are required");
    return;
  }

   //check if user has verified email
   if (!user.isVerified) {
    returnWithErrorJson(res, "User email is not verified");
    return;
  }

  if (!user.projects.find(val => val.equals(new ObjectId(body.projectId)))) {
    returnWithErrorJson(res, "Only project creator can accept user");
    return;
  }

  try {

    //add check to see if they had swiped already
    const collaboratorUser = await db.collection<User>(USER_COLLECTION_NAME).findOne({
      _id : new ObjectId(body.collaborator),
    });

    if (!collaboratorUser) {
      returnWithErrorJson(res, 'User does not exist');
      return;
    }

    if(collaboratorUser.swipeLeft.find(val => val.equals(new ObjectId(body.projectId)))) {
      returnWithErrorJson(res, "The collaborator swiped left on this project, not right");
      return;
    }

    if(!collaboratorUser.swipeRight.find(val => val.equals(new ObjectId(body.projectId)))) {
      returnWithErrorJson(res, "The collaborator did not swipe right");
      return;
    }

    //add check to see if they are already a collaborator on the project or if they have been rejected
    const checkAcceptance = await db.collection<Project>(PROJECT_COLLECTION_NAME).findOne({
       _id : new ObjectId(body.projectId),

       $or : [
        { acceptedUsers : new ObjectId(body.collaborator) },
        { rejectedUsers : new ObjectId(body.collaborator) }
       ],
    });

    if(checkAcceptance) {
      returnWithErrorJson(res, "Collaborator has been accepted or rejected already");
      return;
    } 

    // 01/01/1970 UTC, the beginning of time...
    const collaboratorLastReadAt: ProjectLastReadAt = {
      userId: new ObjectId(body.collaborator),
      date: new Date(0),
    };
    

    //adds collaborator to the project
    const acceptUser = await db.collection<Project>(PROJECT_COLLECTION_NAME).updateOne(
      { _id : new ObjectId(body.projectId) },
      { $addToSet : { acceptedUsers: new ObjectId(body.collaborator), lastReadAt: collaboratorLastReadAt } }
    );

    //once accepted, this wil update the Collaborators profile to show that it joined
    const joinedProject = await db.collection<User>(USER_COLLECTION_NAME).updateOne(
      { _id : new ObjectId(body.collaborator) },
      { $addToSet : { joinedProjects: new ObjectId(body.projectId) } }
    );

    if (acceptUser.modifiedCount === 1 && joinedProject.modifiedCount === 1) {
      const acceptUserMessage: ChatMessage = {
        message: `@${user.username} added @${collaboratorUser.username} to the project`,
        project: new ObjectId(body.projectId),
        sender: user._id,
        createdAt: new Date(),
        messageType: 'ACCEPT_USER',
      };
  
      await sendToAllMembers(new ObjectId(body.projectId), await saveMessageToDatabase(acceptUserMessage), io);
      res.status(200).json({ message: "Successfully added collaborator to project" });
      return;
    } else {
      returnWithErrorJson(res, "Collaborator was not successfully added");
      return;
    }


  } catch (error) {
    console.error(error);

  }

  
});

//rejecting a user request from a project
projectRouter.post("/rejectUser", async (req: Request, res: Response) => {
  const body: Accept = req.body;
  const user: WithId<User> | null = await getReqUser(req);

  if (!user || !body.projectId || !body.collaborator) {
    returnWithErrorJson(res, "User and project id are required");
    return;
  }

   //check if user has verified email
   if (!user.isVerified) {
    returnWithErrorJson(res, "User email is not verified");
    return;
  }

  if (!user.projects.find(val => val.equals(new ObjectId(body.projectId)))) {
    returnWithErrorJson(res, "Only project creator can reject user");
    return;
  }

  try {

    //add check to see if they had swiped already
    const collaboratorUser = await db.collection<User>(USER_COLLECTION_NAME).findOne({
      _id : new ObjectId(body.collaborator),
    });

    if (!collaboratorUser) {
      returnWithErrorJson(res, 'User does not exist');
      return;
    }

    if(collaboratorUser.swipeLeft.find(val => val.equals(new ObjectId(body.projectId)))) {
      returnWithErrorJson(res, "The collaborator swiped left on this project, not right");
      return;
    }

    if(!collaboratorUser.swipeRight.find(val => val.equals(new ObjectId(body.projectId)))) {
      returnWithErrorJson(res, "The collaborator did not swipe right");
      return;
    }

    //add check to see if they are already a collaborator on the project or if they have been rejected
    const checkAcceptance = await db.collection<Project>(PROJECT_COLLECTION_NAME).findOne({
       _id : new ObjectId(body.projectId),

       $or : [
        { acceptedUsers : new ObjectId(body.collaborator) },
        { rejectedUsers : new ObjectId(body.collaborator) }
       ],
    });

    if(checkAcceptance) {
      returnWithErrorJson(res, "Collaborator has been accepted or rejected already");
      return;
    } 
    

    //rejects collaborator from project
    const acceptUser = await db.collection<Project>(PROJECT_COLLECTION_NAME).updateOne(
      { _id : new ObjectId(body.projectId) },
      { $addToSet : { rejectedUsers: new ObjectId(body.collaborator) } }
    );

    if (acceptUser.modifiedCount === 1) {
      res.status(200).json({ message: "Successfully rejected collaborator from project" });
      return;
    } else {
      returnWithErrorJson(res, "Collaborator was not successfully rejected");
      return;
    }


  } catch (error) {
    console.error(error);
  }
});

projectRouter.post("/undo-all-left-swipes", async (req: Request, res: Response) => {
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

    for (const projectId of user.swipeLeft) {
      await db.collection<Project>(PROJECT_COLLECTION_NAME).updateOne({_id: projectId}, {$pull: {swipeLeft: user._id}});
      await db.collection<User>(USER_COLLECTION_NAME).updateOne({_id: user._id}, {$pull: {swipeLeft: projectId}});
    }
    returnWithOKJson(res);

  } catch (error) {
    console.error(error);
    returnWithErrorJson(res, "Server error");
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
    if (project && (project.createdBy.equals(user._id) || project.acceptedUsers.find(val => val.equals(user._id)))) {
      return project;
    }
    return null;
  } catch (error) {
    console.log(error);
    return null;
  }
}

export default projectRouter;