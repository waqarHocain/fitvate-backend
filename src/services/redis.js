const { createClient } = require("redis");

if (!process.env.REDIS_URL) {
  throw new Error("Redis connection string is not set.");
}

const redisClient = createClient({
  url: process.env.REDIS_URL,
});

redisClient.on("error", (err) => console.error("Redis client error", err));

async function connectRedis() {
  await redisClient.connect();
  console.log("Redis client ready: ", redisClient.isOpen);
}

// helper
const getOrSetCache = (cb) => cb();

function getCache(key) {
  return new Promise((resolve, reject) => {
    try {
      getOrSetCache(async () => {
        const data = await redisClient.get(key);
        if (data) {
          console.log("Sending cache...");
        }
        resolve(data);
      });
    } catch (e) {
      console.error(e);
      reject(e);
    }
  });
}

function setCache(key, data) {
  const date = new Date();

  const now = Date.now();
  const endOfDay = date.setUTCHours(23, 59, 59, 999);

  const secondsLeftTillEndOfDay = Math.floor((endOfDay - now) / 1000);

  return new Promise((resolve, reject) => {
    try {
      getOrSetCache(async () => {
        const isOk = await redisClient.set(key, data, {
          EX: secondsLeftTillEndOfDay,
        });
        if (isOk) console.log("CACHED.");
        resolve();
      });
    } catch (e) {
      console.error(e);
      reject(e);
    }
  });
}
module.exports = { connectRedis, getCache, setCache };
