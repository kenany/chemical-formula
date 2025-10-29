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

test('hydrate formulas with dot notation', (t) => {
  const HYDRATES = [
    // Basic hydrates with middle dot
    ['CuSO4·5H2O', { Cu: 1, S: 1, O: 9, H: 10 }, 'copper sulfate pentahydrate'],
    [
      'Na2CO3·10H2O',
      { Na: 2, C: 1, O: 13, H: 20 },
      'sodium carbonate decahydrate',
    ],
    ['CaCl2·2H2O', { Ca: 1, Cl: 2, O: 2, H: 4 }, 'calcium chloride dihydrate'],
    [
      'MgSO4·7H2O',
      { Mg: 1, S: 1, O: 11, H: 14 },
      'magnesium sulfate heptahydrate',
    ],
    ['FeSO4·7H2O', { Fe: 1, S: 1, O: 11, H: 14 }, 'iron sulfate heptahydrate'],
    ['ZnSO4·7H2O', { Zn: 1, S: 1, O: 11, H: 14 }, 'zinc sulfate heptahydrate'],
    [
      'CoCl2·6H2O',
      { Co: 1, Cl: 2, O: 6, H: 12 },
      'cobalt chloride hexahydrate',
    ],
    ['NiSO4·6H2O', { Ni: 1, S: 1, O: 10, H: 12 }, 'nickel sulfate hexahydrate'],

    // Basic hydrates with period
    [
      'CuSO4.5H2O',
      { Cu: 1, S: 1, O: 9, H: 10 },
      'copper sulfate with period notation',
    ],
    [
      'MgSO4.7H2O',
      { Mg: 1, S: 1, O: 11, H: 14 },
      'magnesium sulfate with period',
    ],

    // Hydrates without explicit multiplier (defaults to 1)
    ['CaCl2·H2O', { Ca: 1, Cl: 2, O: 1, H: 2 }, 'calcium chloride monohydrate'],
    ['LiCl·H2O', { Li: 1, Cl: 1, O: 1, H: 2 }, 'lithium chloride monohydrate'],
  ];

  t.plan(HYDRATES.length);

  forEach(HYDRATES, (fixture) => {
    t.deepEqual(chemicalFormula(fixture[0]), fixture[1], fixture[2]);
  });
});

test('complex hydrates with parentheses', (t) => {
  const COMPLEX_HYDRATES = [
    ['Ca(OH)2·8H2O', { Ca: 1, O: 10, H: 18 }, 'calcium hydroxide octahydrate'],
    [
      'Al2(SO4)3·18H2O',
      { Al: 2, S: 3, O: 30, H: 36 },
      'aluminum sulfate octadecahydrate',
    ],
    ['Cu(NO3)2·3H2O', { Cu: 1, N: 2, O: 9, H: 6 }, 'copper nitrate trihydrate'],
    [
      'Mg(NO3)2·6H2O',
      { Mg: 1, N: 2, O: 12, H: 12 },
      'magnesium nitrate hexahydrate',
    ],
    [
      'Ca(NO3)2·4H2O',
      { Ca: 1, N: 2, O: 10, H: 8 },
      'calcium nitrate tetrahydrate',
    ],
    ['Ba(OH)2·8H2O', { Ba: 1, O: 10, H: 18 }, 'barium hydroxide octahydrate'],
    [
      'Sr(OH)2·8H2O',
      { Sr: 1, O: 10, H: 18 },
      'strontium hydroxide octahydrate',
    ],
  ];

  t.plan(COMPLEX_HYDRATES.length);

  forEach(COMPLEX_HYDRATES, (fixture) => {
    t.deepEqual(chemicalFormula(fixture[0]), fixture[1], fixture[2]);
  });
});

test('hydrate edge cases', (t) => {
  const EDGE_CASES = [
    ['H2O·H2O', { H: 4, O: 2 }, 'water hydrate'],
    ['NaCl·2NaCl', { Na: 3, Cl: 3 }, 'sodium chloride with sodium chloride'],
    ['KBr·KBr', { K: 2, Br: 2 }, 'potassium bromide dimer'],
    [
      'Mg3(Fe(CN)6)2·6H2O',
      { Mg: 3, Fe: 2, C: 12, N: 12, H: 12, O: 6 },
      'doubly nested parentheses with hydrate',
    ],
  ];

  t.plan(EDGE_CASES.length);

  forEach(EDGE_CASES, (fixture) => {
    t.deepEqual(chemicalFormula(fixture[0]), fixture[1], fixture[2]);
  });
});

test('dots inside parentheses (multiplier cascades through scope)', (t) => {
  // Critical test suite: Validates that parentheses multipliers apply to dots inside them,
  // but dots at the same level don't cascade to each other.
  // This was the subject of a bug fix where scopeMultiplier parameter was added to parseGroup.
  const DOTS_IN_PARENS = [
    [
      '(NH3·H2O)2',
      { N: 2, H: 10, O: 2 },
      'outer multiplier applies to dotted contents',
    ],
    [
      '(CuSO4·5H2O)2',
      { Cu: 2, S: 2, O: 18, H: 20 },
      'bug case: outer multiplier on hydrate',
    ],
    ['((NH3·H2O)2)3', { N: 6, H: 30, O: 6 }, 'nested scope-on-scope'],
    [
      '(CuSO4·5H2O)2·2NH3',
      { Cu: 2, S: 2, O: 18, H: 26, N: 2 },
      'mixed scopes: parens then dot',
    ],
    [
      'CuSO4·(NH3)2·5H2O',
      { Cu: 1, S: 1, O: 9, H: 16, N: 2 },
      'parentheses between dots',
    ],
  ];

  t.plan(DOTS_IN_PARENS.length);

  forEach(DOTS_IN_PARENS, (fixture) => {
    t.deepEqual(chemicalFormula(fixture[0]), fixture[1], fixture[2]);
  });
});

test('multiple hydrate dots (sequential, not cascading)', (t) => {
  const MULTI_DOT = [
    [
      'CuSO4·5H2O·2NH3',
      { Cu: 1, S: 1, O: 9, H: 16, N: 2 },
      'multiple dots parse sequentially',
    ],
  ];

  t.plan(MULTI_DOT.length + 1);

  forEach(MULTI_DOT, (fixture) => {
    t.deepEqual(chemicalFormula(fixture[0]), fixture[1], fixture[2]);
  });

  // Negative assertion: sequential dots should NOT cascade like nested parens would
  const sequential = chemicalFormula('CuSO4·5H2O·2NH3'); // = CuSO4 + 5H2O + 2NH3
  const cascaded = { Cu: 1, S: 1, O: 9, H: 40, N: 10 }; // = CuSO4 + 5(H2O + 2NH3) - WRONG
  t.notDeepEqual(
    sequential,
    cascaded,
    'sequential dots must not cascade multipliers to peers'
  );
});

test('alternative dot characters and whitespace', (t) => {
  const NORMALIZATION = [
    [
      'CuSO4⋅5H2O⋅2NH3',
      { Cu: 1, S: 1, O: 9, H: 16, N: 2 },
      'U+22C5 dot operator',
    ],
    ['CuSO4•5H2O•2NH3', { Cu: 1, S: 1, O: 9, H: 16, N: 2 }, 'U+2022 bullet'],
    [
      'CuSO4 · 5H2O · 2NH3',
      { Cu: 1, S: 1, O: 9, H: 16, N: 2 },
      'whitespace around dots',
    ],
    ['Ca ( OH ) 2', { Ca: 1, O: 2, H: 2 }, 'whitespace everywhere'],
    ['NaCl ∙ H2O', { Na: 1, Cl: 1, H: 2, O: 1 }, 'bullet operator normalizes'],
    [
      'NaCl ・ H2O',
      { Na: 1, Cl: 1, H: 2, O: 1 },
      'katakana middle dot normalizes',
    ],
  ];

  t.plan(NORMALIZATION.length);

  forEach(NORMALIZATION, (fixture) => {
    t.deepEqual(chemicalFormula(fixture[0]), fixture[1], fixture[2]);
  });
});

test('edge cases for valid formulas', (t) => {
  const EDGE_CASES = [
    // Multiple dots inside parentheses
    [
      '(NH3·H2O·H2O)2',
      { N: 2, H: 14, O: 4 },
      'multiple dots inside parentheses',
    ],
    [
      '(NH3·H2O)2·H2O',
      { N: 2, H: 12, O: 3 },
      'parentheses with dot then trailing dot',
    ],

    // Implicit multiplier of 1 for hydrates
    [
      'CuSO4·H2O',
      { Cu: 1, S: 1, O: 5, H: 2 },
      'hydrate with implicit multiplier',
    ],
    ['H2O·NH3', { H: 5, O: 1, N: 1 }, 'simple hydrate implicit 1'],

    // Period notation with whitespace
    [
      'NaCl . H2O',
      { Na: 1, Cl: 1, H: 2, O: 1 },
      'period with spaces normalizes',
    ],

    // Large integer subscripts
    ['C123456789', { C: 123_456_789 }, 'large integer subscript'],

    // Complex mixed scopes
    [
      '(H2O·NH3·H2O)2·NH3',
      { H: 17, O: 4, N: 3 },
      'complex mixed scopes with cascading',
    ],

    // Parentheses between dots
    [
      'CuSO4·(NH3)2·5H2O',
      { Cu: 1, S: 1, O: 9, H: 16, N: 2 },
      'parentheses between dots',
    ],

    // Additional mixed scope tests
    [
      '(CuSO4·5H2O)2·2NH3',
      { Cu: 2, S: 2, O: 18, H: 26, N: 2 },
      'parentheses then dot',
    ],
    ['((NH3·H2O)2)3', { N: 6, H: 30, O: 6 }, 'nested scope-on-scope'],

    // Hydrate without multiplier followed by multiplier
    ['LiCl·H2O', { Li: 1, Cl: 1, O: 1, H: 2 }, 'lithium chloride monohydrate'],

    // Period and middot sequential
    [
      'CuSO4.5H2O·2NH3',
      { Cu: 1, S: 1, O: 9, H: 16, N: 2 },
      'period then middot',
    ],
    [
      'MgSO4·7H2O.2NH3',
      { Mg: 1, S: 1, O: 11, H: 20, N: 2 },
      'middot then period',
    ],
  ];

  t.plan(EDGE_CASES.length);

  forEach(EDGE_CASES, (fixture) => {
    t.deepEqual(chemicalFormula(fixture[0]), fixture[1], fixture[2]);
  });
});

test('hydrate error handling', (t) => {
  t.plan(2);

  t.throws(
    () => chemicalFormula('CaCl2·'),
    /Formula cannot end with a hydrate separator/,
    'dot at end without formula'
  );

  t.throws(
    () => chemicalFormula('CuSO4·0H2O'),
    /Invalid hydrate multiplier/,
    'zero multiplier'
  );
});

test('validation errors for malformed formulas', (t) => {
  const VALIDATION_ERRORS = [
    // Leading hydrate separators at top level
    [
      '·H2O',
      /Formula cannot start with a hydrate separator/,
      'leading middot at top level',
    ],
    [
      '.H2O',
      /Formula cannot start with a hydrate separator/,
      'leading period at top level',
    ],
    [
      '⋅H2O',
      /Formula cannot start with a hydrate separator/,
      'leading dot operator at top level',
    ],
    [
      '•H2O',
      /Formula cannot start with a hydrate separator/,
      'leading bullet at top level',
    ],
    [
      '∙H2O',
      /Formula cannot start with a hydrate separator/,
      'leading bullet operator at top level',
    ],
    [
      '・H2O',
      /Formula cannot start with a hydrate separator/,
      'leading katakana middle dot at top level',
    ],

    // Leading hydrate separators inside parentheses
    [
      '(·H2O)2',
      /Formula cannot start with a hydrate separator/,
      'leading middot inside parentheses',
    ],
    [
      '(.H2O)2',
      /Formula cannot start with a hydrate separator/,
      'leading period inside parentheses',
    ],
    [
      '(∙H2O)2',
      /Formula cannot start with a hydrate separator/,
      'leading bullet operator inside parentheses',
    ],
    [
      '(・H2O)2',
      /Formula cannot start with a hydrate separator/,
      'leading katakana middle dot inside parentheses',
    ],

    // Trailing hydrate separators
    [
      'CuSO4·',
      /Formula cannot end with a hydrate separator/,
      'trailing middot',
    ],
    [
      'CuSO4.',
      /Formula cannot end with a hydrate separator/,
      'trailing period',
    ],
    [
      'CuSO4⋅',
      /Formula cannot end with a hydrate separator/,
      'trailing dot operator',
    ],
    [
      'CuSO4•',
      /Formula cannot end with a hydrate separator/,
      'trailing bullet',
    ],
    [
      'CuSO4∙',
      /Formula cannot end with a hydrate separator/,
      'trailing bullet operator',
    ],
    [
      'CuSO4・',
      /Formula cannot end with a hydrate separator/,
      'trailing katakana middle dot',
    ],

    // Empty after dot inside parentheses
    [
      '(H2O·)2',
      /Empty hydrate formula after dot/,
      'trailing dot before closing paren',
    ],

    // Consecutive hydrate separators
    [
      'CuSO4··H2O',
      /Consecutive hydrate separators in formula/,
      'consecutive middots',
    ],
    [
      'CuSO4..H2O',
      /Consecutive hydrate separators in formula/,
      'consecutive periods',
    ],
    [
      'CuSO4⋅⋅H2O',
      /Consecutive hydrate separators in formula/,
      'consecutive dot operators',
    ],
    [
      'CuSO4∙∙H2O',
      /Consecutive hydrate separators in formula/,
      'consecutive bullet operators',
    ],
    [
      'CuSO4. ·H2O',
      /Consecutive hydrate separators in formula/,
      'period and middot with space',
    ],
    [
      'CuSO4∙・H2O',
      /Consecutive hydrate separators in formula/,
      'bullet operator and katakana middle dot',
    ],

    // Empty formulas
    ['', /Invalid chemical formula/, 'empty string'],
    ['   ', /Invalid chemical formula/, 'only whitespace'],
    ['·', /Formula cannot start with a hydrate separator/, 'only middot'],

    // Empty parentheses
    ['()', /Empty parentheses in formula/, 'empty parentheses'],
    [
      'Ca()2',
      /Empty parentheses in formula/,
      'empty parentheses with multiplier',
    ],

    // Zero and negative multipliers
    ['H0', /Invalid subscript/, 'zero subscript on element'],
    ['(OH)0', /Invalid subscript/, 'zero multiplier on group'],
    ['CuSO4·0H2O', /Invalid hydrate multiplier/, 'zero hydrate multiplier'],
    ['H-2O', /Invalid character/, 'negative subscript'],

    // Invalid elements
    ['Xy2', /Unknown element/, 'unknown element symbol'],
    ['H2Qz', /Unknown element/, 'unknown two-letter element'],
    ['Zz', /Unknown element/, 'completely invalid element'],

    // Unmatched parentheses
    ['Ca(OH', /Unmatched parentheses/, 'unclosed parenthesis'],
  ];

  t.plan(VALIDATION_ERRORS.length);

  forEach(VALIDATION_ERRORS, (fixture) => {
    t.throws(() => chemicalFormula(fixture[0]), fixture[1], fixture[2]);
  });
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
