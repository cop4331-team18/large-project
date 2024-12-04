import express, { NextFunction, Request, Response, Router } from 'express';
import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import { db } from '../util/db';
import { returnWithErrorJson, returnWithOKJson, USER_COLLECTION_NAME } from '../util/constants';
import { User } from '../util/types';
import { InsertOneResult, MongoServerError, ObjectId, WithId } from 'mongodb';
import crypto from 'crypto';
import nodemailer from "nodemailer";

export const loginRouter: Router = express.Router();

const HASH_ITERATIONS: number = 310_000;
const HASH_KEYLEN: number = 32;
const HASH_METHOD: string = "sha256";

// Returns the reqUser that may have updated fields after log in/sign up.
export async function getReqUser(req: Request): Promise<WithId<User> | null> {
    if (!req || !req.user) {
        return null;
    }
    const reqUser: Express.User = req.user;
    return await db.collection<User>(USER_COLLECTION_NAME).findOne({"_id": new ObjectId(reqUser._id), "username": reqUser.username});
}

passport.use(new LocalStrategy(async (username: string, password: string, done) => {
    username = username.toLowerCase();
    const user: WithId<User> | null = await db.collection<User>(USER_COLLECTION_NAME).findOne({ username: username });
    if (!user) {
        return done(null, false, {
            message: `User ${username} does not exist.`,
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
            message: "Incorrect password.",
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
    });
});

loginRouter.post("/password", passport.authenticate('local'), async (req: Request, res: Response) => {
    returnWithOKJson(res);
});

loginRouter.get("/status", async (req: Request, res: Response) => {
    const user: any = await getReqUser(req);
    if (user) {
        delete user.password;
        delete user.salt;
        delete user.verificationToken;
        res.status(200).json({ user: user, loginStatus: true });
        return;
    }
    res.status(200).json({ user: null, loginStatus: false });
});

loginRouter.post("/logout", async (req: Request, res: Response, next: NextFunction) => {
    req.logout((err) => {
        if (err) {
            return next(err);
        }
        returnWithOKJson(res);
    });
});

interface SignUpBody {
    username: string,
    email: string,
    password: string,
    firstName: string,
    lastName: string,
};

loginRouter.post("/signup", async (req: Request, res: Response) => {
    const salt = crypto.randomBytes(16).toString('hex');
    const body: SignUpBody = req.body;
    const usernameRegex: RegExp = new RegExp("^[\\w_]{3,15}$");
    const emailRegex: RegExp = new RegExp("^[\\w-\\.]{1,30}@([\\w-]{1,30}\\.){1,5}[\\w-]{2,4}$")
    if (!body.username || !usernameRegex.test(body.username)) {
        returnWithErrorJson(res, "Username should be between 3-15 characters, containing only letters, numbers, and _");
        return;
    } else if (!body.password || body.password.length < 4) {
        returnWithErrorJson(res, "Password needs to be at least 4 characters");
        return;
    } else if (!body.email || !emailRegex.test(body.email)) {
        returnWithErrorJson(res, "Email provided is not valid");
        return;
    }
    body.username = body.username.toLowerCase();
    const foundUser: WithId<User> | null = await db.collection<User>(USER_COLLECTION_NAME).findOne({ username: body.username });
    if (foundUser) {
        returnWithErrorJson(res, `User '${body.username}' already exists. Please try another username.`);
        return;
    }
    const verificationToken = crypto.randomBytes(32).toString('hex');
    crypto.pbkdf2(body.password, salt, HASH_ITERATIONS, HASH_KEYLEN, HASH_METHOD, async (err: Error | null, hashedPassword: Buffer) => {
        if (err) {
            returnWithErrorJson(res, "Error while signing up.");
            return;
        }
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });
        const verificationUrl = `${process.env.SERVER_BASE_URL}/login/verify?token=${verificationToken}`;
        const mailOptions: nodemailer.SendMailOptions = {
            from: process.env.EMAIL_USER,
            to: body.email,
            subject: 'Verify Your Email',
            html: `<p>Welcome, ${body.username}!</p>
                   <p>Please verify your email by clicking the link below:</p>
                   <a href="${verificationUrl}">Verify Email</a>`,
        };
        try {
            await transporter.sendMail(mailOptions);
        } catch (error) {
            returnWithErrorJson(res, `Failed to send verification email:\n${error}`);
            return;
        }
        try {
            const result: InsertOneResult<User> = await db.collection<User>(USER_COLLECTION_NAME).insertOne({
                username: body.username,
                password: hashedPassword.toString('hex'),
                email : body.email,
                firstName: body.firstName,
                lastName: body.lastName,
                bio: "",
                salt: salt,
                joinedAt: new Date(),
                isVerified: false,
                verificationToken: verificationToken,
                attributes: [],
                projects: [],
                swipeLeft: [],
                swipeRight: [],
            });
            const user: WithId<User> = (await db.collection<User>(USER_COLLECTION_NAME).findOne({"_id": result.insertedId}))!;
            req.login(user, () => {
                returnWithOKJson(res);
                return;
            })
        } catch (error) {
            if (error instanceof MongoServerError) {
                returnWithErrorJson(res, `Failed to create user: ${error.message}`);
            } else {
                returnWithErrorJson(res, `Failed to create user: ${err}`)
            }
        }
    });
});

// Verification Endpoint
loginRouter.get("/verify", async (req: Request, res: Response) => {
    const token = req.query.token as string;
    const reqUser: Express.User | null = await getReqUser(req);
    if (!reqUser) {
        returnWithErrorJson(res, "User not logged in.");
        return;
    } else if (!token) {
        returnWithErrorJson(res, "Verification token is required.");
        return;
    } else if (reqUser.isVerified) {
        returnWithErrorJson(res, "User has their email verified already.");
        return;
    } else if (reqUser.verificationToken !== token) {
        returnWithErrorJson(res, "Invalid or expired verification token.");
        return;
    }

    const updateResult = await db.collection<User>(USER_COLLECTION_NAME).updateOne(
        { _id: reqUser._id },
        { $set: { isVerified: true, verificationToken: null } }
    );

    if (updateResult.modifiedCount === 1) {
        res.status(200).json({ message: "Email verified successfully!" });
    } else {
        returnWithErrorJson(res, "Failed to verify email. Please try again.");
    }
});

export default loginRouter;
