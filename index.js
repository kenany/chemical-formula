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

  // ret Formula object holds dictionary to be returned
  var ret = new Formula();

  // loop finds matching brackets. Contents are elaborated by multiplying with
  // multiplier. The bracket is replaced in original text
  while (true) {
    // find innermost MATCHING brackets. Exit loop if no matching brackets exist
    var found = formula.match(/[{][A-Za-z0-9]+[}]|[[][A-Za-z0-9]+[\]]|[(][A-Za-z0-9]+[)]/i);
    if (found === null) break;

  }
}

module.exports = chemicalFormula;
