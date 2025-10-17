/**
 * Pediatric Visual Acuity Estimator (logMAR)
 * Implements 1-down/1-up staircase with crowding (placeholder)
 */

const LOGMAR_LEVELS = [0.0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0];
const SYMBOLS = ['apple', 'house', 'circle', 'square', 'hand'];

class VisionEngine {
  constructor(age, distanceM) {
    this.age = age;
    this.distance = distanceM;
    this.currentLevel = this._getStartingLevelIndex(age);
    this.reversals = 0;
    this.lastResponse = null;
    this.thresholdTrials = 0;
    this.responses = [];
  }

  _getStartingLevelIndex(age) {
    // Map age to starting logMAR value, then convert to index
    const targetValue = age <= 3 ? 0.7 : age <= 4 ? 0.5 : 0.3;
    const idx = LOGMAR_LEVELS.indexOf(targetValue);
    return idx >= 0 ? idx : 3; // fallback to 0.3 index
  }

  getNextTrial() {
    const symbol = SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)];
    const logmar = LOGMAR_LEVELS[this.currentLevel];
    return { symbol, logmar };
  }

  recordResponse(isCorrect) {
    this.responses.push({ level: this.currentLevel, correct: isCorrect });

    if (this.lastResponse !== null && this.lastResponse !== isCorrect) {
      this.reversals++;
    }

    if (isCorrect && this.currentLevel > 0) this.currentLevel--;
    else if (!isCorrect && this.currentLevel < LOGMAR_LEVELS.length - 1) this.currentLevel++;

    this.lastResponse = isCorrect;
    this.thresholdTrials++;

    return this.reversals >= 4 || this.thresholdTrials >= 20;
  }

  getEstimatedVA() {
    if (this.responses.length < 6) return LOGMAR_LEVELS[this.currentLevel];
    const lastSix = this.responses.slice(-6);
    const avg =
      lastSix.reduce((sum, r) => sum + LOGMAR_LEVELS[r.level], 0) / lastSix.length;
    return Math.round(avg * 10) / 10;
  }
}

module.exports = { VisionEngine };