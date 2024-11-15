import express, { Request, Response } from 'express';
import bodyParser from 'body-parser';
import { PORT, SESSION_SECRET } from './util/constants';
import { loginRouter } from './routes/login';
import cors from 'cors';
import session from 'express-session';
import { mongoStore } from './util/db';
import passport from 'passport';

const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use(session({
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: mongoStore
}));
app.use(passport.authenticate('session'));

app.use("/login", loginRouter);

app.get("/", async (req: Request, res: Response) => {
    res.status(200).send("Hello!");
});

app.listen(PORT, () => {
    console.log(`Running on port ${PORT}`);
})