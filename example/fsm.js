var fsm = StateMachine.create({
  initial: 'start',
  final: 'stop',
  events: [
    { name: 'init', from: 'start', to: 'Ready' },
    { name: 'proceed', from: 'Ready', to: 'Steady' },
    { name: 'end', from: 'Steady', to: 'stop' }
  ],
  callbacks: {
    onReady: function () {},
    onleaveReady: function LeaveReady() {},
    onSteady: onS
  }
});
  
function onS() {}