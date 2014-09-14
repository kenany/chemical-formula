# chemical-formula

[![Build Status](https://img.shields.io/travis/KenanY/chemical-formula.svg)](https://travis-ci.org/KenanY/chemical-formula)
[![Dependency Status](https://img.shields.io/gemnasium/KenanY/chemical-formula.svg)](https://gemnasium.com/KenanY/chemical-formula)

Parse a chemical formula to get a count of each element in a compound.

## Example

``` javascript
var chemicalFormula = require('chemical-formula');

chemicalFormula('H2O');
// => {H: 2, O: 1}

chemicalFormula('HOCH2CH2OH');
// => {H: 6, O: 2, C: 2}
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