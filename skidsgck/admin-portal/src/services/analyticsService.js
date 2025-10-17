/**
 * Analytics Service
 * Compute screening metrics and statistics for dashboard
 * 
 * Metrics:
 * - Total screened children
 * - Pass/refer rates by modality (vision/hearing)
 * - Trend analysis
 * - School-level breakdowns
 */

class AnalyticsService {
  constructor(indexedDBService) {
    this.db = indexedDBService;
  }

  /**
   * Get overall statistics
   */
  async getOverallStats() {
    const allScreenings = await this.db.getAllScreenings();

    if (allScreenings.length === 0) {
      return {
        totalScreened: 0,
        visionPassCount: 0,
        visionReferCount: 0,
        visionPassRate: 0,
        hearingPassCount: 0,
        hearingReferCount: 0,
        hearingPassRate: 0,
        referralCount: 0,
        referralRate: 0,
      };
    }

    const uniqueChildren = new Set(allScreenings.map((s) => s.child_id)).size;

    const visionScreened = allScreenings.filter((s) => s.vision_pass !== null && s.vision_pass !== undefined);
    const hearingScreened = allScreenings.filter((s) => s.hearing_pass !== null && s.hearing_pass !== undefined);

    const visionPass = visionScreened.filter((s) => s.vision_pass === 1).length;
    const visionRefer = visionScreened.filter((s) => s.vision_pass === 0).length;

    const hearingPass = hearingScreened.filter((s) => s.hearing_pass === 1).length;
    const hearingRefer = hearingScreened.filter((s) => s.hearing_pass === 0).length;

    const referralCount = allScreenings.filter((s) => s.referral_needed === 1).length;

    return {
      totalScreened: uniqueChildren,
      totalScreenings: allScreenings.length,
      visionScreened: visionScreened.length,
      visionPassCount: visionPass,
      visionReferCount: visionRefer,
      visionPassRate: visionScreened.length > 0 ? Math.round((visionPass / visionScreened.length) * 100) : 0,
      hearingScreened: hearingScreened.length,
      hearingPassCount: hearingPass,
      hearingReferCount: hearingRefer,
      hearingPassRate: hearingScreened.length > 0 ? Math.round((hearingPass / hearingScreened.length) * 100) : 0,
      referralCount,
      referralRate: allScreenings.length > 0 ? Math.round((referralCount / allScreenings.length) * 100) : 0,
    };
  }

  /**
   * Get trend analysis over time
   */
  async getTrendAnalysis(days = 30) {
    const allScreenings = await this.db.getAllScreenings();
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    const recentScreenings = allScreenings.filter((s) => new Date(s.screening_date) >= cutoffDate);

    // Group by date
    const byDate = {};
    for (const screening of recentScreenings) {
      const date = screening.screening_date.split('T')[0];
      if (!byDate[date]) {
        byDate[date] = [];
      }
      byDate[date].push(screening);
    }

    // Compute daily stats
    const trend = Object.entries(byDate)
      .sort(([dateA], [dateB]) => dateA.localeCompare(dateB))
      .map(([date, screenings]) => ({
        date,
        screened: new Set(screenings.map((s) => s.child_id)).size,
        visionPass: screenings.filter((s) => s.vision_pass === 1).length,
        visionRefer: screenings.filter((s) => s.vision_pass === 0).length,
        hearingPass: screenings.filter((s) => s.hearing_pass === 1).length,
        hearingRefer: screenings.filter((s) => s.hearing_pass === 0).length,
        referrals: screenings.filter((s) => s.referral_needed === 1).length,
      }));

    return trend;
  }

  /**
   * Get referral cases with details
   */
  async getReferralCaseDetails() {
    const referralCases = await this.db.getReferralCases();
    const cases = [];

    for (const screening of referralCases) {
      const child = await this.db.getChild(screening.child_id);
      cases.push({
        childId: screening.child_id,
        name: child?.name || 'Unknown',
        age: this.calculateAge(child?.date_of_birth),
        screeningDate: screening.screening_date,
        visionLogMAR: screening.vision_logmar,
        visionPass: screening.vision_pass,
        hearingPass: screening.hearing_pass,
        referralReasons: screening.referral_reasons ? JSON.parse(screening.referral_reasons) : [],
        schoolCode: child?.school_code || 'Unknown',
      });
    }

    return cases.sort((a, b) => new Date(b.screeningDate) - new Date(a.screeningDate));
  }

  /**
   * Get statistics by school
   */
  async getStatsBySchool() {
    const allScreenings = await this.db.getAllScreenings();
    const schoolMap = {};

    // Group screenings by school
    for (const screening of allScreenings) {
      const child = await this.db.getChild(screening.child_id);
      const schoolCode = child?.school_code || 'Unknown';

      if (!schoolMap[schoolCode]) {
        schoolMap[schoolCode] = {
          schoolCode,
          screeningCount: 0,
          childrenCount: 0,
          children: new Set(),
          visionPass: 0,
          visionRefer: 0,
          hearingPass: 0,
          hearingRefer: 0,
          referrals: 0,
        };
      }

      schoolMap[schoolCode].screeningCount++;
      schoolMap[schoolCode].children.add(screening.child_id);

      if (screening.vision_pass === 1) {
        schoolMap[schoolCode].visionPass++;
      } else if (screening.vision_pass === 0) {
        schoolMap[schoolCode].visionRefer++;
      }

      if (screening.hearing_pass === 1) {
        schoolMap[schoolCode].hearingPass++;
      } else if (screening.hearing_pass === 0) {
        schoolMap[schoolCode].hearingRefer++;
      }

      if (screening.referral_needed === 1) {
        schoolMap[schoolCode].referrals++;
      }
    }

    // Convert to array and calculate rates
    const schools = Object.values(schoolMap).map((school) => ({
      schoolCode: school.schoolCode,
      childrenCount: school.children.size,
      screeningCount: school.screeningCount,
      visionPassRate:
        school.visionPass + school.visionRefer > 0
          ? Math.round((school.visionPass / (school.visionPass + school.visionRefer)) * 100)
          : 0,
      hearingPassRate:
        school.hearingPass + school.hearingRefer > 0
          ? Math.round((school.hearingPass / (school.hearingPass + school.hearingRefer)) * 100)
          : 0,
      referralRate:
        school.screeningCount > 0 ? Math.round((school.referrals / school.screeningCount) * 100) : 0,
    }));

    return schools.sort((a, b) => b.screeningCount - a.screeningCount);
  }

  /**
   * Get grade-level statistics
   */
  async getStatsByGrade() {
    const allScreenings = await this.db.getAllScreenings();
    const gradeMap = {};

    for (const screening of allScreenings) {
      const child = await this.db.getChild(screening.child_id);
      const grade = child?.grade_level || 'Unknown';

      if (!gradeMap[grade]) {
        gradeMap[grade] = {
          grade,
          screeningCount: 0,
          visionPass: 0,
          visionRefer: 0,
          hearingPass: 0,
          hearingRefer: 0,
          referrals: 0,
        };
      }

      gradeMap[grade].screeningCount++;

      if (screening.vision_pass === 1) {
        gradeMap[grade].visionPass++;
      } else if (screening.vision_pass === 0) {
        gradeMap[grade].visionRefer++;
      }

      if (screening.hearing_pass === 1) {
        gradeMap[grade].hearingPass++;
      } else if (screening.hearing_pass === 0) {
        gradeMap[grade].hearingRefer++;
      }

      if (screening.referral_needed === 1) {
        gradeMap[grade].referrals++;
      }
    }

    return Object.values(gradeMap).map((grade) => ({
      grade: grade.grade,
      screeningCount: grade.screeningCount,
      visionPassRate:
        grade.visionPass + grade.visionRefer > 0
          ? Math.round((grade.visionPass / (grade.visionPass + grade.visionRefer)) * 100)
          : 0,
      hearingPassRate:
        grade.hearingPass + grade.hearingRefer > 0
          ? Math.round((grade.hearingPass / (grade.hearingPass + grade.hearingRefer)) * 100)
          : 0,
    }));
  }

  /**
   * Get vision result distribution
   */
  async getVisionDistribution() {
    const allScreenings = await this.db.getAllScreenings();
    const visionScreenings = allScreenings.filter(
      (s) => s.vision_logmar !== null && s.vision_logmar !== undefined
    );

    if (visionScreenings.length === 0) {
      return {
        excellent: 0, // 0.0 logMAR
        good: 0, // 0.1-0.3
        fair: 0, // 0.4-0.6
        poor: 0, // 0.7+
      };
    }

    const distribution = {
      excellent: 0,
      good: 0,
      fair: 0,
      poor: 0,
    };

    for (const screening of visionScreenings) {
      const logMAR = screening.vision_logmar;
      if (logMAR <= 0.0) {
        distribution.excellent++;
      } else if (logMAR <= 0.3) {
        distribution.good++;
      } else if (logMAR <= 0.6) {
        distribution.fair++;
      } else {
        distribution.poor++;
      }
    }

    return distribution;
  }

  /**
   * Get hearing result distribution
   */
  async getHearingDistribution() {
    const allScreenings = await this.db.getAllScreenings();

    const distribution = {
      allPass: 0,
      oneFrequencyFail: 0,
      multipleFrequencyFail: 0,
    };

    for (const screening of allScreenings) {
      const frequencies = [screening.hearing_1000hz, screening.hearing_2000hz, screening.hearing_4000hz];
      const failCount = frequencies.filter((f) => f === 0).length;

      if (failCount === 0) {
        distribution.allPass++;
      } else if (failCount === 1) {
        distribution.oneFrequencyFail++;
      } else {
        distribution.multipleFrequencyFail++;
      }
    }

    return distribution;
  }

  /**
   * Calculate age from date of birth
   */
  calculateAge(dob) {
    if (!dob) return null;
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  }

  /**
   * Export analytics report
   */
  async generateReport() {
    const stats = await this.getOverallStats();
    const trend = await this.getTrendAnalysis();
    const bySchool = await this.getStatsBySchool();
    const byGrade = await this.getStatsByGrade();
    const referrals = await this.getReferralCaseDetails();

    return {
      generatedAt: new Date().toISOString(),
      overall: stats,
      trend,
      bySchool,
      byGrade,
      referralCases: referrals.slice(0, 20), // Top 20
    };
  }
}

export default AnalyticsService;
