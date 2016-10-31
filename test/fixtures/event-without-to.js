var StateMachine = require('fsm-as-promised');

StateMachine.create({
  events: [
    { name: 'ev', from: 'one' }
  ]
});