import express, { Request, Response } from 'express';
import bodyParser from 'body-parser';
import { ALLOWED_ORIGINS, PORT, SESSION_SECRET } from './util/constants';
import { loginRouter } from './routes/login';
import cors from 'cors';
import session from 'express-session';
import { mongoStore } from './util/db';
import passport from 'passport';
import attributesRouter from './routes/attributes';

const app = express();

app.use(cors({origin: ALLOWED_ORIGINS, credentials: true}));
app.use(bodyParser.json());
app.use(session({
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: mongoStore
}));
app.use(passport.authenticate('session'));

app.use("/login", loginRouter);
app.use("/attributes", attributesRouter);

app.get("/", async (req: Request, res: Response) => {
    res.status(200).send("Hello!");
});

app.listen(PORT, () => {
    console.log(`Running on port ${PORT}`);
})