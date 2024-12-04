import { Server } from "socket.io";
import { ChatMessage, ChatMessageInput, Project, ProjectLastReadAt, SocketWithUser } from "../util/types";
import { ObjectId, WithId } from "mongodb";
import { db } from "../util/db";
import { CHAT_COLLECTION_NAME, PROJECT_COLLECTION_NAME, returnWithErrorJson } from "../util/constants";
import express, { Router, Request, Response } from "express";
import { getProjectIfMember } from "./projects";

// Ideally, you'd encrypt messages. For the sake of simplicity, I'll ignore that.
export const chatSocketEvents = (io: Server) => {
    io.on("connection", (socket: SocketWithUser) => {
        const user: Express.User | undefined | null = socket.request.user;
        if (!user) {
            return;
        }

        socket.on("chat", async (data: ChatMessageInput) => {
            try {
                const message: ChatMessage = {
                    message: data.message,
                    project: new ObjectId(data.project),
                    sender: new ObjectId(user._id),
                    createdAt: new Date(),
                    messageType: 'CHAT',
                };
                const project: WithId<Project> | null = await getProjectIfMember(user, message.project);
                if (!project) {
                    return;
                }
                const result = await db.collection<ChatMessage>(CHAT_COLLECTION_NAME).insertOne(message);
                const socketMessage: WithId<ChatMessage> = (await db.collection<ChatMessage>(CHAT_COLLECTION_NAME).findOne({"_id": result.insertedId}))!;
                await sendToAllMembers(project, socketMessage, io);
            } catch (error) {
                console.log(error);
            }
        });

        socket.on("read", async (data: ChatMessageInput) => {
            try {
                const message: ChatMessage = {
                    message: `Read by ${user._id}`,
                    project: new ObjectId(data.project),
                    sender: new ObjectId(user._id),
                    createdAt: new Date(),
                    messageType: 'READ',
                }
                const project: WithId<Project> | null = await getProjectIfMember(user, message.project);
                if (!project) {
                    return;
                }
                const newLastReadAt: ProjectLastReadAt = {
                    userId: user._id,
                    date: new Date(),
                };
                await db.collection<Project>(PROJECT_COLLECTION_NAME).updateOne({_id: project._id}, {$pull: {lastReadAt: {userId: user._id}}});
                await db.collection<Project>(PROJECT_COLLECTION_NAME).updateOne({_id: project._id}, {$addToSet: {lastReadAt: newLastReadAt}});
                // Definitely don't need to save this but just to utilize DRY at frontend.
                const result = await db.collection<ChatMessage>(CHAT_COLLECTION_NAME).insertOne(message);
                const socketMessage: WithId<ChatMessage> = (await db.collection<ChatMessage>(CHAT_COLLECTION_NAME).findOne({"_id": result.insertedId}))!;
                await sendToAllMembers(project, socketMessage, io);
            } catch (error) {
                console.log(error);
            }
        });
    });
};

export const sendToAllMembers = async(project: WithId<Project>, message: WithId<ChatMessage>, io: Server): Promise<void> => {
    try {
        // TODO: Send to everyone in project
        io.to(`user:${project.createdBy}`).emit("messasge-res", message);
    } catch(error) {
        console.log(error);
    }
}

export const chatRouter: Router = express.Router();

interface ChatGetPageParams {
    projectId: string;
    createdAtBefore: string;
    pageNum: string;
    pageSize: string;
}

interface ChatGetPageResponse {
    messages: ChatMessage[];
    hasNext: boolean;
}

chatRouter.get("/getpage", async (req: Request, res: Response) => {
    try {
        const params: ChatGetPageParams = req.query as unknown as ChatGetPageParams;
        const pageNum = parseInt(params.pageNum), pageSize = parseInt(params.pageSize);
        if (Number.isNaN(pageNum) || pageNum < 0 || Number.isNaN(pageSize) || pageSize < 0) {
            returnWithErrorJson(res, "Invalid pageNum and pageSize");
            return;
        } else if (!params.projectId) {
            returnWithErrorJson(res, "Project id not given.");
            return;
        }
        // TODO: Make sure user is in the project
        const project: WithId<Project> | null = await db.collection<Project>(PROJECT_COLLECTION_NAME).findOne({
            _id: new ObjectId(params.projectId),
        });
        if (!project) {
            returnWithErrorJson(res, "User not in project");
            return;
        }
        const page: WithId<ChatMessage>[] = await db.collection<ChatMessage>(CHAT_COLLECTION_NAME).find({
            project: new ObjectId(params.projectId),
            createdAt: {$lt : new Date(params.createdAtBefore)},
        }, {
            skip: pageNum*pageSize,
            limit: pageSize+1,
            sort: {createdAt : -1},
        }).toArray();
        let hasNext = false;
        if (page.length === pageSize+1) {
            hasNext = true;
            page.pop();
        }
        const resJson: ChatGetPageResponse = {
            hasNext: hasNext,
            messages: page,
        };
        res.status(200).json(resJson);
    } catch (error) {
        console.log(error);
        returnWithErrorJson(res, "Server error");
    }
});