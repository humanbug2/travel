import { MongoClient } from 'mongodb';

let client;
let clientPromise;

if (!process.env.MONGO_URL) {
  throw new Error('Please add your MongoDB URI to .env file');
}

if (process.env.NODE_ENV === 'development') {
  if (!global._mongoClientPromise) {
    client = new MongoClient(process.env.MONGO_URL);
    global._mongoClientPromise = client.connect();
  }
  clientPromise = global._mongoClientPromise;
} else {
  client = new MongoClient(process.env.MONGO_URL);
  clientPromise = client.connect();
}

export default clientPromise;