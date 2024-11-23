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

export type UserToJSON = Omit<WithId<User>, 'password' | 'salt' | 'verificationToken'>;

type MyUser = User;

declare global {
    namespace Express {
        interface User extends WithId<MyUser> {}
    }
}