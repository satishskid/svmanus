/**
 * Hearing Engine Tests
 */

const { HearingEngine } = require('../services/hearingEngine');

describe('HearingEngine', () => {
  describe('initialization', () => {
    test('should initialize with default headphone', () => {
      const engine = new HearingEngine();
      
      expect(engine.headphone).toBeDefined();
      expect(engine.frequencies).toEqual([1000, 2000, 4000]);
      expect(engine.intensityDBHL).toBe(30);
    });

    test('should initialize with specified headphone', () => {
      const engine = new HearingEngine('Apple EarPods (3.5mm)');
      
      expect(engine.headphone.sensitivity).toBe(100);
      expect(engine.headphone.freqResponse).toBeDefined();
    });
  });

  describe('playTone', () => {
    test('should resolve after delay', async () => {
      const engine = new HearingEngine();
      const start = Date.now();
      
      await engine.playTone(1000, 30);
      
      const elapsed = Date.now() - start;
      expect(elapsed).toBeGreaterThanOrEqual(1000);
    });
  });

  describe('runScreening', () => {
    test('should return results for all frequencies', async () => {
      const engine = new HearingEngine();
      const results = await engine.runScreening();
      
      expect(Object.keys(results)).toHaveLength(3);
      expect(results).toHaveProperty('1000_30dB');
      expect(results).toHaveProperty('2000_30dB');
      expect(results).toHaveProperty('4000_30dB');
    });

    test('should return boolean values', async () => {
      const engine = new HearingEngine();
      const results = await engine.runScreening();
      
      Object.values(results).forEach(value => {
        expect(typeof value).toBe('boolean');
      });
    });
  });
});
