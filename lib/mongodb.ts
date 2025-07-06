import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI;
const options = {
  maxPoolSize: 10,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
};

if (!uri) throw new Error('Please add your MongoDB URI to .env.local');

let client;
let clientPromise: Promise<MongoClient>;

declare global {
  // For hot-reloading in development
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

if (process.env.NODE_ENV === 'development') {
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri, options);
    global._mongoClientPromise = client.connect();
  }
  clientPromise = global._mongoClientPromise;
} else {
  client = new MongoClient(uri, options);
  clientPromise = client.connect();
}

// 👇 NEW: export db directly from 'personal-finance' database
const dbPromise = clientPromise.then((client) => client.db('personal-finance'));

export default clientPromise;
export { dbPromise };
