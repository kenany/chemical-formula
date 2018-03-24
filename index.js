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
    // find the multiplier after formula. If not given, assume it's 1
    var multiplier = formula.slice(found.index + found[0].length).match(/^\d+/) || {'0': 1, length: 0};
    // get a list of all elements ["C12", "H12", "O6"] in current pair of matching brackets
    var allElements = found[0].match(/([A-Z][a-z]?)(\d*)/g);
    // if no elements matched, then bracket is invalid (e.g. "{5}" is invalid)
    if (allElements == null) throw new Error('Subscript found before element(s)');

  }
}

// Class definition for Formula object
function Formula(val, multiplier) {
  this.dict = {};
  if (val) {
    this.parseElement(val, multiplier);
  }
  return this;
}
Formula.prototype.parseElement = function(val, multiplier = 1) {
  // multiplies given value by the multiplier in the dict variable
  // slice(1) gets rid of "whole match" wchih is element 0.
  var currElem = val.match(/([A-Z][a-z]?)(\d*)/).slice(1);
  if (getAtomicNumber(currElem[0]) === -1) throw new Error('Invalid chemical element \'' + currElem[0] + '\'');
  var subscript = currElem[1] || 1;
  var newSum = parseFloat(subscript) * multiplier;
  this.dict[currElem[0]] = this.dict[currElem[0]] ? this.dict[currElem[0]] + newSum : newSum;
  return this.dict;
};
Formula.prototype.chemFormula = function() {
  // make string from dictionary (so {C: 2, H: 2} ==> "C2H2")
  var ret = '';
  for (var i in this.dict) ret += i + this.dict[i];
  return ret;
};

module.exports = chemicalFormula;
