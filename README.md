# chemical-formula

Parse a chemical formula to get a count of each element in a compound.

## Example

```javascript
const chemicalFormula = require("chemical-formula");

// Simple formulas
chemicalFormula("H2O");
// => {H: 2, O: 1}

chemicalFormula("HOCH2CH2OH");
// => {H: 6, O: 2, C: 2}

// Parentheses with multipliers
chemicalFormula("Ca(OH)2");
// => {Ca: 1, O: 2, H: 2}

chemicalFormula("Al2(SO4)3");
// => {Al: 2, S: 3, O: 12}

chemicalFormula("Mg(NO3)2");
// => {Mg: 1, N: 2, O: 6}

// Nested parentheses
chemicalFormula("Mg3(Fe(CN)6)2");
// => {Mg: 3, Fe: 2, C: 12, N: 12}

// Hydrates with dot notation
chemicalFormula('CuSO4·5H2O');
// => {Cu: 1, S: 1, O: 9, H: 10}

chemicalFormula('CaCl2·2H2O');
// => {Ca: 1, Cl: 2, O: 2, H: 4}

// Period notation also supported
chemicalFormula('MgSO4.7H2O');
// => {Mg: 1, S: 1, O: 11, H: 14}

// Complex hydrates with parentheses
chemicalFormula('Al2(SO4)3·18H2O');
// => {Al: 2, S: 3, O: 30, H: 36}

// Multiple hydrates (sequential, not cascading)
chemicalFormula('CuSO4·5H2O·2NH3');
// => {Cu: 1, S: 1, O: 9, H: 16, N: 2}
// Note: Each dot resets multiplier context (5H2O + 2NH3, not 5(H2O + 2NH3))
```

## Installation

```bash
$ npm install chemical-formula
```

## Hydrate Notation

Use middle dot (·, U+00B7) for hydrate formulas like `CuSO4·5H2O`.
Period (`.`) is accepted for convenience (e.g., `MgSO4.7H2O`), but `·` is preferred.

**Requirements:**
- Multipliers must be positive integers
- Decimals and fractions are not yet supported
- Dots must have content on both sides (no leading/trailing/consecutive dots)
- Very large integers are supported (tested up to 123456789)

Note: Future support for decimal coefficients may affect period interpretation.

## API

```javascript
const chemicalFormula = require("chemical-formula");
```

### `chemicalFormula(formula)`

Parse _String_ `formula` and return an _Object_ whose keys are element symbols
and values are the quantities of each element in `formula`.
