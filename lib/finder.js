var esprima = require('esprima'),
    escodegen = require('escodegen'),
    estraverse = require('estraverse');

module.exports = function (content) {
  var syntax = esprima.parseModule(content, { loc: true, jsx: true }),
      target,
      fsm;

  const callbackLocs = {};
  let callbackPrefix = 'on';

  estraverse.traverse(syntax, {
    enter: function(node, parent) {
      if (node.type === 'CallExpression' && node.callee.type === 'Identifier' && node.callee.name === 'require' && node.arguments[0].value === 'fsm-as-promised') {
        fsm = parent.id.name;
      }

      if (node.type === 'CallExpression' && node.callee.type === 'Identifier' && node.callee.name === 'require' && node.arguments[0].value === 'javascript-state-machine') {
        fsm = parent.id.name;
      }

      if (node.type === 'ImportDeclaration' && node.source.value === 'fsm-as-promised') {
        fsm = node.specifiers[0].local.name;
      }

      if (node.type === 'MemberExpression' && node.property.name === 'callbackPrefix') {
        callbackPrefix = parent.right.value;
      }
    },
    fallback: node => node.type !== 'JSXElement'
  });

  estraverse.traverse(syntax, {
    enter: function(node, parent) {
      if (fsm && node.type === 'CallExpression' && node.callee.type === 'Identifier' && node.callee.name === fsm && node.arguments[0].type === 'ObjectExpression') {
        target = node;
      }

      if (fsm && node.type === 'CallExpression' && node.callee.type === 'MemberExpression' && node.callee.object.name === 'StateMachine' && node.callee.property.name === 'create') {
        target = node;
      }
    },
    fallback: node => node.type !== 'JSXElement'
  });

  estraverse.traverse(target, {
    enter: function (node, parent) {
      if (node.type === 'Identifier' && parent.type === 'Property' && (parent.value.type === 'FunctionExpression' || parent.value.type === 'ArrowFunctionExpression')) {
        parent.value = {
          type: 'Identifier',
          name: parent.value.id ? '"' + parent.value.id.name + '"' : '"' + parent.key.name + '"'
        };

        const functionName = parent.value.name.replace(/\"/g, '');
        if (functionName !== 'condition') {
          callbackLocs[functionName] = node.loc;
        }
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

  console.log(escodegen.generate(target.arguments[0], {
    format: {
      json: true,
      quotes: 'single',
      compact: true
    }
  }));

  const configuration =  JSON.parse(escodegen.generate(target.arguments[0], {
    format: {
      json: true,
      quotes: 'single',
      compact: true
    }
  }));

  return {
    callbackLocs,
    callbackPrefix,
    configuration
  };
}
