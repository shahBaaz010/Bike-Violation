import { MongoClient, Db, type Collection, type Document } from "mongodb";

declare global {
  // eslint-disable-next-line no-var
  var _mongoClientPromise: Promise<MongoClient> | undefined;
  // eslint-disable-next-line no-var
  var _mongoClient: MongoClient | undefined;
}

function getMongoUri(): string {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error("MONGODB_URI env var is not set. Add it to .env.local");
  }
  return uri;
}

async function getClient(): Promise<MongoClient> {
  if (global._mongoClient) {
    return global._mongoClient;
  }
  if (!global._mongoClientPromise) {
    const client = new MongoClient(getMongoUri());
    global._mongoClientPromise = client.connect().then((c) => {
      global._mongoClient = c;
      return c;
    });
  }
  return global._mongoClientPromise as Promise<MongoClient>;
}

export async function getDb(): Promise<Db> {
  const dbName = process.env.MONGODB_DB_NAME || "bike_violation";
  const client = await getClient();
  return client.db(dbName);
}

export async function getCollection<T extends Document = Document>(name: string): Promise<Collection<T>> {
  const db = await getDb();
  return db.collection<T>(name);
}


