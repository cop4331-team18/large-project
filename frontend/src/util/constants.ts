import axios from "axios";
import { User as BackendUser } from "../../../backend/src/util/types";

export const SERVER_BASE_URL: string = (import.meta.env.PROD) ? "/api" : `${window.location.protocol}//${window.location.hostname}:5000`;

export const apiCall = axios.create({
    baseURL: SERVER_BASE_URL,
    withCredentials: true,
});

export type User = {'_id': string} & Omit<BackendUser, 'password' | 'salt' | 'verificationToken'>;