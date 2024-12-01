import { Server } from "socket.io";
import { ChatMessage, ChatMessageInput, Project, SocketWithUser } from "../util/types";
import { ObjectId, WithId } from "mongodb";
import { db } from "../util/db";
import { PROJECT_COLLECTION_NAME } from "../util/constants";

export const chatSocketEvents = (io: Server) => {
    io.on("connection", (socket: SocketWithUser) => {
        const user: Express.User | undefined | null = socket.request.user;
        if (!user) {
            return;
        }
        socket.on("message", async (data: ChatMessageInput) => {
            const message: ChatMessage = {
                message: data.message,
                project: new ObjectId(data.project),
                sender: new ObjectId(user._id),
                createdAt: new Date(),
            };
            // TODO: Make sure user is in the project
            const project: WithId<Project> | null = await db.collection<Project>(PROJECT_COLLECTION_NAME).findOne({
                _id: message.project,
            });
            if (!project) {
                return;
            }
            // TODO: Save message to database, send to everyone in project
            io.to(`user:${project.createdBy}`).emit("messasge-res", message);
        });
    });
};