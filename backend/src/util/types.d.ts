import { WithId, ObjectId } from "mongodb";
import type { IncomingMessage } from 'node:http';
import type { Socket } from 'socket.io';

export type User = {
    username: string,
    email: string,
    password: string,
    salt: string,
    firstName: string,
    lastName: string,
    joinedAt: Date,
    isVerified: boolean,
    verificationToken?: string | null,
    attributes: string[],
    projects: ObjectId[],
}

export type Project = {
    name: string,
    attributes: string[],
    description: string,
    createdBy: ObjectId,
};

export type ChatMessageInput = {
    message: string,
    project: string,
}

export type ChatMessage = {
    message: string,
    project: ObjectId,
    sender: ObjectId,
    createdAt: Date,
}

declare global {
    type MyUser = User;
    namespace Express {
        interface User extends WithId<MyUser> {}
    }
}

interface IncomingMessageWithUser extends IncomingMessage {
    user?: Express.User | null
}

export interface SocketWithUser extends Socket {
    request: IncomingMessageWithUser
}