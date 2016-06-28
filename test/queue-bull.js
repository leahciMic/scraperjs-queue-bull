import queueBull from '../src/queue-bull.js';
import mockRedis from 'redis-mock';

const queue = queueBull('test', () => mockRedis.createClient());

describe('queue-bull', () => {
  it('should be able to add an item to the queue', () => {
    queue.add({
      url: 'blah',
      method: 'blah',
    });
  });
});
