#!/usr/bin/env node

var parser = require('./lib/graph.js');

var fs = require('fs'),
  argv = require('yargs')
  .usage('Creates a DOT graph visualization of the state machine.\nUsage: fsm2dot -f filename -s [strict|fancy]')
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
  .argv,
  graph;

try {
  graph = parser(argv.file, argv.style);
} catch (e) {
  if (e.message === 'NoFSM') {
    console.log('Input file contains no FSM');
  } else {
    console.log(e);
    console.log('Please open an issue at: https://github.com/vstirbu/fsm2dot/issues');
  }
  return;
}

if (argv.output === undefined) {
  console.log(graph);
} else {
  fs.writeFileSync(argv.output, graph);
}
