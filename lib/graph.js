/*global require, module, __dirname, console */
module.exports = function (file, template) {
  var fs = require('fs'),
      esprima = require('esprima'),
      escodegen = require('escodegen'),
      estraverse = require('estraverse'),
      jade = require('jade'),

      content = fs.readFileSync(file, 'utf8'),
      syntax = esprima.parse(content),
      fsm,
      target;

  function add(state) {
    var candidate = fsm.states.filter(function(value) {
      return value.name === state ;
    });
    
    if (fsm.initial === undefined && state === 'none') {
      fsm.initial = 'none';
    }

    if (candidate.length === 0 && state !== fsm.initial && state !== fsm.final) {
      fsm.states.push({
        name: state,
        activities: {
          do: [],
          entry: [],
          exit: []
        }
      });
    }
  }

  function isEvent(event) {
    return fsm.events.some(function(value) {
      return value.name === event;
    });
  }

  function isState(state) {
    return fsm.states.some(function(value) {
      return value.name === state;
    });
  }

  function addActivity(state, stage, activity, name) {
    var target_state = fsm.states.filter(function(value) {
      return value.name === state;
    });

    switch (stage) {
      case undefined:
      case 'enter':
        target_state[0].activities.entry.push(name);
        break;
      case 'leave':
        target_state[0].activities.exit.push(name);
        break;
      case 'action':
        target_state[0].activities.do.push(name);
        break;
      default:
    }
  }

  estraverse.traverse(syntax, {
    enter: function(node, parent) {
      if (node.type === 'CallExpression' && node.callee.type === 'MemberExpression' && node.callee.object.name === 'StateMachine' && node.callee.property.name === 'create') {
        target = node;
      }
    }
  });

  estraverse.traverse(target, {
    enter: function (node, parent) {
      if (node.type === 'Identifier' && parent.type === 'Property' && parent.value.type === 'FunctionExpression') {
        parent.value = {
          type: 'Identifier',
          name: parent.value.id ? '"' + parent.value.id.name + '"' : '"' + parent.key.name + '"'
        };
      }
    },
    leave: function (node, parent) {
      if (node.type === 'Identifier') {
        node.name = '"' + node.name + '"';
      }
    }
  });
  
  if (target === undefined) {
    throw new Error('NoFSM');
  }
  
  fsm = JSON.parse(escodegen.generate(target.arguments[0], {
    format: {
      json: true,
      quotes: 'single',
      compact: true
    }
  }));

  fsm.states = [];

  if (fsm.events) {
    
    // convert events with multiple from states to individual events
    fsm.events.forEach(function (event, index) {
      if (typeof event.from === 'object') {
        event.from.forEach(function (from) {
          fsm.events.push({
            name: event.name,
            from: from,
            to: event.to
          });
        });
        fsm.events.splice(index, 1);
      }
    });
    
    // handle events transitioning to the same state
    fsm.events.forEach(function (event) {
      if (event.to === undefined) {
        event.to = event.from;
      }
    });
    
    fsm.events.forEach(function(value) {
      var result = /((is_|isnot_)?(?=([a-zA-Z0-9_]+)))/g.exec(value.name);

      if (result[0]) {
        switch (result[0]) {
          case 'is_':
            value.label = '[is ' + result[3] + ']';
            break;
          case 'isnot_':
            value.label = '[is !' + result[3] + ']';
            break;
          default:
        }
      } else {
        value.label = value.name;
      }

      add(value.from);
      add(value.to);
    });
  }

  for (var prop in fsm.callbacks) {
    var result = /(on)(enter|leave)?([a-zA-Z0-9_]+)/.exec(prop),
        activity = result[0],
        stage = result[2],
        name = result[3];

    if (result && isEvent(name)) {

    }

    if (result && isState(name)) {
      addActivity(name, stage, activity, fsm.callbacks[prop]);
    }
  }
  
  if (true && fsm.events) {
    // Checks for events that have the same from and to state and includes then
    // as do activities to the state
    fsm.events = fsm.events.filter(function (event, index, events) {
      if (event.from === event.to) {
        if (fsm.callbacks && fsm.callbacks['on' + event.name]) {
          addActivity(event.from, 'action', 'activity', fsm.callbacks['on' + event.name]);
        } else {
          addActivity(event.from, 'action', 'activity', event.name);
        }
      } else {
        return true;
      }
    });
  }
  
  if (fsm.events === undefined) {
    fsm.events = [];
  }

  template = fs.readFileSync(__dirname + '/templates/' + template + '.jade', 'utf8');
  
  return jade.compile(template)(fsm);
  
};
