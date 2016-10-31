var StateMachine = require('fsm-as-promised');

StateMachine.create({
  events: [
    { name: 'Do', from: 'ready', to: 'ready' }
  ],
  callbacks: {
    onDo: function () {}
  }
});
