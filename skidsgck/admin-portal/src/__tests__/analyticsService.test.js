import { describe, it, expect, beforeEach, vi } from 'vitest';
import AnalyticsService from '../services/analyticsService';

describe('AnalyticsService', () => {
  let analyticsService;
  let mockDB;

  beforeEach(() => {
    mockDB = {
      getAllScreenings: vi.fn(),
      getReferralCases: vi.fn(),
      getChild: vi.fn(),
    };
    analyticsService = new AnalyticsService(mockDB);
  });

  describe('getOverallStats', () => {
    it('should calculate correct stats', async () => {
      mockDB.getAllScreenings.mockResolvedValue([
        {
          child_id: 'S00001',
          vision_pass: 1,
          hearing_pass: 1,
          referral_needed: 0,
        },
        {
          child_id: 'S00002',
          vision_pass: 0,
          hearing_pass: 1,
          referral_needed: 1,
        },
        {
          child_id: 'S00003',
          vision_pass: 1,
          hearing_pass: 0,
          referral_needed: 1,
        },
      ]);

      const stats = await analyticsService.getOverallStats();

      expect(stats.totalScreened).toBe(3);
      expect(stats.visionScreened).toBe(3);
      expect(stats.hearingScreened).toBe(3);
      expect(stats.visionPassCount).toBe(2);
      expect(stats.visionReferCount).toBe(1);
      expect(stats.hearingPassCount).toBe(2);
      expect(stats.hearingReferCount).toBe(1);
      expect(stats.referralCount).toBe(2);
    });

    it('should handle empty data', async () => {
      mockDB.getAllScreenings.mockResolvedValue([]);

      const stats = await analyticsService.getOverallStats();

      expect(stats.totalScreened).toBe(0);
      expect(stats.visionPassRate).toBe(0);
      expect(stats.hearingPassRate).toBe(0);
    });

    it('should calculate pass rates correctly', async () => {
      mockDB.getAllScreenings.mockResolvedValue([
        { child_id: 'S00001', vision_pass: 1, hearing_pass: 1, referral_needed: 0 },
        { child_id: 'S00002', vision_pass: 1, hearing_pass: 1, referral_needed: 0 },
        { child_id: 'S00003', vision_pass: 0, hearing_pass: 1, referral_needed: 1 },
        { child_id: 'S00004', vision_pass: 0, hearing_pass: 0, referral_needed: 1 },
      ]);

      const stats = await analyticsService.getOverallStats();

      expect(stats.visionPassRate).toBe(50); // 2 pass, 2 refer
      expect(stats.hearingPassRate).toBe(75); // 3 pass, 1 refer
      expect(stats.referralRate).toBe(50); // 2 referrals, 4 total
    });
  });

  describe('getTrendAnalysis', () => {
    it('should group screenings by date', async () => {
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      mockDB.getAllScreenings.mockResolvedValue([
        {
          child_id: 'S00001',
          screening_date: today.toISOString().split('T')[0],
          vision_pass: 1,
          hearing_pass: 1,
          referral_needed: 0,
        },
        {
          child_id: 'S00002',
          screening_date: yesterday.toISOString().split('T')[0],
          vision_pass: 0,
          hearing_pass: 1,
          referral_needed: 1,
        },
      ]);

      const trend = await analyticsService.getTrendAnalysis(30);

      expect(trend.length).toBe(2);
      expect(trend[0].screened).toBeGreaterThan(0);
      expect(trend[0].date).toBeDefined();
    });

    it('should calculate daily statistics', async () => {
      const today = new Date().toISOString().split('T')[0];

      mockDB.getAllScreenings.mockResolvedValue([
        {
          child_id: 'S00001',
          screening_date: today,
          vision_pass: 1,
          hearing_pass: 1,
          referral_needed: 0,
        },
        {
          child_id: 'S00002',
          screening_date: today,
          vision_pass: 0,
          hearing_pass: 1,
          referral_needed: 1,
        },
      ]);

      const trend = await analyticsService.getTrendAnalysis(30);

      expect(trend.length).toBeGreaterThan(0);
      const dayStats = trend.find((t) => t.date === today);
      expect(dayStats.visionPass).toBe(1);
      expect(dayStats.visionRefer).toBe(1);
      expect(dayStats.referrals).toBe(1);
    });
  });

  describe('calculateAge', () => {
    it('should calculate age correctly', () => {
      const today = new Date();
      const fiveYearsAgo = new Date(today);
      fiveYearsAgo.setFullYear(fiveYearsAgo.getFullYear() - 5);

      const age = analyticsService.calculateAge(fiveYearsAgo.toISOString().split('T')[0]);
      expect(age).toBe(5);
    });

    it('should handle null DOB', () => {
      const age = analyticsService.calculateAge(null);
      expect(age).toBeNull();
    });
  });

  describe('getVisionDistribution', () => {
    it('should categorize vision results', async () => {
      mockDB.getAllScreenings.mockResolvedValue([
        { child_id: 'S00001', vision_logmar: 0.0, hearing_1000hz: 1, hearing_2000hz: 1, hearing_4000hz: 1 },
        { child_id: 'S00002', vision_logmar: 0.2, hearing_1000hz: 1, hearing_2000hz: 1, hearing_4000hz: 1 },
        { child_id: 'S00003', vision_logmar: 0.5, hearing_1000hz: 1, hearing_2000hz: 1, hearing_4000hz: 1 },
        { child_id: 'S00004', vision_logmar: 0.8, hearing_1000hz: 1, hearing_2000hz: 1, hearing_4000hz: 1 },
      ]);

      const dist = await analyticsService.getVisionDistribution();

      expect(dist.excellent).toBe(1);
      expect(dist.good).toBe(1);
      expect(dist.fair).toBe(1);
      expect(dist.poor).toBe(1);
    });
  });

  describe('getHearingDistribution', () => {
    it('should categorize hearing results', async () => {
      mockDB.getAllScreenings.mockResolvedValue([
        { child_id: 'S00001', hearing_1000hz: 1, hearing_2000hz: 1, hearing_4000hz: 1 },
        { child_id: 'S00002', hearing_1000hz: 0, hearing_2000hz: 1, hearing_4000hz: 1 },
        { child_id: 'S00003', hearing_1000hz: 0, hearing_2000hz: 0, hearing_4000hz: 1 },
      ]);

      const dist = await analyticsService.getHearingDistribution();

      expect(dist.allPass).toBe(1);
      expect(dist.oneFrequencyFail).toBe(1);
      expect(dist.multipleFrequencyFail).toBe(1);
    });
  });

  describe('generateReport', () => {
    it('should generate comprehensive report', async () => {
      mockDB.getAllScreenings.mockResolvedValue([
        { child_id: 'S00001', vision_pass: 1, hearing_pass: 1, referral_needed: 0 },
      ]);
      mockDB.getReferralCases.mockResolvedValue([]);

      const report = await analyticsService.generateReport();

      expect(report.generatedAt).toBeDefined();
      expect(report.overall).toBeDefined();
      expect(report.trend).toBeDefined();
      expect(report.bySchool).toBeDefined();
      expect(report.byGrade).toBeDefined();
      expect(report.referralCases).toBeDefined();
    });
  });
});
