'use strict';

const symbols = require('chemical-symbols');
const isFinite = require('lodash.isfinite');
const indexOf = require('lodash.indexof');
const forOwn = require('lodash.forown');

function strictParseInt(value) {
  if (/^(-|\+)?([0-9]+|Infinity)$/.test(value)) {
    return Number(value);
  }
  return NaN;
}

function getAtomicNumber(symbol) {
  const index = indexOf(symbols, symbol);
  return index > -1
    ? index + 1
    : -1;
}

function chemicalFormula(formula) {
  const ret = {};
  let stack;
  let molecule = '';
  let withinParenthesis = false;

  for (let i = 0, length = formula.length; i < length;) {
    if (formula.charAt(i) === '(') {
      withinParenthesis = true;
      stack = null;
      i++;
      continue;
    }
    else if (formula.charAt(i) === ')') {
      withinParenthesis = false;
      i++;
      continue;
    }

    let lengthOfSymbol;

    // First assume two-character element symbol
    let atomicNumber = getAtomicNumber(formula.substring(i, i + 2));

    // Element's symbol is a single character
    if (atomicNumber === -1) {
      atomicNumber = getAtomicNumber(formula.charAt(i));
      lengthOfSymbol = 1;
    }
    else {
      lengthOfSymbol = 2;
    }

    let mol;

    // Valid symbol
    if (atomicNumber > -1) {
      if (i > 0 && formula.charAt(i - 1) === ')') {
        mol = chemicalFormula(molecule);
        forOwn(mol, function(count, key) {
          if (ret[key]) {
            ret[key] += count;
          }
          else {
            ret[key] = count;
          }
        });
        molecule = '';
      }

      stack = symbols[atomicNumber - 1];
      if (!withinParenthesis) {
        if (ret[stack]) {
          ret[stack]++;
        }
        else {
          ret[stack] = 1;
        }
      }
      else {
        molecule += stack;
      }
    }
    else {
      let subscript = strictParseInt(formula.substring(i, i + 2));
      if (isFinite(subscript)) {
        if (!stack) {
          throw new Error('Subscript found before element(s)');
        }

        if (!withinParenthesis && molecule !== '') {
          mol = chemicalFormula(molecule);
          forOwn(mol, function(count, key) {
            if (ret[key]) {
              ret[key] += count * subscript;
            }
            else {
              ret[key] = count * subscript;
            }
          });
          molecule = '';
        }
        else {
          ret[stack] += subscript - 1;
          lengthOfSymbol++;
        }
      }
      else {
        subscript = strictParseInt(formula.charAt(i));
        if (isFinite(subscript)) {
          if (!stack) {
            throw new Error('Subscript found before element(s)');
          }

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
