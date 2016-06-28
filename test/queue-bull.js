import queueBull, { removeCache } from '../src/queue-bull.js';
import { expect } from 'chai';

const QUEUE_ITEM = { url: 'http://example.com', method: 'blah' };

describe('queue-bull', () => {
  let queue;

  beforeEach(() => {
    process.env.PRIORITY_QUEUE = !Boolean(process.env.PRIORITY_QUEUE);
    queue = queueBull('test');
  });

  afterEach(async () => {
    await queue.empty();
    await queue.close();
    await removeCache(QUEUE_ITEM);
  });

  it('should be able to add an item to the queue', async () => {
    const saved = await queue.add(QUEUE_ITEM);
    expect(saved).to.equal(true);
  });

  it('should not be able to add an item to the queue if it exists already', async () => {
    await queue.add(QUEUE_ITEM);
    const saved = await queue.add(QUEUE_ITEM);
    expect(saved).to.equal(false);
  });

  it('should return count of queue', async () => {
    await queue.add(QUEUE_ITEM);
    const count = await queue.count();
    expect(count).to.equal(1);
  });

  it('should be able to process items in queue', () => async () => {
    await queue.add(QUEUE_ITEM);
    return new Promise((resolve) => {
      queue.process((job) => {
        expect(job.url).to.equal('http://example.com');
        expect(job.method).to.equal('blah');
        resolve();
        return Promise.resolve();
      });
    });
  });

  it('should be able to process items in queue (callback)', () => async () => {
    await queue.add(QUEUE_ITEM);
    return new Promise((resolve) => {
      queue.process((job, done) => {
        expect(job.url).to.equal('http://example.com');
        expect(job.method).to.equal('blah');
        resolve();
        done();
      });
    });
  });
});
