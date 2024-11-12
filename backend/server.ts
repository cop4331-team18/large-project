import express, { Request, Response } from 'express';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
dotenv.config();
const cors = require('cors');

const app = express();
const port: string = process.env.PORT!;

app.use(cors());
app.use(bodyParser.json());

app.get("/", async(req: Request, res: Response) => {
    res.status(200).send("Hello!");
});

app.listen(port, () => {
    console.log(`Running on port ${port}`);
})