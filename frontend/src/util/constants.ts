import axios from "axios";
import { User as BackendUser } from "../../../backend/src/util/types";
import { ChatMessage as BackendChatMessage, ChatMessageInput as BackendChatMessageInput } from "../../../backend/src/util/types";
import { Project as BackendProject } from "../../../backend/src/util/types";

export const SERVER_BASE_URL: string = (import.meta.env.PROD) ? "/api" : `${window.location.protocol}//${window.location.hostname}:5000`;

export const apiCall = axios.create({
    baseURL: SERVER_BASE_URL,
    withCredentials: true,
});

export type ChatMessage = {
    '_id': string, 
    project: string, 
    sender: string,
    createdAt: string,
} & Omit<BackendChatMessage, 'project' | 'sender' | 'createdAt'>;
export type ChatMessageInput = BackendChatMessageInput;

export type User = {
    '_id': string, 
    joinedAt: string,
    projects: string[],
    joinedProjects: string[],
    swipeLeft: string[],
    swipeRight: string[],
} & Omit<BackendUser, 'password' | 'salt' | 'verificationToken' | 'joinedAt' | 'projects' | 'joinedProjects' | 'swipeLeft' | 'swipeRight'>;

export type Project = {
    '_id': string,
    createdBy: string,
    swipeLeft: string[],
    swipeRight: string[],
    acceptedUsers: string[],
    rejectedUsers: string[],
    lastReadAt: {
        userId: string,
        date: string,
    }[],
    lastMessageAt: string,
} & Omit<BackendProject, 'createdBy' | 'swipeLeft' | 'swipeRight' | 'acceptedUsers' | 'rejectedUsers' | 'lastReadAt' | 'lastMessageAt'>;

export const getDateString = (date: Date | string) => {
    return new Date(date).toLocaleString(undefined, {
        year: 'numeric', 
        month: 'numeric', 
        day: 'numeric', 
        hour: 'numeric', 
        minute: 'numeric', 
        second: 'numeric'
    });
}

export const CHAT_PAGE_SIZE: number = 20;
export const MATCHING_OPTIONS_SIZE: number = 20;