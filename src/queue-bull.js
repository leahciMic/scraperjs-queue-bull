import createNormalQueue from 'bull';
import createPriorityQueue from 'bull/lib/priority-queue';

const REDIS_PORT = process.env.REDIS_PORT || 6379;
const REDIS_HOST = process.env.REDIS_HOST || '127.0.0.1';

export default function createBullQueue(name) {
  const createQueue = process.env.PRIORITY_QUEUE ? createPriorityQueue : createNormalQueue;
  const queue = createQueue(name, REDIS_PORT, REDIS_HOST);
  return {
    process(fn) {
      const callbackWrapper = (job, done) => fn(job.data, done);
      const promiseWrapper = job => fn(job.data);

      queue.process(fn.length === 2 ? callbackWrapper : promiseWrapper);
    },
    add(queueItem, opts) {
      return queue.add(queueItem, opts);
    },
  };
}
