const { createQueue } = require('../src/queue-bull.js');

const test = createQueue('test');

test.add({ foo: 'bar' });

test.process((job) => {
  console.log(job.data);
});
