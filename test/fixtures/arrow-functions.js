var StateMachine = require('fsm-as-promised');

StateMachine.create({
  events: [
    { name: 'multiple', from: 'none', to: ['one', 'two'], condition: () => { return 0 } }
  ],
  callbacks: {
    onmultiple: () => {}
  }
});
