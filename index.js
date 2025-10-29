const symbols = require('chemical-symbols');
const isFinite = require('lodash.isfinite');
const indexOf = require('lodash.indexof');

// Normalization patterns for input preprocessing
const DOT_CHARS_REGEX = /[\u22C5\u2022\u2219\u30FB]/g; // ⋅ (U+22C5), • (U+2022), ∙ (U+2219), ・ (U+30FB)
const WHITESPACE_REGEX = /(\s|\u200B|\u200C|\u200D|\uFEFF)+/g; // All whitespace including zero-width

// NOTE: Period (.) is currently accepted as a hydrate separator for convenience,
// but may conflict with decimal coefficients if that feature is added in the future.

/**
 * Parse an integer string with strict validation.
 * Only accepts strings that represent valid integers.
 *
 * @param {string} value - The string to parse
 * @returns {number} The parsed integer, or NaN if invalid
 */
function strictParseInt(value) {
  if (/^[-+]?\d+$/.test(value)) {
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
 * Normalize and validate a chemical formula string.
 *
 * Normalizes alternative dot characters and whitespace, then validates
 * for common structural errors. This function is called both at the top level
 * and for inner groups to catch malformed hydrate notation introduced by slicing.
 *
 * @param {string} input - The formula string to normalize and validate
 * @returns {string} The normalized formula string
 * @throws {Error} If the formula has structural errors
 */
function normalizeAndValidate(input) {
  // Normalize dot characters to middle dot (·)
  let normalized = input.replace(DOT_CHARS_REGEX, '\u00B7');

  // Remove all whitespace including zero-width characters
  normalized = normalized.replace(WHITESPACE_REGEX, '');

  // Validate structure
  if (!normalized.length) {
    throw new Error('Invalid chemical formula');
  }
  if (/^[·.]/.test(normalized)) {
    throw new Error('Formula cannot start with a hydrate separator');
  }
  if (/[·.]$/.test(normalized)) {
    throw new Error('Formula cannot end with a hydrate separator');
  }
  if (/[·.]{2,}/.test(normalized)) {
    throw new Error('Consecutive hydrate separators in formula');
  }

  return normalized;
}

/**
 * Parse a chemical formula and return element counts.
 *
 * Supports:
 * - Simple formulas: H2O, NaCl, C6H12O6
 * - Parentheses with multipliers: Ca(OH)2, Al2(SO4)3
 * - Nested parentheses: Mg3(Fe(CN)6)2
 * - Hydrate notation: CuSO4·5H2O, MgSO4.7H2O
 * - Multiple hydrates: CuSO4·5H2O·2NH3 (sequential, not cascading)
 * - Alternative dot characters: ⋅ (U+22C5), • (U+2022), ∙ (U+2219), ・ (U+30FB), . (period)
 * - Whitespace tolerance: formulas with spaces are normalized
 *
 * Scope and multiplier rules:
 * - Parentheses define scope. A multiplier on a scope applies to all contents.
 * - Dots are separators at the current scope and do not propagate multipliers to peers.
 * - Sequential dots at the same level: CuSO4·5H2O·2NH3 = CuSO4 + 5H2O + 2NH3
 * - Dots inside parentheses: (CuSO4·5H2O)2 = 2CuSO4 + 10H2O (outer multiplier applies)
 *
 * The parser uses recursive descent to handle nested groups and properly
 * cascades multipliers through scope boundaries (parentheses).
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
 *
 * @example
 * chemicalFormula('CuSO4·5H2O')
 * // => {Cu: 1, S: 1, O: 9, H: 10}
 *
 * @example
 * chemicalFormula('CuSO4·5H2O·2NH3')
 * // => {Cu: 1, S: 1, O: 9, H: 16, N: 2}
 *
 * @example
 * chemicalFormula('(CuSO4·5H2O)2')
 * // => {Cu: 2, S: 2, O: 18, H: 20}
 *
 * @example
 * chemicalFormula('((NH3·H2O)2)3')
 * // => {N: 6, H: 30, O: 6}
 * // Nested scope-on-scope: outer multiplier cascades through nested parentheses
 */
function chemicalFormula(formula) {
  if (!formula || typeof formula !== 'string') {
    throw new Error('Invalid chemical formula');
  }

  // Normalize and validate the top-level formula
  formula = normalizeAndValidate(formula);

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
   * @param {number} [scopeMultiplier] - The multiplier from parent scope (parentheses) only.
   *                                      Differs from multiplier when dots are encountered.
   *                                      Dots reset multiplier but preserve scopeMultiplier,
   *                                      preventing cascading across sequential hydrates while
   *                                      allowing nested parentheses to apply their multiplier.
   */
  function parseGroup(str, multiplier, scopeMultiplier) {
    // Key insight for hydrate notation:
    // - multiplier: cumulative from ALL parent scopes (resets at dots)
    // - scopeMultiplier: cumulative from PARENTHESES only (ignores dots)
    //
    // Examples:
    // - CuSO4·5H2O: After dot, multiplier=5, scopeMultiplier=1
    // - (CuSO4·5H2O)2: After dot, multiplier=10, scopeMultiplier=2
    // - CuSO4·5H2O·2NH3: Second dot gets multiplier=2, scopeMultiplier=1 (no cascade from first dot)

    if (typeof multiplier === 'undefined') {
      multiplier = 1;
    }
    if (typeof scopeMultiplier === 'undefined') {
      scopeMultiplier = multiplier;
    }

    let i = 0;

    while (i < str.length) {
      const char = str.charAt(i);

      if (char === '·' || char === '.') {
        // Handle hydrate dot notation (e.g., CuSO4·5H2O)
        i++; // Move past the dot

        // Parse the multiplier for the hydrate (e.g., "5" in "·5H2O")
        let numStr = '';
        while (i < str.length && /\d/.test(str.charAt(i))) {
          numStr += str.charAt(i);
          i++;
        }

        const hydrateMultiplier =
          numStr.length > 0 ? strictParseInt(numStr) : 1;
        if (!isFinite(hydrateMultiplier) || hydrateMultiplier < 1) {
          throw new Error('Invalid hydrate multiplier');
        }

        // Guard against empty formula after dot
        if (i >= str.length || str.charAt(i) === ')') {
          throw new Error('Empty hydrate formula after dot');
        }

        // Parse the rest as the hydrate formula
        // Recursive call with scopeMultiplier preserved:
        // - New multiplier: hydrateMultiplier * scopeMultiplier
        //   (applies parent parentheses, ignores previous dots)
        // - New scopeMultiplier: scopeMultiplier (unchanged)
        //   (so nested parentheses will cascade correctly)
        // Example: (CuSO4·5H2O)2 → H2O gets multiplier=5*2=10 because scopeMultiplier=2
        const hydrateFormula = str.substring(i);

        // Re-normalize to catch leading/trailing/consecutive hydrate separators introduced by slicing
        const normalizedHydrate = normalizeAndValidate(hydrateFormula);

        parseGroup(
          normalizedHydrate,
          hydrateMultiplier * scopeMultiplier,
          scopeMultiplier
        );

        // We've consumed the rest of the formula
        break;
      }
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

        // Check for empty parentheses
        if (groupContent.length === 0) {
          throw new Error('Empty parentheses in formula');
        }

        // Check for trailing dot before normalizing (more specific error message)
        if (/[·.]$/.test(groupContent)) {
          throw new Error('Empty hydrate formula after dot');
        }

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

        // Re-normalize to catch leading/trailing/consecutive hydrate separators introduced by slicing
        const normalizedGroup = normalizeAndValidate(groupContent);

        // Recursive call for parenthetical group:
        // - Both parameters get the new cascaded multiplier
        // - This ensures nested parentheses multiply correctly
        // - And nested dots have the correct scope to reference
        // Example: ((NH3·H2O)2)3 → inner call gets (mult=6, scope=6), outer gets (mult=3, scope=3)
        parseGroup(
          normalizedGroup,
          multiplier * groupMultiplier,
          multiplier * groupMultiplier
        );
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
