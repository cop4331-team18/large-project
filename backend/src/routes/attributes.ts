//adding attributes

import { attributes } from "../util/attrData";
const { MongoClient } = require("mongodb");

const uri = "mongodb+srv://dylanrankine2:3P5UiGri0TiwwTeL@log1.xni4s.mongodb.net/?retryWrites=true&w=majority&appName=log1";

async function addToDB() {
    const client = new MongoClient(uri);

    try {
      await client.connect();
      console.log("Successful connection");

      //database being used
      const database = client.db("myDatabase");
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
