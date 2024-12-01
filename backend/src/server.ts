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
import { createServer } from 'http';
import { Server } from 'socket.io';
import { SocketWithUser } from './util/types';
import { chatSocketEvents } from './routes/chat';

const app = express();
const httpServer = createServer(app);

const sessionMiddleware = session({
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: mongoStore,
});

app.use(cors({origin: ALLOWED_ORIGINS, credentials: true}));
app.use(bodyParser.json());
app.use(sessionMiddleware);
app.use(passport.authenticate('session'));

app.use("/login", loginRouter);
app.use("/attributes", attributesRouter);
app.use("/projects", projectRouter);

app.get("/", async (req: Request, res: Response) => {
    res.status(200).send("Hello!");
});

// https://socket.io/how-to/use-with-passport
const io = new Server(httpServer);
io.engine.use(cors({origin: ALLOWED_ORIGINS, credentials: true}));
io.engine.use(sessionMiddleware);
io.engine.use(passport.authenticate('session'));

io.on("connection", (socket: SocketWithUser) => {
    const user: Express.User | undefined | null = socket.request.user;
    if (user) {
        socket.join(`user:${user._id}`);
        io.to(`user:${user._id}`).emit("connection", {message: "Listening to the server!"});
    }
});

chatSocketEvents(io);

httpServer.listen(PORT, () => {
    console.log(`Running on port ${PORT}`);
});