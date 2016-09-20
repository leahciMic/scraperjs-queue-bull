# A queue plugin for Scraper.js that is backed by Bull
[![Build Status](https://travis-ci.org/leahciMic/scraperjs-queue-bull.svg?branch=master)](https://travis-ci.org/leahciMic/scraperjs-queue-bull)
[![Code Climate](https://codeclimate.com/github/leahciMic/scraperjs-queue-bull/badges/gpa.svg)](https://codeclimate.com/github/leahciMic/scraperjs-queue-bull)
[![Test Coverage](https://codeclimate.com/github/leahciMic/scraperjs-queue-bull/badges/coverage.svg)](https://codeclimate.com/github/leahciMic/scraperjs-queue-bull/coverage)
[![Issue Count](https://codeclimate.com/github/leahciMic/scraperjs-queue-bull/badges/issue_count.svg)](https://codeclimate.com/github/leahciMic/scraperjs-queue-bull)
[![Dependency Status](https://www.versioneye.com/user/projects/57730f02752cd10042009d5c/badge.svg?style=flat)](https://www.versioneye.com/user/projects/57730f02752cd10042009d5c)
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


## Changelog

2.0.0 - Remove options, extract them from a queueItem instead
