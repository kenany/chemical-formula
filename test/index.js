const test = require('tape');
const isFunction = require('lodash.isfunction');
const forEach = require('lodash.foreach');

const chemicalFormula = require('../');

test('exports a function', function(t) {
  t.plan(1);
  t.ok(isFunction(chemicalFormula));
});

test('common organic compounds', function(t) {
  const COMPOUNDS = [
    ['C19H29COOH', { C: 20, H: 30, O: 2 }, 'abietic acid'],
    ['C12H10', { C: 12, H: 10 }, 'acenaphthene'],
    ['C12H6O2', { C: 12, H: 6, O: 2 }, 'acenaphthoquinone'],
    ['C6H5Br', { C: 6, H: 5, Br: 1 }, 'bromobenzene'],
    ['C3H4OH(COOH)3', { C: 6, H: 8, O: 7 }, 'citric acid'],
    ['HOCH2CH2OH', { H: 6, O: 2, C: 2 }, 'ethylene glycol'],
    ['C5H11NO2', { C: 5, H: 11, N: 1, O: 2 }, 'ethylene glycol'],
    ['CH3CH(CH3)CH3', { C: 4, H: 10 }, '2-methylpropene'],
    ['NH2CH(C4H5N2)COOH', { N: 3, H: 9, C: 6, O: 2 }, 'histidine'],
    ['H2O', { H: 2, O: 1 }, 'water']
  ];

  t.plan(COMPOUNDS.length);

  forEach(COMPOUNDS, function(fixture) {
    t.deepEqual(chemicalFormula(fixture[0]), fixture[1], fixture[2]);
  });
});

test('invalid formulas', function(t) {
  const INVALID = [
    '0C',
    '2O',
    '13Li',
    '2(NO3)',
    'H(2)',
    'Ba(12)',
    'Cr(5)3',
    'Pb(13)2',
    'Au(22)11'
  ];

  t.plan(INVALID.length);

  forEach(INVALID, function(fixture) {
    t.throws(function() {
      chemicalFormula(fixture);
    }, /Subscript found before element/);
  });
});
