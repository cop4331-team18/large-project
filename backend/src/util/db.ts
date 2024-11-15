import MongoStore from "connect-mongo";
import { MONGO_CONNECTION_STRING, MONGO_DB_NAME } from "./constants";

import { Db, MongoClient } from 'mongodb';

const client: MongoClient = new MongoClient(MONGO_CONNECTION_STRING);
client.connect();

export const db: Db = client.db(MONGO_DB_NAME);

export const mongoStore: MongoStore = MongoStore.create({
    client: client,
    dbName: MONGO_DB_NAME
});