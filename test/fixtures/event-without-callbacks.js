var StateMachine = require('fsm-as-promised');

StateMachine.create({
  events: [
    { name: 'justName', from: 'one' }
  ]
});