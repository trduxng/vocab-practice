/**
 * Pure SRS Mastery Level and Memory Status calculations.
 * Extracted from SQL MERGE logic in UserWordProgress.
 */

const MAX_MASTERY = 10;
const MEMORY_STATUS = Object.freeze({
  LAPSED: 'Lapsed',
  LEARNING: 'Learning',
  REVIEWING: 'Reviewing',
  MASTERED: 'Mastered',
});

/**
 * Calculate new mastery level based on correctness.
 * @param {number} currentLevel - Current mastery level (0-10)
 * @param {boolean} isCorrect - Whether the answer was correct
 * @returns {number} New mastery level, clamped between 0 and 10
 */
function calculateMasteryLevel(currentLevel, isCorrect) {
  const cl = currentLevel ?? 0;
  if (isCorrect && cl < MAX_MASTERY) return cl + 1;
  if (!isCorrect && cl > 0) return cl - 1;
  return cl;
}

/**
 * Determine memory status based on correctness, mastery level, and repetition count.
 * @param {boolean} isCorrect - Whether the answer was correct
 * @param {number} masteryLevel - Current mastery level (0-10)
 * @param {number} [repetitionCount=0] - Number of times reviewed
 * @returns {'Lapsed'|'Learning'|'Reviewing'|'Mastered'}
 */
function determineMemoryStatus(isCorrect, masteryLevel, repetitionCount = 0) {
  if (!isCorrect) return MEMORY_STATUS.LAPSED;
  if (masteryLevel >= 7) return MEMORY_STATUS.MASTERED;
  if (masteryLevel >= 2) return MEMORY_STATUS.REVIEWING;
  return MEMORY_STATUS.LEARNING;
}

module.exports = { calculateMasteryLevel, determineMemoryStatus, MAX_MASTERY, MEMORY_STATUS };
