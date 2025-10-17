/**
 * Vision Engine Tests
 */

const { VisionEngine } = require('../services/visionEngine');

describe('VisionEngine', () => {
  describe('initialization', () => {
    test('should start at age-appropriate level', () => {
      const engine3yo = new VisionEngine(3, 4.0);
      const engine5yo = new VisionEngine(5, 4.0);
      
      expect(engine3yo.getNextTrial()).toBeDefined();
      expect(engine5yo.getNextTrial()).toBeDefined();
    });
  });

  describe('getNextTrial', () => {
    test('should return symbol and logMAR level', () => {
      const engine = new VisionEngine(4, 4.0);
      const trial = engine.getNextTrial();
      
      expect(trial).toHaveProperty('symbol');
      expect(trial).toHaveProperty('logmar');
      expect(['apple', 'house', 'circle', 'square', 'hand']).toContain(trial.symbol);
    });
  });

  describe('recordResponse - staircase behavior', () => {
    test('should decrease level on correct response', () => {
      const engine = new VisionEngine(4, 4.0);
      const initialLevel = engine.currentLevel;
      
      engine.recordResponse(true); // Correct
      
      expect(engine.currentLevel).toBeLessThanOrEqual(initialLevel);
    });

    test('should increase level on incorrect response', () => {
      const engine = new VisionEngine(4, 4.0);
      engine.currentLevel = 3; // Set to middle
      
      engine.recordResponse(false); // Incorrect
      
      expect(engine.currentLevel).toBeGreaterThan(3);
    });

    test('should track reversals', () => {
      const engine = new VisionEngine(4, 4.0);
      
      engine.recordResponse(true);
      engine.recordResponse(false); // Reversal
      
      expect(engine.reversals).toBe(1);
    });

    test('should stop after 4 reversals', () => {
      const engine = new VisionEngine(4, 4.0);
      
      for (let i = 0; i < 8; i++) {
        const done = engine.recordResponse(i % 2 === 0);
        if (done) {
          expect(engine.reversals).toBeGreaterThanOrEqual(4);
          break;
        }
      }
    });
  });

  describe('getEstimatedVA', () => {
    test('should return current level if < 6 responses', () => {
      const engine = new VisionEngine(4, 4.0);
      
      for (let i = 0; i < 5; i++) {
        engine.recordResponse(i % 2 === 0);
      }
      
      const va = engine.getEstimatedVA();
      expect(typeof va).toBe('number');
      expect(va).toBeGreaterThanOrEqual(0);
      expect(va).toBeLessThanOrEqual(1.0);
    });

    test('should average last 6 responses if >= 6', () => {
      const engine = new VisionEngine(4, 4.0);
      
      for (let i = 0; i < 8; i++) {
        engine.recordResponse(i % 2 === 0);
      }
      
      const va = engine.getEstimatedVA();
      expect(typeof va).toBe('number');
    });
  });
});
