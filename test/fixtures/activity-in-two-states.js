const fsm = require('fsm-as-promised');

fsm({
  events: [
    { name: 'add', from: 'one' },
    { name: 'add', from: 'two' }
  ],
  callbacks: {
    onadd: () => {}
  }
});
