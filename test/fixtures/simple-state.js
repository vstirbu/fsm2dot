var StateMachine = require('fsm-as-promised');

StateMachine.create({
  events: [
    { name: 'startup', from: 'none', to: 'ready' }
  ]
});