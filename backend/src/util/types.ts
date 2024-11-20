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
    attributes: Set<string>,
}

type MyUser = User;

declare global {
    namespace Express {
        interface User extends WithId<MyUser> {}
    }
}