/**
 * Pure SRS Ease Factor calculation.
 * Extracted from SQL logic in UserWordProgress UPDATE statements.
 */

const MIN_EASE_FACTOR = 1.30;
const MAX_EASE_FACTOR = 3.00;
const DEFAULT_EASE_FACTOR = 2.50;

/**
 * Calculate new ease factor based on review rating.
 * @param {number} currentEF - Current ease factor (default 2.50)
 * @param {'Again'|'Hard'|'Good'|'Easy'} rating - User's self-assessment
 * @returns {number} New ease factor, clamped between 1.30 and 3.00
 */
function calculateEaseFactor(currentEF, rating) {
  const ef = currentEF ?? DEFAULT_EASE_FACTOR;
  switch (rating) {
    case 'Again': return Math.max(MIN_EASE_FACTOR, ef - 0.20);
    case 'Hard':  return Math.max(MIN_EASE_FACTOR, ef - 0.05);
    case 'Good':  return Math.min(MAX_EASE_FACTOR, ef + 0.05);
    case 'Easy':  return Math.min(MAX_EASE_FACTOR, ef + 0.15);
    default:       return ef;
  }
}

module.exports = { calculateEaseFactor, MIN_EASE_FACTOR, MAX_EASE_FACTOR, DEFAULT_EASE_FACTOR };
