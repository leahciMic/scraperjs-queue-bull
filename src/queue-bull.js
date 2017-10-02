const bull = require('bull');
const redis = require('redis');
const bluebird = require('bluebird');

bluebird.promisifyAll(redis.RedisClient.prototype);
bluebird.promisifyAll(redis.Multi.prototype);

const REDIS_PORT = process.env.REDIS_PORT || 6379;
const REDIS_HOST = process.env.REDIS_HOST || '127.0.0.1';

const redisClient = redis.createClient({
  host: REDIS_HOST,
  port: REDIS_PORT,
});

const KEY_PREFIX = 'scraper.js-queue-bull-url-cache';

function getKey(queueItem) {
  return `${KEY_PREFIX}:(${queueItem.url})`;
}

function removeCache(queueItem) {
  return redisClient.delAsync(getKey(queueItem));
}

function createBullQueue(name) {
  const queue = bull(name, `redis://${REDIS_HOST}:${REDIS_PORT}`);

  return {
    process(fn) {
      queue.process(job => fn(job.data, job));
    },
    empty() {
      return queue.empty();
    },
    async add(queueItem) {
      const {
        expiry = 86400000,
        priority = 10,
        attempts = 2,
        backoff = 3600000,
        removeOnComplete = true,
      } = queueItem;

      // @todo was doing: removing options paramater and combining it with the queueItem
      const key = `${KEY_PREFIX}:(${queueItem.url})`;
      const saved = await redisClient.setnxAsync(key, 'true');

      if (saved === 1) {
        await queue.add(queueItem, {
          priority,
          attempts,
          backoff,
          removeOnComplete,
        });
        await redisClient.expireAsync(key, Math.ceil(expiry / 1000));
        return true;
      }

      return false;
    },
    count() {
      return queue.count();
    },
    close() {
      return queue.close();
    },
  };
}

module.exports = {
  createQueue: createBullQueue,
  removeCache,
};
