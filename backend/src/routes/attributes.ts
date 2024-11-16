//adding attributes updated

import { attributes } from "../util/attrData";
import { MONGO_CONNECTION_STRING, MONGO_DB_NAME } from "../util/constants";
const { MongoClient } = require("mongodb");

async function addToDB() {
    const client = new MongoClient(MONGO_CONNECTION_STRING);

    try {
      await client.connect();
      console.log("Successful connection");

      //database being used
      const database = client.db(MONGO_DB_NAME)
      const collection = database.colllection("profileAttributes");

      for (const document of attributes) {
        const exists = await collection.findOne(document);
        if(!exists) {
            const result = await collection.insertOne(document);
            console.log(`Instered document: ${document.name}`);
        }
        else{
            console.log(`Document with name ${document.name} already exists`);
        }
      }  
    } catch (error) {
        console.error("Error uploading attributes", error);
    } finally {
        await client.close();
        console.log("Connection closed");
    }
}

addToDB();
