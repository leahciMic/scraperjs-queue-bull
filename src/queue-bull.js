import createNormalQueue from 'bull';
import createPriorityQueue from 'bull/lib/priority-queue';
import redis from 'redis';
import bluebird from 'bluebird';

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

export function removeCache(queueItem) {
  return redisClient.delAsync(getKey(queueItem));
}

export default function createBullQueue(name) {
  const createQueue = process.env.PRIORITY_QUEUE ? createPriorityQueue : createNormalQueue;
  const queue = createQueue(name, REDIS_PORT, REDIS_HOST);

  return {
    process(fn) {
      const callbackWrapper = (job, done) => fn(job.data, done);
      const promiseWrapper = job => fn(job.data);

      queue.process(fn.length === 2 ? callbackWrapper : promiseWrapper);
    },
    empty() {
      return queue.empty();
    },
    async add(queueItem, {
      expiry = 86400000,
      priority = 'high',
      attempts = 2,
      backoff = 3600000,
     } = {}) {
      const key = `${KEY_PREFIX}:(${queueItem.url})`;
      const saved = await redisClient.setnxAsync(key, 'true');

      if (saved === 1) {
        await queue.add(queueItem, {
          priority,
          attempts,
          backoff,
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
