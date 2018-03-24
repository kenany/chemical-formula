var indexOf = require('lodash.indexof');
var symbols = require('chemical-symbols');

function getAtomicNumber(symbol) {
  var index = indexOf(symbols, symbol);
  return index > -1
    ? index + 1
    : -1;
}

function chemicalFormula(formula) {
  // This function takes a formula eg C6H12[C2H4]2O5 and converts it to dictionary
  // of individual elements.

  // Basic validation of formula (check for non alphanumeric+bracket characters)
  if (formula.match(/[^A-Za-z0-9{}[\]()]/g) || formula.match(/[a-z]{2,}/) || formula.match(/^\d/)) {
    throw new Error('Subscript found before element(s)');
  }
  return formula;

}

module.exports = chemicalFormula;
