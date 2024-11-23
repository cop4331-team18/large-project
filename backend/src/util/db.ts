import MongoStore from "connect-mongo";
import { MONGO_CONNECTION_STRING, MONGO_DB_NAME, USER_COLLECTION_NAME } from "./constants";

import { Db, MongoClient } from 'mongodb';
import { User } from "./types";

const client: MongoClient = new MongoClient(MONGO_CONNECTION_STRING);
client.connect();

export const db: Db = client.db(MONGO_DB_NAME);
db.collection<User>(USER_COLLECTION_NAME).createIndex({username: 1}, {unique: true})

export const mongoStore: MongoStore = MongoStore.create({
    client: client,
    dbName: MONGO_DB_NAME
});