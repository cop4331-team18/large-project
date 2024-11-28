import axios from "axios";
import { User as BackendUser } from "../../../backend/src/util/types";

// export const SERVER_BASE_URL: string = "http://localhost:5000"
export const SERVER_BASE_URL: string = "http://54.210.31.202/api"

export const apiCall = axios.create({
    baseURL: SERVER_BASE_URL,
    withCredentials: true,
});

export type User = {'_id': string} & Omit<BackendUser, 'password' | 'salt' | 'verificationToken'>;