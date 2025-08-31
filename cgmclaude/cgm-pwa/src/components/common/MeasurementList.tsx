import React from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../core/database/database';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Box
} from '@mui/material';
import { AnalyticsManager } from '../analytics/AnalyticsManager';

interface MeasurementListProps {
  childId: string | null;
}

export const MeasurementList: React.FC<MeasurementListProps> = ({ childId }) => {
  const measurements = useLiveQuery(
    () => childId ? db.measurements.where('childId').equals(childId).sortBy('measurementDate') : [],
    [childId]
  );

  if (!childId) {
    return null; // Don't display anything if no child is selected
  }

  return (
    <Box sx={{ my: 2 }}>
      <Typography variant="h6" gutterBottom>Measurement History</Typography>
      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }} aria-label="measurement history table">
          <TableHead>
            <TableRow>
              <TableCell>Date</TableCell>
              <TableCell align="right">Age (days)</TableCell>
              <TableCell align="right">Weight (kg)</TableCell>
              <TableCell align="right">Height (cm)</TableCell>
              <TableCell align="right">HC (cm)</TableCell>
              <TableCell align="right">WAZ</TableCell>
              <TableCell align="right">HAZ</TableCell>
              <TableCell align="right">WHZ</TableCell>
              <TableCell align="right">HCZ</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {measurements && measurements.length > 0 ? (
              measurements.map((m, index) => (
                <TableRow key={index}>
                  <TableCell component="th" scope="row">
                    {new Date(m.measurementDate).toLocaleDateString()}
                  </TableCell>
                  <TableCell align="right">{m.ageInDays}</TableCell>
                  <TableCell align="right">{m.anthropometry.weight?.value.toFixed(2) || 'N/A'}</TableCell>
                  <TableCell align="right">{m.anthropometry.height?.value.toFixed(2) || 'N/A'}</TableCell>
                  <TableCell align="right">{m.anthropometry.headCircumference?.value.toFixed(2) || 'N/A'}</TableCell>
                  <TableCell align="right">{m.calculatedIndicators.waz?.value.toFixed(2) || 'N/A'}</TableCell>
                  <TableCell align="right">{m.calculatedIndicators.haz?.value.toFixed(2) || 'N/A'}</TableCell>
                  <TableCell align="right">{m.calculatedIndicators.whz?.value.toFixed(2) || 'N/A'}</TableCell>
                  <TableCell align="right">{m.calculatedIndicators.hcz?.value.toFixed(2) || 'N/A'}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={9}>No measurements found for this child.</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
      {/* Show analytics below measurement table */}
      {childId && <AnalyticsManager childId={childId} />}
    </Box>
  );
};
