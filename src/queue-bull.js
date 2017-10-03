const bull = require('bull');
const redis = require('redis');
const nodeSha1 = require('node-sha1');
const { promisify } = require('util');

const REDIS_PORT = process.env.REDIS_PORT || 6379;
const REDIS_HOST = process.env.REDIS_HOST || '127.0.0.1';

const redisClient = redis.createClient({
  host: REDIS_HOST,
  port: REDIS_PORT,
});

const KEY_PREFIX = 'scraper.js-queue-bull-url-cache';

function createBullQueue(name, { expiry = 259200 } = {}) {
  const queue = bull(name, `redis://${REDIS_HOST}:${REDIS_PORT}`);

  return {
    process(fn) {
      queue.process(job => fn(job.data, job));
    },
    async empty() {
      await promisify(redisClient.del)(`${KEY_PREFIX}:name`);
      return queue.empty();
    },
    async add(queueItem) {
      const {
        expiry: itemExpiry,
        priority = 10,
        attempts = 3,
        backoff = {
          type: 'exponential',
          delay: 3600000,
        },
        removeOnComplete = true,
      } = queueItem;

      if (itemExpiry) {
        // eslint-disable-next-line no-console
        console.warn('scraper.js-queue-bull: Setting an expiry on an individual queueItem is no longer accepted. The entire queue must share an expiry');
      }

      // @todo was doing: removing options paramater and combining it with the queueItem

      const key = `${KEY_PREFIX}:name`;
      const saved = await promisify(redisClient.sadd)(key, nodeSha1(queueItem.url));

      if (saved === 1) {
        await queue.add(queueItem, {
          priority,
          attempts,
          backoff,
          removeOnComplete,
        });
        await promisify(redisClient.expire)(key, Math.ceil(expiry / 1000));
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
};
