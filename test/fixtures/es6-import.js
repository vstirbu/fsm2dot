import StateMachine from 'fsm-as-promised';

StateMachine({
  events: [
    { name: 'startup', from: 'none', to: 'ready' }
  ]
});
