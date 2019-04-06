---
status: approved
---

# Transition from esprima to babeljs

## Context

Babel is much better maintained and the ecosystem is well developed comparing with esprima. Esprima does not get the attention it used to get.

## Decision

Remain with esprima for now as time constraints prevent migrating the transforming logic to babel.

## Consequences

Client applications using fsm2dot have to transform the source to a level that is processable by esprima.
