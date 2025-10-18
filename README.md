# chemical-formula

Parse a chemical formula to get a count of each element in a compound.

## Example

``` javascript
var chemicalFormula = require('chemical-formula');

// Simple formulas
chemicalFormula('H2O');
// => {H: 2, O: 1}

chemicalFormula('HOCH2CH2OH');
// => {H: 6, O: 2, C: 2}

// Parentheses with multipliers
chemicalFormula('Ca(OH)2');
// => {Ca: 1, O: 2, H: 2}

chemicalFormula('Al2(SO4)3');
// => {Al: 2, S: 3, O: 12}

chemicalFormula('Mg(NO3)2');
// => {Mg: 1, N: 2, O: 6}

// Nested parentheses
chemicalFormula('Mg3(Fe(CN)6)2');
// => {Mg: 3, Fe: 2, C: 12, N: 12}
```

## Installation

``` bash
$ npm install chemical-formula
```

## API

``` javascript
var chemicalFormula = require('chemical-formula');
```

### `chemicalFormula(formula)`

Parse _String_ `formula` and return an _Object_ whose keys are element symbols
and values are the quantities of each element in `formula`.
