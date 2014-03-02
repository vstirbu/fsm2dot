StateMachine.create({
  events: [
    { name: 'startup', from: 'none', to: 'ready' }
  ],
  callbacks: {
    onready: readyHandler
  }
});
  
function readyHandler() {}