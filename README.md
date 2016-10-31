# fsm2dot

Inspects a file containing a finite state machine defined using [fsm-as-promised](https://github.com/vstirbu/fsm-as-promised) or [javascript-state-machine](https://github.com/jakesgordon/javascript-state-machine) libraries, and outputs the correspondent UML diagram using [DOT](http://www.graphviz.org/doc/info/lang.html) graph representation.

[![NPM Version](https://img.shields.io/npm/v/fsm2dot.svg)](https://www.npmjs.com/package/fsm2dot)
[![NPM License](https://img.shields.io/npm/l/fsm2dot.svg)](https://www.npmjs.com/package/fsm2dot)
[![Build Status](https://travis-ci.org/vstirbu/fsm2dot.png?branch=master)](https://travis-ci.org/vstirbu/fsm2dot)

## Features

The following finite state machine:

```javascript
var fsm = StateMachine.create({
  initial: 'start',
  final: 'stop',
  events: [
    { name: 'init', from: 'start', to: 'Ready' },
    { name: 'proceed', from: 'Ready', to: 'Steady' },
    { name: 'end', from: 'Steady', to: 'stop' },
    
    { name: 'test', from: 'Ready', to: 'Ready' }
  ],
  callbacks: {
    onReady: function () {},
    onleaveReady: function LeaveReady() {},
    onSteady: onS,
    ontest: function Activity() {}
  }
});
  
function onS() {}
```

will be converted to a DOT graph that can be visialized like this:

![Image](https://raw.github.com/vstirbu/fsm2dot/master/example/fsm.png)

## Command Line

Install [node](http://nodejs.org/), then:

```bash
$ npm install -g fsm2dot
```

and run:

```bash
$ fsm2dot --help
```

## Test

```bash
$ npm install -g mocha
$ npm test
```

## License

MIT
