#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const pug = require('pug');
const yargs = require('yargs');

const parser = require('./lib/graph.js');

let graph;
const argv = yargs.usage('Creates a DOT graph visualization of the state machine.\nUsage: fsm2dot -f filename -s [strict|fancy]')
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

const file = path.join(process.cwd(), argv.file);
const content = fs.readFileSync(file, 'utf8');

const template = fs.readFileSync(__dirname + '/lib/templates/' + argv.style + '.jade', 'utf8');

try {
  graph = pug.compile(template)(parser(content));
} catch (e) {
  if (e.message === 'NoFSM') {
    console.log('Input file contains no FSM');
  } else {
    console.log(e);
    console.log('Please open an issue at: https://github.com/vstirbu/fsm2dot/issues');
  }
  process.exit(1);
}

if (argv.output === undefined) {
  console.log(graph);
} else {
  fs.writeFileSync(argv.output, graph);
}
