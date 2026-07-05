/**
 * Pure SRS Next Review Date calculation.
 * Extracted from SQL logic in UserWordProgress UPDATE statements.
 * All functions return the interval in milliseconds or a Date object.
 */

const INTERVALS = Object.freeze({
  again: { minutes: 10 },
  hard:  { days: 1 },
  good:  { days: 1 },      // Based on MasteryLevel below
  easy:  { days: 3 },      // Based on MasteryLevel below
});

/**
 * Get review interval in days based on MasteryLevel.
 * Higher mastery = longer interval before next review.
 *
 * @param {number} masteryLevel - Current mastery level (0-10)
 * @param {boolean} isEasy - Whether the rating was 'Easy'
 * @returns {number} Number of days until next review
 */
function getIntervalDays(masteryLevel, isEasy = false) {
  const ml = masteryLevel ?? 0;
  if (ml >= 8) return isEasy ? 30 : 14;
  if (ml >= 5) return isEasy ? 14 : 7;
  if (ml >= 2) return isEasy ? 7 : 3;
  return isEasy ? 3 : 1;
}

/**
 * Calculate next review date based on rating and mastery level.
 * @param {'Again'|'Hard'|'Good'|'Easy'} rating - User's self-assessment
 * @param {number} masteryLevel - Current mastery level (0-10)
 * @param {Date} [now=new Date()] - Reference date
 * @returns {Date} Next review date
 */
function calculateNextReview(rating, masteryLevel, now = new Date()) {
  const base = new Date(now);
  switch (rating) {
    case 'Again':
      return new Date(base.getTime() + 10 * 60 * 1000); // +10 minutes
    case 'Hard':
      return new Date(base.getTime() + 1 * 24 * 60 * 60 * 1000); // +1 day
    case 'Easy': {
      const days = getIntervalDays(masteryLevel, true);
      return new Date(base.getTime() + days * 24 * 60 * 60 * 1000);
    }
    case 'Good':
    default: {
      const days = getIntervalDays(masteryLevel, false);
      return new Date(base.getTime() + days * 24 * 60 * 60 * 1000);
    }
  }
}

module.exports = { calculateNextReview, getIntervalDays, INTERVALS };
