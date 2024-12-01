import { Server } from "socket.io";
import { SocketWithUser } from "../util/types";

export const chatSocketEvents = (io: Server) => {
    io.on("connection", (socket: SocketWithUser) => {
        const user: Express.User | undefined | null = socket.request.user;
        if (user) {
            socket.join(`user:${user.username}`);
            io.to(`user:${user.username}`).emit("connection", {message: "Listening to the server from chat.ts!"});
        }
    })
};