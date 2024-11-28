import express, { Request, Response } from 'express';
import bodyParser from 'body-parser';
import { ALLOWED_ORIGINS, PORT, SESSION_SECRET } from './util/constants';
import { loginRouter } from './routes/login';
import cors from 'cors';
import session from 'express-session';
import { mongoStore } from './util/db';
import passport from 'passport';
import attributesRouter from './routes/attributes';
import projectRouter from './routes/projects';

const app = express();

app.use(cors({origin: ALLOWED_ORIGINS, credentials: true}));
app.use(bodyParser.json());
app.use(session({
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: mongoStore,
    cookie: {
        // sameSite: 'none', // Allow for cross site in dev environments
        // secure: true, // Need HTTPS for sameSite: 'none'
    },
}));
app.use(passport.authenticate('session'));

app.use("/login", loginRouter);
app.use("/attributes", attributesRouter);
app.use("/projects", projectRouter);

app.get("/", async (req: Request, res: Response) => {
    res.status(200).send("Hello!");
});

app.listen(PORT, () => {
    console.log(`Running on port ${PORT}`);
})