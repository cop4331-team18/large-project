import express, { NextFunction, Request, Response, Router } from 'express';
import passport from 'passport';
import { Strategy as LocalStrategy} from 'passport-local';
import { db } from '../util/db';
import { returnWithErrorJson, returnWithOKJson, USER_COLLECTION_NAME } from '../util/constants';
import { User } from '../util/types';
import { InsertOneResult, WithId } from 'mongodb';
import crypto from 'crypto';

export const loginRouter: Router = express.Router();

const HASH_ITERATIONS: number = 310_000;
const HASH_KEYLEN: number = 32;
const HASH_METHOD: string = "sha256";

passport.use(new LocalStrategy(async (username: string, password: string, done) => {
    username = username.toLowerCase();
    const user: WithId<User> | null = await db.collection<User>(USER_COLLECTION_NAME).findOne({username: username});
    if (!user) {
        return done(null, false, {
            message: `User ${username} does not exist.`
        });
    }
    crypto.pbkdf2(password, user.salt, HASH_ITERATIONS, HASH_KEYLEN, HASH_METHOD, (err: Error | null, hashedPassword: Buffer) => {
        if (err) {
            return done(err);
        }
        if (crypto.timingSafeEqual(Buffer.from(user.password, 'hex'), hashedPassword)) {
            return done(null, user);
        }
        return done(null, false, {
            message: "Incorrrect password."
        });
    });
}));

passport.serializeUser((user: Express.User, done) => {
    process.nextTick(() => {
        done(null, user);
    });
});

passport.deserializeUser((user: Express.User, done) => {
    process.nextTick(() => {
        return done(null, user);
    })
});

loginRouter.post("/password", passport.authenticate('local'), async (req: Request, res: Response) => {
    returnWithOKJson(res);
});

loginRouter.get("/status", async (req: Request, res: Response) => {
    const user: any = req.user as any;
    if (user) {
        delete user.password;
        delete user.salt;
        res.status(200).json({user: user, loginStatus: true});
        return;
    }
    res.status(200).json({user: null, loginStatus: false});
});

loginRouter.post("/logout", async (req: Request, res: Response, next: NextFunction) => {
    req.logout((err) => {
        if (err) {
            return next(err);
        }
        returnWithOKJson(res);
    })
});

interface SignUpBody {
    username: string,
    password: string,
    firstName: string
    lastName: string
};

loginRouter.post("/signup", async (req: Request, res: Response) => {
    const salt = crypto.randomBytes(16).toString('hex');
    const body: SignUpBody = req.body;
    const usernameRegex: RegExp = new RegExp("^[\\w_]{3,15}$");
    if (!body.username || !usernameRegex.test(body.username)) {
        returnWithErrorJson(res, "Username should be between 3-15 characters, containing only letters, numbers, and _");
        return;
    } else if (!body.password || body.password.length < 4) {
        returnWithErrorJson(res, "Password needs to be at least 4 characters");
        return;
    }
    body.username = body.username.toLowerCase();
    const foundUser: WithId<User> | null = await db.collection<User>(USER_COLLECTION_NAME).findOne({username: body.username});
    if (foundUser) {
        returnWithErrorJson(res, `User '${body.username}' already exists. Please try another username.`);
        return;
    }
    crypto.pbkdf2(body.password, salt, HASH_ITERATIONS, HASH_KEYLEN, HASH_METHOD, async (err: Error | null, hashedPassword: Buffer) => {
        const result: InsertOneResult<User> = await db.collection<User>(USER_COLLECTION_NAME).insertOne({
            username: body.username,
            password: hashedPassword.toString('hex'),
            firstName: body.firstName,
            lastName: body.lastName,
            salt: salt,
            joinedAt: new Date()
        });
        const user: WithId<User> = (await db.collection<User>(USER_COLLECTION_NAME).findOne({"_id": result.insertedId}))!;
        req.login(user, () => {
            returnWithOKJson(res);
            return;
        })
    });
});