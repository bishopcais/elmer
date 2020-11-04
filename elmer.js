#!/usr/bin/env node

'use strict';

const os = require('os');
const path = require('path');
const util = require('util');
const io = require('@cisl/io')({
  cogPath: path.join(os.homedir(), 'cog.json'),
});
const logger = require('@cisl/zepto-logger');
const packageJson = require('./package');

if (!io.rabbit) {
  logger.fatal('Could not find RabbitMQ. Please make sure you have a cog.json file in home directory');
  process.exit(1);
}

const usage = `usage: elmer [options] <command> [args...]

Elmer is a debug tool for hunting down RabbitMQ information

Options:
  -V, --version             output the version number
  -h, --help                display help for command

Commands:
  topic [exchange] <topic>  output messages to topic on exchange, if exchange
                                is omitted, defaults to \`amq.topic\`
  queue <name>              output messages to queue
`;

/**
 *
 * @param {*} msg
 */
function outputMessage(msg) {
  console.log(`-> content type: ${msg.properties.contentType || ''}`);
  if (msg.properties.contentType === 'application/json') {
    console.log('-> message:');
    console.log(util.inspect(msg.content, false, 10));
  }
  else if (msg.properties.contentType && msg.properties.contentType.startsWith('text/')) {
    console.log(`-> message: ${msg.content}`);
  }
  else {
    try {
      const json = JSON.parse(msg.content.toString());
      console.log('-> message:');
      console.log(util.inspect(json, {depth: 10, colors: true}));
    }
    catch (_) {
      try {
        console.log(`-> message: ${msg.content.toString()}`);
      }
      catch (_) {
        console.log('-> message:');
        console.log(msg.content);
      }
    }
  }
}

/**
 * @param {string} queueName
 */
function queue(queueName) {
  logger.info(`Listening to queue '${queueName}'`);
  io.rabbit.onQueue(queueName, (msg) => {
    logger.info('          ~ new message ~');
    outputMessage(msg);
    console.log();
  });
}

/**
 * @param {string} exchange
 * @param {string} [topic]
 */
function topic(exchange, key) {
  if (!key) {
    key = exchange;
    exchange = 'amq.topic';
  }

  logger.info(`Listening to exchange '${exchange}' with topic '${key}'`);

  io.rabbit.onTopic(key, {exchange}, (msg) => {
    logger.info('          ~ new message ~');
    console.log(`-> queue_name:   ${msg.fields.consumerTag}`);
    console.log(`-> routing key:  ${msg.fields.routingKey}`);
    outputMessage(msg);
    console.log();
  });
}

const argv = process.argv.slice(2);
if (!argv.length) {
  console.log(usage);
  process.exit(0);
}

switch (argv.splice(0, 1)[0]) {
  case 'queue':
    if (argv.length !== 1) {
      console.error('invalid uage of `queue` command');
      console.error();
      console.error(usage);
      process.exit(1);
    }
    queue(...argv);
    break;
  case 'topic':
    if (argv.length !== 1 && argv.length !== 2) {
      console.error('invalid uage of `topic` command');
      console.error();
      console.error(usage);
      process.exit(1);
    }
    topic(...argv);
    break;
  case '-V':
  case '--version':
    console.log(packageJson.version);
    process.exit(0);
    break;
  case '-h':
  case '--help':
    console.log(usage);
    process.exit(0);
    break;
  default:
    console.log('default');
    console.log(usage);
    process.exit(1);
}
