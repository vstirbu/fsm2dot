/*global require, module, __dirname, console */
module.exports = function (file, template, output) {
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

    if (candidate.length === 0 && state !== fsm.initial && state !== fsm.final) {
      fsm.states.push({
        name: state,
        activities: []
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
    var target = fsm.states.filter(function(value) {
      return value.name === state;
    });

    switch (stage) {
      case undefined:
      case 'enter':
        target[0].activities.push('entry/' + name);
        break;
      case 'leave':
        target[0].activities.push('exit/' + name);
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
  
  fsm = JSON.parse(escodegen.generate(target.arguments[0], {
    format: {
      json: true,
      quotes: 'single',
      compact: true
    }
  }));

  fsm.states = [];

  if (fsm.initial === undefined) {
    fsm.initial = 'none';
  }

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

  template = fs.readFileSync(__dirname + '/templates/' + template + '.jade', 'utf8');

  if (output === undefined) {
    console.log(jade.compile(template)(fsm));
  } else {
    fs.writeFileSync(output, jade.compile(template)(fsm));
  }
};
