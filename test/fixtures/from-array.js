StateMachine.create({
  events: [
    { name: 'multiple', from: ['one', 'two'], to: 'three' }
  ]
});
