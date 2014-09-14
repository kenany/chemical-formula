var symbols = require('chemical-symbols');
var isFinite = require('lodash.isfinite');
var indexOf = require('lodash.indexof');

function strictParseInt(value) {
  if (/^(\-|\+)?([0-9]+|Infinity)$/.test(value)) {
    return Number(value);
  }
  return NaN;
}

function getAtomicNumber(symbol) {
  var index = indexOf(symbols, symbol)
  return index > -1
    ? index + 1
    : -1;
}

function chemicalFormula(formula) {
  var ret = {};
  var stack;

  for (var i = 0, length = formula.length; i < length;) {
    var lengthOfSymbol;

    // First assume two-character element symbol
    var atomicNumber = getAtomicNumber(formula.substring(i, i + 2));

    // Element's symbol is a single character
    if (atomicNumber === -1) {
      atomicNumber = getAtomicNumber(formula.charAt(i));
      lengthOfSymbol = 1;
    }
    else {
      lengthOfSymbol = 2;
    }

    // Valid symbol
    if (atomicNumber > -1) {
      stack = symbols[atomicNumber - 1];
      if (ret[stack]) {
        ret[stack]++;
      }
      else {
        ret[stack] = 1;
      }
    }
    else {
      var subscript = strictParseInt(formula.substring(i, i + 2));
      if (isFinite(subscript)) {
        ret[stack] += subscript - 1;
        lengthOfSymbol++;
      }
      else {
        subscript = strictParseInt(formula.charAt(i));
        if (isFinite(subscript)) {
          ret[stack] += subscript - 1;
        }
        else {
          ret[stack]++;
        }
      }
    }

    i += lengthOfSymbol;
  }

  return ret;
}

module.exports = chemicalFormula;