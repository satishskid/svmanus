import React from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../core/database/database';
import { Box, Typography } from '@mui/material';
import { WHOStandards } from '../../core/calculations/zscore/WHOReferences';
import type { Indicator, Sex } from '../../core/calculations/zscore/WHOReferences';
import { useMemo } from 'react';
import type { MeasurementRecord } from '../../core/database/models/Measurement';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

interface GrowthChartProps {
  childId: string | null;
}

export const GrowthChart: React.FC<GrowthChartProps> = ({ childId }) => {
  const measurements = useLiveQuery(
    () => childId ? db.measurements.where('childId').equals(childId).sortBy('measurementDate') as Promise<MeasurementRecord[]> : [],
    [childId]
  );

  // Helper to extract percentile data from WHOStandards
  const getPercentileSeries = (
    indicator: Indicator,
    sex: Sex,
    percentileKey: string
  ): (number | undefined)[] => {
    const whoData = WHOStandards[indicator]?.[sex];
    if (!whoData) return [];
    return Object.values(whoData).map((row) => (row as unknown as Record<string, number | undefined>)[percentileKey]);
  };

  // Determine sex from first measurement (assumes all measurements for one child)
  // If not available, default to 'boys'
  const sex: Sex = measurements && measurements.length > 0 && (measurements[0] as { sex?: string }).sex === 'M' ? 'boys' : 'girls';

  // Chart configs for each indicator
  const chartConfigs = useMemo(() => ([
    {
      title: 'Height-for-Age',
      indicator: 'heightForAge' as Indicator,
      yLabel: 'Height (cm)',
      dataKey: (m: MeasurementRecord) => m.anthropometry.height?.value,
      percentiles: ['P3', 'P50', 'P97']
    },
    {
      title: 'Weight-for-Age',
      indicator: 'weightForAge' as Indicator,
      yLabel: 'Weight (kg)',
      dataKey: (m: MeasurementRecord) => m.anthropometry.weight?.value,
      percentiles: ['P3', 'P50', 'P97']
    },
    {
      title: 'Head Circumference-for-Age',
      indicator: 'headCircumference' as Indicator,
      yLabel: 'Head Circumference (cm)',
      dataKey: (m: MeasurementRecord) => m.anthropometry.headCircumference?.value,
      percentiles: ['P3', 'P50', 'P97']
    },
    {
      title: 'BMI-for-Age',
      indicator: 'bmiForAge' as Indicator,
      yLabel: 'BMI',
      dataKey: (m: MeasurementRecord) => m.calculatedIndicators.bmiz?.value,
      percentiles: ['P3', 'P50', 'P97']
    }
  ]), []);

  if (!childId) {
    return <Typography>Please select a child to view their growth chart.</Typography>;
  }

  return (
    <Box>
      {chartConfigs.map(config => {
        // Prepare chart data
        const labels = measurements?.map(m => new Date(m.measurementDate).toLocaleDateString()) || [];
        const childData = measurements?.map(config.dataKey) || [];
        const percentileSeries = config.percentiles.map(pKey => getPercentileSeries(config.indicator, sex, pKey).slice(0, labels.length));
        const datasets = [
          {
            label: `Child's ${config.yLabel}`,
            data: childData,
            borderColor: 'rgb(54, 162, 235)',
            backgroundColor: 'rgba(54, 162, 235, 0.5)',
            tension: 0.1,
          },
          ...config.percentiles.map((pKey, idx) => ({
            label: `${String(pKey).replace('P', '')}th Percentile`,
            data: percentileSeries[idx],
            borderColor: idx === 1 ? 'rgba(75, 192, 192, 0.5)' : 'rgba(255, 99, 132, 0.5)',
            borderDash: idx !== 1 ? [5, 5] : undefined,
            pointRadius: 0,
          }))
        ];
        const chartData = { labels, datasets };
        const options = {
          responsive: true,
          plugins: { legend: { position: 'top' as const } },
          title: { display: true, text: config.title },
          scales: {
            y: { title: { display: true, text: config.yLabel } },
            x: { title: { display: true, text: 'Measurement Date' } },
          },
        };
        return (
          <Box key={config.title} sx={{ mb: 4 }}>
            <Typography variant="h6" gutterBottom>{config.title}</Typography>
            {measurements && measurements.length > 0 ? (
              <Line options={options} data={chartData} />
            ) : (
              <Typography>No measurement data available for this child.</Typography>
            )}
          </Box>
        );
      })}
    </Box>
  );
};
