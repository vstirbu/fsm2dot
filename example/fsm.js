var fsm = StateMachine.create({
  initial: 'start',
  final: 'stop',
  events: [
    { name: 'init', from: 'start', to: 'Ready' },
    { name: 'proceed', from: 'Ready', to: 'Steady' },
    { name: 'end', from: 'Steady', to: 'stop' },
    
    { name: 'test', from: 'Ready', to: 'Ready' }
  ],
  callbacks: {
    onReady: function () {},
    onleaveReady: function LeaveReady() {},
    onSteady: onS,
    ontest: function Activity() {}
  }
});
  
function onS() {}