// Mongo connection (native driver over Workers TCP, nodejs_compat required).
import { MongoClient } from "mongodb";

const MONGO_OPTS = { maxPoolSize: 3, serverSelectionTimeoutMS: 5000, connectTimeoutMS: 5000, socketTimeoutMS: 10000 };

async function connectMongo(env) {
  // Cold isolates occasionally see Atlas server selection stall; fail fast
  // and retry once with a fresh client instead of hanging until the
  // Workers runtime cancels the request.
  const first = new MongoClient(env.MONGODB_URI, MONGO_OPTS);
  try {
    await first.connect();
    return first;
  } catch (err) {
    try { await first.close(); } catch (_) {}
    const second = new MongoClient(env.MONGODB_URI, MONGO_OPTS);
    await second.connect();
    return second;
  }
}

export async function getDb(env) {
  if (!globalThis._portfolioMongo) {
    // Concurrent requests on a cold isolate must share one connection
    // attempt: parallel connects race and can crash the request.
    if (!globalThis._portfolioMongoPromise) {
      globalThis._portfolioMongoPromise = connectMongo(env)
        .then(function (client) { globalThis._portfolioMongo = client; })
        .finally(function () { globalThis._portfolioMongoPromise = null; });
    }
    await globalThis._portfolioMongoPromise;
  }
  return globalThis._portfolioMongo.db("portfolio");
}

export * from "./_store.js";
