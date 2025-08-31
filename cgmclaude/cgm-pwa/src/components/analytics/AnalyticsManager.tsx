import React, { useEffect, useState } from 'react';
import { db } from '../../core/database/database';
import type { ChildRecord } from '../../core/database/models/Child';
import type { MeasurementRecord } from '../../core/database/models/Measurement';
import { Box, Typography, Chip, List, ListItem, CircularProgress } from '@mui/material';

interface AnalyticsManagerProps {
  childId: string;
}

// Simple risk scoring logic based on WHO indicators and medical history
function calculateRiskScore(child: ChildRecord, measurements: MeasurementRecord[]): { riskScore: number, interventions: string[], growthTrend: string } {
  let riskScore = 0;
  const interventions: string[] = [];
  let growthTrend: 'improving' | 'stable' | 'declining' = 'stable';

  if (!measurements || measurements.length === 0) return { riskScore, interventions, growthTrend };

  // Use last measurement for current status
  const last = measurements[measurements.length - 1];
  const prev = measurements.length > 1 ? measurements[measurements.length - 2] : undefined;

  // Risk based on Z-scores
  const { haz, waz, whz, bmiz, muacz, hcz } = last.calculatedIndicators;
  if (haz && haz.value < -2) { riskScore += 20; interventions.push('Monitor stunting'); }
  if (waz && waz.value < -2) { riskScore += 20; interventions.push('Monitor underweight'); }
  if (whz && whz.value < -2) { riskScore += 20; interventions.push('Monitor wasting'); }
  if (bmiz && bmiz.value < -2) { riskScore += 10; interventions.push('Assess nutrition'); }
  if (muacz && muacz.value < -2) { riskScore += 10; interventions.push('Assess MUAC'); }
  if (hcz && hcz.value < -2) { riskScore += 10; interventions.push('Monitor head circumference'); }

  // Medical history risk
  if (child.medicalHistory.previousMalnutrition) { riskScore += 10; interventions.push('Follow-up for previous malnutrition'); }
  if (child.medicalHistory.chronicConditions && child.medicalHistory.chronicConditions.length > 0) {
    riskScore += 10;
    interventions.push('Review chronic conditions');
  }

  // Growth trend
  if (prev) {
    if (last.anthropometry.height && prev.anthropometry.height && last.anthropometry.height.value < prev.anthropometry.height.value) {
      growthTrend = 'declining';
      riskScore += 10;
      interventions.push('Height decrease: investigate');
    }
    if (last.anthropometry.weight && prev.anthropometry.weight && last.anthropometry.weight.value < prev.anthropometry.weight.value) {
      growthTrend = 'declining';
      riskScore += 10;
      interventions.push('Weight decrease: investigate');
    }
  }

  // Bound risk score
  riskScore = Math.min(100, riskScore);

  return { riskScore, interventions, growthTrend };
}

export const AnalyticsManager: React.FC<AnalyticsManagerProps> = ({ childId }) => {
  const [child, setChild] = useState<ChildRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState<{ riskScore: number, interventions: string[], growthTrend: string }>({ riskScore: 0, interventions: [], growthTrend: 'stable' });

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      const c = await db.children.where('id').equals(childId).first();
      const ms = await db.measurements.where('childId').equals(childId).sortBy('measurementDate');
      setChild(c || null);
      if (c && ms) {
        const analyticsResult = calculateRiskScore(c, ms);
        setAnalytics(analyticsResult);
        // Persist analytics to child record using localId
        if (c.localId !== undefined) {
          const localIdNum = typeof c.localId === 'string' ? parseInt(c.localId, 10) : c.localId;
          await db.children.update(localIdNum, {
            analytics: {
              ...c.analytics,
              riskScore: analyticsResult.riskScore,
              interventionsNeeded: analyticsResult.interventions,
              growthTrend: analyticsResult.growthTrend as 'improving' | 'stable' | 'declining',
              lastVisitDate: ms.length > 0 ? ms[ms.length - 1].measurementDate : c.analytics.lastVisitDate,
              totalVisits: ms.length
            }
          });
        }
      }
      setLoading(false);
    }
    if (childId) fetchData();
  }, [childId]);

  if (loading) return <CircularProgress />;
  if (!child) return <Typography>No child found.</Typography>;

  return (
    <Box sx={{ p: 2, border: '1px solid #ccc', borderRadius: 2, mt: 2 }}>
      <Typography variant="h6">Analytics & Risk Assessment</Typography>
      <Typography>Risk Score: <Chip label={analytics.riskScore} color={analytics.riskScore > 50 ? 'error' : 'primary'} /></Typography>
      <Typography>Growth Trend: <Chip label={analytics.growthTrend} color={analytics.growthTrend === 'declining' ? 'error' : 'primary'} /></Typography>
      <Typography sx={{ mt: 2 }}>Suggested Interventions:</Typography>
      <List>
        {analytics.interventions.length > 0 ? analytics.interventions.map((i, idx) => (
          <ListItem key={idx}>{i}</ListItem>
        )) : <ListItem>No interventions needed.</ListItem>}
      </List>
    </Box>
  );
};
