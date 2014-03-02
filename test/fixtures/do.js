StateMachine.create({
  events: [
    { name: 'Do', from: 'ready', to: 'ready' }
  ],
  callbacks: {
    onDo: function () {}
  }
});
