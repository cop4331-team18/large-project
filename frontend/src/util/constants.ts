import axios from "axios";
import { User as BackendUser } from "../../../backend/src/util/types";
import { ChatMessage as BackendChatMessage, ChatMessageInput as BackendChatMessageInput } from "../../../backend/src/util/types";
import { Project as BackendProject } from "../../../backend/src/util/types";

export const SERVER_BASE_URL: string = (import.meta.env.PROD) ? "/api" : `${window.location.protocol}//${window.location.hostname}:5000`;

export const apiCall = axios.create({
    baseURL: SERVER_BASE_URL,
    withCredentials: true,
});

export type ChatMessage = {'_id': string, project: string, sender: string} & Omit<BackendChatMessage, 'project' | 'sender'>;
export type ChatMessageInput = BackendChatMessageInput;
export type User = {'_id': string, projects: string[]} & Omit<BackendUser, 'password' | 'salt' | 'verificationToken' | 'projects'>;
export type Project = {'_id': string, createdBy: string} & Omit<BackendProject, 'createdBy'>;

export const getDateString = (date: Date) => {
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