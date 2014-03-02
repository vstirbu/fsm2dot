StateMachine.create({
  events: [
    { name: 'startup', from: 'none', to: 'ready' }
  ],
  callbacks: {
    onready: function readyHandler() {}
  }
});