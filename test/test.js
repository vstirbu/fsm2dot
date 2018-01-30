/*global require, describe, it, assert */
const assert = require('assert');
const fs = require('fs');

const graph = require('../lib/graph.js');

function test(testcase) {
  const input = fs.readFileSync('test/fixtures/' + testcase + '.js', { encoding: 'utf8' });
  // console.log(JSON.stringify(graph(input)));
  const expected = fs.readFileSync('test/expected/json/' + testcase + '.json', { encoding: 'utf8' });
  return assert.equal(JSON.stringify(graph(input).fsm), expected);
}

describe('states', function () {
  it('should identify the initial state', function() {
    test('initial');
  });

  it('should identify the final state', function() {
    test('final');
  });

  it('should identify the entry condition', function() {
    test('entry');
  });

  it('should identify the exit condition', function() {
    test('exit');
  });

  it('should identify the do activity', function() {
    test('do');
  });

  it('should handle state without activities', function() {
    test('simple-state');
  });

  it('should handle event with multiple from values', function () {
    test('from-array');
  });

  it('should handle event without to state', function () {
    test('event-without-to');
  });

  it('should handle conditional transition', function () {
    test('conditional');
  });
});

describe('activity handlers', function () {
  it('should identify handler name when anonymous function', function () {
    test('anonymous');
  });

  it('should identify handler name when function has name', function () {
    test('name');
  });

  it('should identify reference name', function () {
    test('reference');
  });

  it('should identify activities that do not have callbacks', function () {
    test('event-without-callbacks');
  });

  it('should identify activities with same name in two states', function () {
    test('activity-in-two-states');
  });
});

describe('es6', function() {
  it('with arrow functions', function () {
    test('arrow-functions');
  });
});

describe('customization', function() {
  it('with custom callback prefix', function () {
    test('callback-prefix');
  });
});
