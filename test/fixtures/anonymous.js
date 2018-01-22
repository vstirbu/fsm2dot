var StateMachine = require('fsm-as-promised');

StateMachine({
  events: [
    { name: 'startup', from: 'none', to: 'ready' }
  ],
  callbacks: {
    onready: function () {}
  }
});
