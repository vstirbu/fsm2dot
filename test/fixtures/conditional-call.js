var StateMachine = require('fsm-as-promised');

function fn() { return 0 }

StateMachine({
  events: [
    { name: 'multiple', from: 'none', to: ['one', 'two'], condition: fn.bind(this) }
  ]
});
