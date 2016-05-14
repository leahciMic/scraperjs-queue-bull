import createNormalQueue from 'bull';
import createPriorityQueue from 'bull/lib/priority-queue';

export default function createBullQueue(name) {
  const createQueue = process.env.PRIORITY_QUEUE ? createPriorityQueue : createNormalQueue;
  const queue = createQueue(name);
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
