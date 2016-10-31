var StateMachine = require('fsm-as-promised');

StateMachine.create({
  events: [
    { name: 'multiple', from: ['one', 'two'], to: 'three' }
  ]
});
