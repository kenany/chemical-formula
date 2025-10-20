const test = require('tape');
const isFunction = require('lodash.isfunction');
const forEach = require('lodash.foreach');

const chemicalFormula = require('../');

test('exports a function', (t) => {
  t.plan(1);
  t.ok(isFunction(chemicalFormula));
});

test('common organic compounds', (t) => {
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
    ['H2O', { H: 2, O: 1 }, 'water'],
  ];

  t.plan(COMPOUNDS.length);

  forEach(COMPOUNDS, (fixture) => {
    t.deepEqual(chemicalFormula(fixture[0]), fixture[1], fixture[2]);
  });
});

test('nested subscripts in parentheses', (t) => {
  const COMPOUNDS = [
    // Metal sulfates - critical bug cases
    ['Al2(SO4)3', { Al: 2, S: 3, O: 12 }, 'aluminum sulfate'],
    ['Fe2(SO4)3', { Fe: 2, S: 3, O: 12 }, 'iron(III) sulfate'],
    ['Cr2(SO4)3', { Cr: 2, S: 3, O: 12 }, 'chromium(III) sulfate'],
    ['K2SO4', { K: 2, S: 1, O: 4 }, 'potassium sulfate (baseline - no parens)'],

    // Hydrated complexes - critical bug cases
    ['Fe(H2O)6', { Fe: 1, H: 12, O: 6 }, 'iron hexahydrate'],
    ['Co(H2O)6', { Co: 1, H: 12, O: 6 }, 'cobalt hexahydrate'],
    ['Cu(NH3)4', { Cu: 1, N: 4, H: 12 }, 'tetraamminecopper(II)'],
    ['Fe(CN)6', { Fe: 1, C: 6, N: 6 }, 'hexacyanoferrate'],

    // Hydroxides - common compounds
    ['Ca(OH)2', { Ca: 1, O: 2, H: 2 }, 'calcium hydroxide'],
    ['Mg(OH)2', { Mg: 1, O: 2, H: 2 }, 'magnesium hydroxide'],
    ['Al(OH)3', { Al: 1, O: 3, H: 3 }, 'aluminum hydroxide'],
    ['Ba(OH)2', { Ba: 1, O: 2, H: 2 }, 'barium hydroxide'],

    // Nitrates - common compounds
    ['Mg(NO3)2', { Mg: 1, N: 2, O: 6 }, 'magnesium nitrate'],
    ['Ca(NO3)2', { Ca: 1, N: 2, O: 6 }, 'calcium nitrate'],
    ['Ba(NO3)2', { Ba: 1, N: 2, O: 6 }, 'barium nitrate'],

    // Phosphates
    ['Ca3(PO4)2', { Ca: 3, P: 2, O: 8 }, 'calcium phosphate'],

    // Edge cases - parentheses without explicit multiplier
    // biome-ignore format: single line
    ['Fe(H2O)', { Fe: 1, H: 2, O: 1 }, 'iron hydrate (no multiplier defaults to 1)'],
    ['Ca(OH)', { Ca: 1, O: 1, H: 1 }, 'calcium hydroxyl (no multiplier)'],

    // Nested parentheses
    // biome-ignore format: single line
    ['Mg3(Fe(CN)6)2', { Mg: 3, Fe: 2, C: 12, N: 12 }, 'magnesium ferrocyanide (doubly nested)'],
  ];

  t.plan(COMPOUNDS.length);

  forEach(COMPOUNDS, (fixture) => {
    t.deepEqual(chemicalFormula(fixture[0]), fixture[1], fixture[2]);
  });
});

test('error handling for invalid formulas', (t) => {
  t.plan(5);

  t.throws(
    () => chemicalFormula('Ca(OH'),
    /Unmatched parentheses/,
    'unmatched opening parenthesis'
  );

  t.throws(
    () => chemicalFormula('CaOH)'),
    /Invalid character/,
    'unmatched closing parenthesis'
  );

  t.throws(
    () => chemicalFormula(''),
    /Invalid chemical formula/,
    'empty string'
  );

  t.throws(
    () => chemicalFormula('H2O!'),
    /Invalid character/,
    'invalid character at end'
  );

  t.throws(
    () => chemicalFormula('H2@O'),
    /Invalid character/,
    'invalid character in middle'
  );
});

test('invalid formulas', (t) => {
  const INVALID = [
    '0C',
    '2O',
    '13Li',
    '2(NO3)',
    'H(2)',
    'Ba(12)',
    'Cr(5)3',
    'Pb(13)2',
    'Au(22)11',
  ];

  t.plan(INVALID.length);

  forEach(INVALID, (fixture) => {
    t.throws(
      () => chemicalFormula(fixture),
      /Subscript found before element|Invalid character/,
      `should throw for ${fixture}`
    );
  });
});
