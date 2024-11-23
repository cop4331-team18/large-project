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
}

declare global {
    type MyUser = User;
    namespace Express {
        interface User extends WithId<MyUser> {}
    }
}