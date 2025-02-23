import {
  MongoClient,
  Database,
} from "https://deno.land/x/mongo@v0.34.0/mod.ts";

/**
 * an instance of MongoClient to connect to the mongodb database
 *
 * @author Sriram Sundar
 * @type MongoClient
 */
const client: MongoClient = new MongoClient();

/**
 * The url of the mongodb server to connect to
 *
 * @author Sriram Sundar
 * @type string
 */
const MONGO_URI: string = Deno.env.get("MONGODB_URI") || "";

// check if the url is povided in the environment
if (MONGO_URI === "")
  (() => {
    throw new Error(
      "mongodb url is not provided in the environment please check your .env file if this is dev environment"
    );
  })();

// connect to the mongodb instance
await client
  .connect(MONGO_URI)
  .then(() => {
    console.log("connected to mongo db");
  })
  .catch((err) => {
    console.error(err);
  });

/**
 *
 * @author Sriram Sundar
 *
 * @type {Database}
 */
const db: Database = client.database("soton_therapy");

export { db };
