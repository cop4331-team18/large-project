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
    bio: string,
    joinedAt: Date,
    isVerified: boolean,
    verificationToken?: string | null,
    attributes: string[],
    projects: ObjectId[],                //this is the projects the user created
    joinedProjects: ObjectId[],          //this is the projects the user has joined
    swipeLeft: ObjectId[],
    swipeRight: ObjectId[],
}

export type ProjectLastReadAt = {
    userId: ObjectId,
    date: Date,
};

export type Project = {
    name: string,
    attributes: string[],
    description: string,
    createdBy: ObjectId,
    swipeLeft: ObjectId[],
    swipeRight: ObjectId[],
    acceptedUsers: ObjectId[],
    rejectedUsers: ObjectId[],
    lastReadAt: ProjectLastReadAt[],
    lastMessageAt: Date,
}

export type ChatMessageInput = {
    message: string,
    project: string,
}

export type ChatMessage = {
    message: string,
    project: ObjectId,
    sender: ObjectId,
    createdAt: Date,
    messageType: 'CHAT' | 'CREATE' | 'UPDATE' | 'JOIN' | 'READ';
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