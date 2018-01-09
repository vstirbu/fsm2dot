var esprima = require('esprima'),
    escodegen = require('escodegen'),
    estraverse = require('estraverse');

module.exports = function (content) {
  var syntax = esprima.parse(content),
      target,
      fsm;

  estraverse.traverse(syntax, {
    enter: function(node, parent) {
      if (node.type === 'CallExpression' && node.callee.type === 'Identifier' && node.callee.name === 'require' && node.arguments[0].value === 'fsm-as-promised') {
        fsm = parent.id.name;
      }

      if (node.type === 'CallExpression' && node.callee.type === 'Identifier' && node.callee.name === 'require' && node.arguments[0].value === 'javascript-state-machine') {
        fsm = parent.id.name;
      }
    }
  });

  estraverse.traverse(syntax, {
    enter: function(node, parent) {
      if (fsm && node.type === 'CallExpression' && node.callee.type === 'Identifier' && node.callee.name === fsm && node.arguments[0].type === 'ObjectExpression') {
        target = node;
      }

      if (fsm && node.type === 'CallExpression' && node.callee.type === 'MemberExpression' && node.callee.object.name === 'StateMachine' && node.callee.property.name === 'create') {
        target = node;
      }
    }
  });

  estraverse.traverse(target, {
    enter: function (node, parent) {
      if (node.type === 'Identifier' && parent.type === 'Property' && (parent.value.type === 'FunctionExpression' || parent.value.type === 'ArrowFunctionExpression')) {
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
    throw new Error('NoFSMFound');
  }

  return JSON.parse(escodegen.generate(target.arguments[0], {
    format: {
      json: true,
      quotes: 'single',
      compact: true
    }
  }));
}
