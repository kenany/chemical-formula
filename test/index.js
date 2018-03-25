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
    ['CH3CH(CH3)CH3', {C: 4, H: 10}, '2-methylpropene'],
    ['NH2CH(C4H5N2)COOH', {N: 3, H: 9, C: 6, O: 2}, 'histidine'],
    ['H2O', {H: 2, O: 1}, 'water'],
    ['B2H6', {B: 2, H: 6}, 'diborane'],
    ['C6H12O6', {C: 6, H: 12, O: 6}, 'glucose'],
    ['Mo(CO)6', {Mo: 1, C: 6, O: 6}, 'Molybdenum Hexacarbonyl'],
    ['Mg(OH)2', {Mg: 1, O: 2, H: 2}, 'magnesium hydroxide'],
    ['Fe(C5H5)2', {Fe: 1, C: 10, H: 10}, 'ferrocene'],
    ['(C5H5)Fe(CO)2CH3', {C: 8, H: 8, Fe: 1, O: 1}, 'cyclopentadienyliron dicarbonyl dimer'],
    ['Pd[P(C6H5)3]4', {Pd: 1, P: 4, C: 72, H: 60}, 'tetrakis(triphenylphosphine)palladium(0)'],
    ['K4[ON(SO3)2]2', {K: 4, O: 14, N: 2, S: 4}, 'Fremy\'s salt'],
    ['{[Co(NH3)4(OH)2]3Co}(SO4)3', {Co: 4, H: 42, N: 12, O: 18, S: 3}, 'hexol sulphate'],
    ['As2{Be4C5[BCo3(CO2)3]2}4Cu5', {As: 2, Be: 16, C: 44, B: 8, Co: 24, O: 48, Cu: 5}, 'Weird Molecule']
  ];

  t.plan(COMPOUNDS.length);

  forEach(COMPOUNDS, function(fixture) {
    t.deepEqual(chemicalFormula(fixture[0]), fixture[1], fixture[2]);
  });
});

test('invalid formulas', function(t) {
  var INVALID = [
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
