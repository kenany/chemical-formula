var chemicalFormula = require('../');
var test = require('tape');
var isFunction = require('lodash.isfunction');
var forEach = require('lodash.foreach');

test('exports a function', function(t) {
  t.plan(1);
  t.ok(isFunction(chemicalFormula));
});

test('common organic compounds', function(t) {
  var COMPOUNDS = [
    ['C19H29COOH', {C: 20, H: 30, O: 2}, 'abietic acid'],
    ['C12H10', {C: 12, H: 10}, 'acenaphthene'],
    ['C12H6O2', {C: 12, H: 6, O: 2}, 'acenaphthoquinone'],
    ['C6H5Br', {C: 6, H: 5, Br: 1}, 'bromobenzene'],
    ['C3H4OH(COOH)3', {C: 6, H: 8, O: 7}, 'citric acid'],
    ['HOCH2CH2OH', {H: 6, O: 2, C: 2}, 'ethylene glycol'],
    ['C5H11NO2', {C: 5, H: 11, N: 1, O: 2}, 'ethylene glycol'],
    ['H2O', {H: 2, O: 1}, 'water']
  ]

  t.plan(COMPOUNDS.length);

  forEach(COMPOUNDS, function(fixture) {
    t.deepEqual(chemicalFormula(fixture[0]), fixture[1], fixture[2]);
  });
});