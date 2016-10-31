var StateMachine = require('fsm-as-promised');

StateMachine.create({
  events: [
    { name: 'multiple', from: 'none', to: ['one', 'two'], condition: function() { return 0 } }
  ]
});