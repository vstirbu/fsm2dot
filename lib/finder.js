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

  if (target === undefined) {
    throw new Error('NoFSMFound');
  }

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

      if (node.type === 'Property' && node.key.name === 'condition' && node.value.type === 'CallExpression') {
        node.value = {
          type: 'Identifier',
          name: 'condition',
          loc: node.value.loc
        }
      }

      // if initial is function, remove initial from configuration
      if (node.type === 'Property' && node.key.type === 'Identifier' && node.key.name === 'initial' && node.value.type === 'CallExpression') {
        parent.properties = parent.properties.filter(property => property!== node);
      }

      // converts keyed properties from Literal to Identifier
      if (node.type === 'Property' && node.key.type === 'Literal') {
        node.key = {
          type: 'Identifier',
          name: node.key.value,
          loc: node.key.loc
        }
      }
    },
    leave: function (node, parent) {
      if (node.type === 'Identifier') {
        node.name = '"' + node.name + '"';
      }
    }
  });

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
