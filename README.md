# A queue plugin for Scraper.js that is backed by Bull

## Methods

### process(function)

The supplied function will be called for each item in the queue one at a time.

### add(queueItem, opts)

Add's a queueItem.

### count()

Returns a promise that will resolve to the remaining items in the queue.

### close()

Close everything.

## Environment variables

`PRIORITY_QUEUE`, if defined, a priority queue will be used
`REDIS_PORT`, the port for Redis
`REDIS_HOST`, the host for Redis

## Todo

* More documentation.
* Tests.
* Remove environment variables, and pass these things in from scraper.js.
