import { WithId } from "mongodb";

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

declare global {
    type MyUser = User;
    namespace Express {
        interface User extends WithId<MyUser> {}
    }
}