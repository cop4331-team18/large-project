import { WithId } from "mongodb";

export type User = {
    username: string,
    password: string,
    salt: string,
    firstName: string,
    lastName: string,
    joinedAt: Date
}

type MyUser = User;

declare global {
    namespace Express {
        interface User extends WithId<MyUser> {}
    }
}