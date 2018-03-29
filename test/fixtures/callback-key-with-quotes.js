var StateMachine = require('fsm-as-promised');

StateMachine.callbackPrefix = '';

StateMachine({
  events: [
    { name: 'quoted', from: 'one', to: 'two' }
  ],
  callbacks: {
    "quoted": () => {}
  }
});
