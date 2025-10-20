const symbols = require('chemical-symbols');
const isFinite = require('lodash.isfinite');
const indexOf = require('lodash.indexof');

/**
 * Parse an integer string with strict validation.
 * Only accepts strings that represent valid integers.
 *
 * @param {string} value - The string to parse
 * @returns {number} The parsed integer, or NaN if invalid
 */
function strictParseInt(value) {
  if (/^(-|\+)?([0-9]+|Infinity)$/.test(value)) {
    return Number(value);
  }
  return Number.NaN;
}

/**
 * Get the atomic number for a chemical element symbol.
 *
 * @param {string} symbol - The chemical element symbol (e.g., 'H', 'He', 'Li')
 * @returns {number} The atomic number (1-based), or -1 if not found
 */
function getAtomicNumber(symbol) {
  const index = indexOf(symbols, symbol);
  return index > -1 ? index + 1 : -1;
}

/**
 * Parse a chemical formula and return element counts.
 *
 * Supports:
 * - Simple formulas: H2O, NaCl, C6H12O6
 * - Parentheses with multipliers: Ca(OH)2, Al2(SO4)3
 * - Nested parentheses: Mg3(Fe(CN)6)2
 *
 * The parser uses recursive descent to handle nested groups and properly
 * cascades multipliers from outer groups to inner elements.
 *
 * @param {string} formula - The chemical formula to parse
 * @returns {Object} Object with element symbols as keys and counts as values
 * @throws {Error} If formula is invalid or contains unknown elements
 *
 * @example
 * chemicalFormula('H2O')
 * // => {H: 2, O: 1}
 *
 * @example
 * chemicalFormula('Al2(SO4)3')
 * // => {Al: 2, S: 3, O: 12}
 */
function chemicalFormula(formula) {
  if (!formula || typeof formula !== 'string') {
    throw new Error('Invalid chemical formula');
  }

  const elements = {};

  /**
   * Add an element count to the elements object.
   * If the element already exists, add to its count.
   *
   * @param {string} element - The element symbol
   * @param {number} count - The count to add
   */
  function addElement(element, count) {
    elements[element] = (elements[element] || 0) + count;
  }

  /**
   * Recursively parse a group (formula or parenthetical content).
   *
   * This function processes the formula character by character, handling:
   * - Element symbols (single or double character)
   * - Subscripts (numbers following elements)
   * - Parentheses (grouping symbols)
   * - Nested structures (recursive calls for parenthetical content)
   *
   * The multiplier parameter cascades through recursive calls, ensuring
   * that subscripts inside parentheses are properly multiplied by the
   * parenthetical multiplier. For example, in Al2(SO4)3:
   * - The outer group has multiplier 1
   * - The SO4 group is parsed with multiplier 3
   * - Each element gets: elementSubscript * multiplier
   * - So O4 becomes: 4 * 3 = 12
   *
   * @param {string} str - The string to parse
   * @param {number} multiplier - The cumulative multiplier from parent groups
   */
  function parseGroup(str, multiplier) {
    if (typeof multiplier === 'undefined') {
      multiplier = 1;
    }

    let i = 0;

    while (i < str.length) {
      const char = str.charAt(i);

      if (char === '(') {
        // Find matching closing parenthesis using depth tracking
        // This handles nested parentheses like ((CN)6)2
        let depth = 1;
        let j = i + 1;
        while (j < str.length && depth > 0) {
          if (str.charAt(j) === '(') {
            depth++;
          }
          if (str.charAt(j) === ')') {
            depth--;
          }
          j++;
        }

        if (depth !== 0) {
          throw new Error('Unmatched parentheses in formula');
        }

        // Extract the content between parentheses
        const groupContent = str.substring(i + 1, j - 1);
        i = j;

        // Parse the multiplier after the closing parenthesis
        // e.g., (SO4)3 has multiplier 3
        let numStr = '';
        while (i < str.length && /\d/.test(str.charAt(i))) {
          numStr += str.charAt(i);
          i++;
        }

        const groupMultiplier = numStr.length ? strictParseInt(numStr) : 1;
        if (!isFinite(groupMultiplier) || groupMultiplier < 1) {
          throw new Error('Invalid subscript in formula');
        }

        // Recursively parse the group content with cascaded multiplier
        // This ensures subscripts inside are multiplied correctly
        parseGroup(groupContent, multiplier * groupMultiplier);
      } else if (/[A-Z]/.test(char)) {
        // Parse element symbol (starts with uppercase letter)
        let element = char;
        i++;

        // Check for lowercase letters (e.g., 'Ca', 'Br', 'Cl')
        while (i < str.length && /[a-z]/.test(str.charAt(i))) {
          element += str.charAt(i);
          i++;
        }

        // Validate that the element symbol exists in the periodic table
        if (getAtomicNumber(element) === -1) {
          throw new Error(`Unknown element: ${element}`);
        }

        // Parse the subscript number following the element
        let numStr = '';
        while (i < str.length && /\d/.test(str.charAt(i))) {
          numStr += str.charAt(i);
          i++;
        }

        const count = numStr.length ? strictParseInt(numStr) : 1;
        if (!isFinite(count) || count < 1) {
          throw new Error('Invalid subscript in formula');
        }

        // Add element with count multiplied by cascaded multiplier
        // This is where the multiplier from parent groups is applied
        addElement(element, count * multiplier);
      } else {
        throw new Error(`Invalid character in formula: ${char}`);
      }
    }
  }

  // Start parsing from the root level with multiplier 1
  parseGroup(formula);

  return elements;
}

module.exports = chemicalFormula;
