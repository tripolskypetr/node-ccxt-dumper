import { connect, ConnectionStates } from "mongoose";

import { CC_MONGO_CONNECTION_STRING } from "../../../config/params";
import { errorData, singleshot, sleep } from "functools-kit";
import { writeFile, readFile } from "fs/promises";
import { CreateIndexesOptions } from "mongodb"
import { log } from "pinolog";

const getMongoose = singleshot(
  async () => await connect(CC_MONGO_CONNECTION_STRING)
);

type Mongoose = Awaited<ReturnType<typeof getMongoose>>;

const CONNECTED_STATE: ConnectionStates = 1;

const CONNECTION_TIMEOUT = 15_000;
const TIMEOUT_SYMBOL = Symbol("timeout");

const waitForConnect = (mongoose: Mongoose) =>
  new Promise<void>((resolve) => {
    mongoose.connection.on("connected", () => {
      log("mongooseService Mongo connected to the database");
      resolve();
    });
  });

export class MongooseService {
  public waitForInit = singleshot(async () => {
    log("mongooseService waitForInit");
    const mongoose = await getMongoose();
    if (mongoose.connection.readyState === CONNECTED_STATE) {
      return mongoose;
    }
    const result = await Promise.race([
      waitForConnect(mongoose),
      sleep(CONNECTION_TIMEOUT).then(() => TIMEOUT_SYMBOL),
    ]);
    if (result === TIMEOUT_SYMBOL) {
      this.waitForInit.clear();
      throw new Error("Mongoose connection timeout");
    }
    return mongoose;
  });

  public saveIndexes = async () => {
    log("mongooseService saveIndexes");
    const mongoose = await this.waitForInit();

    const allIndexes = {};

    for (const modelName of Object.keys(mongoose.models)) {
      const model = mongoose.models[modelName];
      const indexes = await model.collection.getIndexes();
      allIndexes[modelName] = indexes;
    }

    const indexesJson = JSON.stringify(allIndexes, null, 2);

    await writeFile("./indexes.txt", indexesJson);
  };

  public restoreIndexes = async () => {
    log("mongooseService restoreIndexes");

    const mongoose = await this.waitForInit();

    const indexesData = JSON.parse(await readFile("./indexes.txt", "utf-8"));

    for (const [modelName, indexes] of Object.entries(indexesData)) {
      const model = mongoose.models[modelName];
      if (!model) {
        console.warn(
          `Model ${modelName} not found in mongoose.models. Skipping.`
        );
        continue;
      }
      const existingIndexes = await model.collection.getIndexes();
      const existingIndexKeys = new Set(
        Object.keys(existingIndexes).map((key) => key)
      );
      for (const [indexName, indexFields] of Object.entries(indexes)) {
        if (indexName === "_id_") continue;
        if (existingIndexKeys.has(indexName)) {
          console.log(
            `Index ${indexName} on ${modelName} already exists. Skipping.`
          );
          continue;
        }
        const indexSpec = {};
        let options: CreateIndexesOptions = {};
        for (const [field, type] of indexFields) {
          if (type === "text") {
            indexSpec[field] = "text";
            options = { ...options, name: indexName };
          } else {
            indexSpec[field] = type;
            options = { ...options, name: indexName };
          }
        }
        try {
          await model.collection.createIndex(indexSpec, options);
          console.log(`Created index ${indexName} on ${modelName}`);
        } catch (error) {
          console.error(
            `Error creating index ${indexName} on ${modelName}:`,
            error.message
          );
        }
      }
    }
  };

  protected init = singleshot(async () => {
    log("mongooseService init");

    const mongoose = await this.waitForInit();

    mongoose.connection.on("connected", () => {
      log("mongooseService Mongo connected to the database");
    });

    mongoose.connection.on("error", (err) => {
      log("mongooseService Mongo error", {
        error: errorData(err),
      });
      throw new (class extends Error {
        constructor() {
          super("mongooseService Mongo error");
        }
        originalError = errorData(err);
      })();
    });

    mongoose.connection.on("disconnected", () => {
      log("mongooseService disconnected from the database.");
    });

    mongoose.connection.on("reconnected", () => {
      log("mongooseService reconnected to the database.");
    });

    process.on("SIGINT", async () => {
      await mongoose.connection.close();
    });
  });
}

export default MongooseService;
