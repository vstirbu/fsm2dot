#!/usr/bin/env node

var argv = require('yargs')
  .usage('Creates a DOT graph visualization of the state machine.\nUsage: fsm2dot -f filename -s [strict|fancy]')
//  .example('$0 -f', 'count the lines in the given file')
  .options('f', {
    alias: 'file',
    describe: 'Source file with a finite state machine'
  })
  .options('s', {
    alias: 'style',
    describe: 'DOT graph style',
    default: 'fancy'
  })
  .options('o', {
    alias: 'output',
    describe: 'Output filename'
  })
  .demand('f')
  .argv;

require('./lib/graph.js')(argv.file, argv.style, argv.output);
