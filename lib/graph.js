/*global require, module, __dirname, console */
var fs = require('fs'),
    _ = require('lodash'),
    debug = require('debug')('fsm'),
    finder = require('./finder');

module.exports = function (content) {
  const found = finder(content);
  var fsm = found.configuration;

  fsm.choices = fsm.choices || [];

  function add(state) {
    if (state === undefined) {
      return;
    }

    if (Array.isArray(state)) {
      state.forEach(function (s) {
        add(s);
      });
    } else {
      var candidate = fsm.states.filter(function(value) {
        return value.name === state ;
      });

      if (fsm.initial === undefined && state === 'none') {
        fsm.initial = 'none';
      }

      if (candidate.length === 0 && state !== fsm.initial && !isFinal(state)) {
        fsm.states.push({
          name: state,
          activities: {
            do: [],
            entry: [],
            entered: [],
            exit: []
          }
        });
      }
    }
  }

  function addChoiceState(state) {
    if (fsm.choices.indexOf(state) == -1) {
      fsm.choices.push(state);
    }
  }

  function isEvent(event) {
    return fsm.events.some(function(value) {
      return value.name === event;
    });
  }

  function isState(state) {
    return fsm.states.some(function(value) {
      return value.name === state;
    });
  }

  function isFinal(state) {
    return fsm.final.some(function(value) {
      return value === state;
    });
  }

  function addActivity(state, stage, activity, name) {
    var target_state = fsm.states.filter(function(value) {
      return value.name === state;
    });

    if (target_state.length === 0) return;

    switch (stage) {
      case undefined:
      case 'enter':
        target_state[0].activities.entry.push(name);
        break;
      case 'entered':
        target_state[0].activities.entered.push(name);
        break;
      case 'leave':
        target_state[0].activities.exit.push(name);
        break;
      case 'action':
        target_state[0].activities.do.push(name);
        break;
      default:
    }
  }

  fsm.states = [];

  if (fsm.final) {
    if (typeof fsm.final === 'string') {
      fsm.final = [fsm.final];
    }
  } else {
    fsm.final = [];
  }

  if (fsm.events) {

    // add states
    fsm.events.forEach(function (event) {
      add(event.from);
      add(event.to);
    });

    // process conditional events
    fsm.events.forEach(function (event, index) {
      if (Array.isArray(event.to) && !!event.condition && !event.converted) {
        var choice = event.from + '__' + event.name;
        addChoiceState(choice);

        fsm.events.push({
          name: event.name,
          from: event.from,
          to: choice
        });

        event.to.forEach(function (state) {
          fsm.events.push({
            name: choice + '--' + state,
            from: choice,
            to: state
          });
        });

        //fsm.events.splice(index, 1);
        event.converted = true;
      }
    });

    // convert events with multiple from states to individual events
    fsm.events.forEach(function (event, index) {
      if (Array.isArray(event.from) && !event.converted) {
        event.from.forEach(function (from) {
          fsm.events.push({
            name: event.name,
            from: from,
            to: event.to
          });
        });
        //fsm.events.splice(index, 1);
        event.converted = true;
      }
    });

    // handle events transitioning to the same state
    fsm.events.forEach(function (event) {
      if (_.isUndefined(event.to)) {
        event.to = event.from;
      }
    });

    fsm.events.forEach(function(value) {
      var result = /((is_|isnot_)?(?=([a-zA-Z0-9_]+)))/g.exec(value.name);

      if (result[0]) {
        switch (result[0]) {
          case 'is_':
            value.label = '[is ' + result[3] + ']';
            break;
          case 'isnot_':
            value.label = '[is !' + result[3] + ']';
            break;
          default:
        }
      } else if (fsm.choices.indexOf(value.from) !== -1) {
        value.label = '';
      } else {
        value.label = value.name;
      }
    });

    fsm.events.forEach(function (event, index) {
      if (event.converted) {
        fsm.events.splice(index, 1);
      }
    });

    fsm.events.forEach(function (event, index) {
      if (Array.isArray(event.to) && event.converted) {
        fsm.events.splice(index, 1);
      }
    });
  }

  for (var prop in fsm.callbacks) {
    const prefix = found.callbackPrefix === '' ? '\z' : found.callbackPrefix;
    var result = new RegExp(`(${prefix})?(entered|enter|leave)?([a-zA-Z0-9_]+)`).exec(prop),
        activity = result[0],
        stage = result[2],
        name = result[3];

    if (result && isEvent(name)) {

    }

    if (result && isState(name)) {
      addActivity(name, stage, activity, fsm.callbacks[prop]);
    }
  }

  if (fsm.events) {
    // Checks for events that have the same from and to state and includes then
    // as do activities to the state
    fsm.events = fsm.events.filter(function (event, index, events) {
      if (event.from === event.to) {
        if (fsm.callbacks && fsm.callbacks['on' + event.name]) {
          addActivity(event.from, 'action', 'activity', fsm.callbacks['on' + event.name]);
        } else {
          addActivity(event.from, 'action', 'activity', event.name);
        }
      } else {
        return true;
      }
    });
  } else {
    fsm.events = [];
  }

  return {
    fsm,
    meta: {
      callbackLocs: found.callbackLocs
    }
  };
};
