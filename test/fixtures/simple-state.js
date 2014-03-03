StateMachine.create({
  events: [
    { name: 'startup', from: 'none', to: 'ready' }
  ]
});