import React, { useState } from 'react';
import { db } from '../../core/database/database';
import type { MeasurementRecord } from '../../core/database/models/Measurement';
import { AdvancedZScoreCalculator } from '../../core/calculations/zscore/ZScoreCalculator';
import { TextField, Button, Box, Typography } from '@mui/material';

export const ManualMeasurementEntry: React.FC = () => {
  const [childId, setChildId] = useState(''); // To associate measurement with a child
  const [formData, setFormData] = useState({
    height: '',
    weight: '',
    muac: '',
    headCircumference: '',
    length: '' // Added for WFL calculation
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const validateMeasurement = async (currentMeasurement: typeof formData, childId: string): Promise<string[]> => {
    const warnings: string[] = [];

    // Biologically Plausible Ranges (very broad for infants/toddlers)
    const height = parseFloat(currentMeasurement.height);
    const weight = parseFloat(currentMeasurement.weight);
    const headCircumference = parseFloat(currentMeasurement.headCircumference);
    const length = parseFloat(currentMeasurement.length);

    if (height && (height < 20 || height > 150)) warnings.push("Height seems implausible (expected 20-150 cm).");
    if (weight && (weight < 0.5 || weight > 30)) warnings.push("Weight seems implausible (expected 0.5-30 kg).");
    if (headCircumference && (headCircumference < 25 || headCircumference > 60)) warnings.push("Head Circumference seems implausible (expected 25-60 cm).");
    if (length && (length < 20 || length > 150)) warnings.push("Length seems implausible (expected 20-150 cm).");


    // Growth Velocity Check (simple version)
    const previousMeasurements = await db.measurements.where('childId').equals(childId).sortBy('measurementDate');
    if (previousMeasurements.length > 0) {
      const lastMeasurement = previousMeasurements[previousMeasurements.length - 1];

      if (height && lastMeasurement.anthropometry.height?.value && height < lastMeasurement.anthropometry.height.value) {
        warnings.push("Height has decreased since last measurement.");
      }
      if (weight && lastMeasurement.anthropometry.weight?.value && weight < lastMeasurement.anthropometry.weight.value) {
        warnings.push("Weight has decreased since last measurement.");
      }
    }

    return warnings;
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!childId) {
      alert('Please enter a Child ID (use the UUID from the list above) to save measurements.');
      return;
    }

    try {
      const child = await db.children.where('id').equals(childId).first();
      if (!child) {
        alert('Child not found! Please provide a valid UUID from the list.');
        return;
      }

      const warnings = await validateMeasurement(formData, child.id);
      if (warnings.length > 0) {
        const confirmSave = window.confirm(
          "The following issues were detected:\n\n" +
          warnings.join("\n") + 
          "\n\nDo you still want to save this measurement?"
        );
        if (!confirmSave) {
          return; // User cancelled
        }
      }


      const measurementDate = new Date();
      const ageInDays = Math.round((measurementDate.getTime() - new Date(child.dateOfBirth).getTime()) / (1000 * 60 * 60 * 24));

      const calculator = new AdvancedZScoreCalculator();
      const calculatedIndicators: MeasurementRecord['calculatedIndicators'] = {
        haz: { value: 0, percentile: 0, status: 'not-calculated' },
        waz: { value: 0, percentile: 0, status: 'not-calculated' },
        whz: { value: 0, percentile: 0, status: 'not-calculated' },
        bmiz: { value: 0, percentile: 0, status: 'not-calculated' },
        muacz: { value: 0, percentile: 0, status: 'not-calculated' },
        hcz: { value: 0, percentile: 0, status: 'not-calculated' }
      };

      const height = formData.height ? parseFloat(formData.height) : undefined;
      const weight = formData.weight ? parseFloat(formData.weight) : undefined;
      const length = formData.length ? parseFloat(formData.length) : undefined;
      const headCircumference = formData.headCircumference ? parseFloat(formData.headCircumference) : undefined;

      // Calculate all WHO indicators
      // Height-for-age
      if (height) {
          const haz = calculator.calculateZScore(height, ageInDays, child.sex, 'heightForAge');
          calculatedIndicators.haz = {
            value: haz ?? 0,
            percentile: haz !== null ? calculator.calculatePercentile(haz) ?? 0 : 0,
            status: haz !== null ? 'ok' : 'not-calculated'
          };
      }
      // Weight-for-age
      if (weight) {
          const waz = calculator.calculateZScore(weight, ageInDays, child.sex, 'weightForAge');
          calculatedIndicators.waz = {
            value: waz ?? 0,
            percentile: waz !== null ? calculator.calculatePercentile(waz) ?? 0 : 0,
            status: waz !== null ? 'ok' : 'not-calculated'
          };
      }
      // Weight-for-length (store in whz)
      if (weight && length) {
          const whz = calculator.calculateZScore(weight, ageInDays, child.sex, 'weightForLength', length);
          calculatedIndicators.whz = {
            value: whz ?? 0,
            percentile: whz !== null ? calculator.calculatePercentile(whz) ?? 0 : 0,
            status: whz !== null ? 'ok' : 'not-calculated'
          };
      }
      // Head circumference-for-age
      if (headCircumference) {
          const hcz = calculator.calculateZScore(headCircumference, ageInDays, child.sex, 'headCircumference');
          calculatedIndicators.hcz = {
            value: hcz ?? 0,
            percentile: hcz !== null ? calculator.calculatePercentile(hcz) ?? 0 : 0,
            status: hcz !== null ? 'ok' : 'not-calculated'
          };
      }
      // BMI-for-age
      if (weight && height) {
          const bmi = calculator.calculateBMI(weight, height);
          const bmiz = calculator.calculateZScore(bmi, ageInDays, child.sex, 'bmiForAge');
          calculatedIndicators.bmiz = {
            value: bmiz ?? 0,
            percentile: bmiz !== null ? calculator.calculatePercentile(bmiz) ?? 0 : 0,
            status: bmiz !== null ? 'ok' : 'not-calculated'
          };
      }
      // MUAC-for-age (if implemented in references)
      if (formData.muac) {
          // Placeholder: implement MUACZ calculation if reference data available
          calculatedIndicators.muacz = { value: 0, percentile: 0, status: 'not-implemented' };
      }

      const newMeasurement: Omit<MeasurementRecord, 'id'> = {
        childId: childId,
        measurementDate: measurementDate,
        ageInDays: ageInDays,
        anthropometry: {
          height: height ? { value: height, method: 'standing', accuracy: 0.1, measurementAttempts: 1 } : undefined,
          weight: weight ? { value: weight, scale: 'digital', accuracy: 0.1, clothingCompensation: 0 } : undefined,
          muac: formData.muac ? { value: parseFloat(formData.muac), armUsed: 'left', tapeType: 'paper', accuracy: 0.1 } : undefined,
          headCircumference: headCircumference ? { value: headCircumference, measurementPlane: 'occipitofrontal', accuracy: 0.1 } : undefined
        },
        calculatedIndicators: calculatedIndicators,
        context: {
            measuredBy: 'worker-id-placeholder',
            location: 'clinic',
            visitType: 'routine',
            healthStatus: 'healthy',
            feedingStatus: 'unknown'
        },
        qualityMetrics: {
            dataCompleteness: 100,
            measurementAccuracy: 100,
            validationsPassed: [],
            warningsGenerated: [],
            confidenceScore: 100
        }
      };

      await db.measurements.add(newMeasurement as MeasurementRecord);
      alert(`Measurements for child "${child.name}" saved and Z-scores calculated!`);
      setFormData({ height: '', weight: '', muac: '', headCircumference: '', length: '' });

    } catch (error) {
      console.error("Failed to save measurements:", error);
      alert("Error saving measurements. See console for details.");
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2, padding: 2, border: '1px solid grey', borderRadius: '4px' }}>
        <Typography variant="h6">Manual Measurement</Typography>
        <TextField
            label="Child UUID (from list above)"
            value={childId}
            onChange={(e) => setChildId(e.target.value)}
            required
            fullWidth
        />
        <fieldset style={{border: 'none', padding: 0, margin: 0}}>
            <legend><Typography variant="subtitle1">Anthropometry</Typography></legend>
            <TextField label="Height (cm)" name="height" type="number" value={formData.height} onChange={handleChange} fullWidth inputProps={{ step: "0.1" }} />
            <TextField label="Length (cm) - for WFL" name="length" type="number" value={formData.length} onChange={handleChange} fullWidth inputProps={{ step: "0.1" }} />
            <TextField label="Weight (kg)" name="weight" type="number" value={formData.weight} onChange={handleChange} fullWidth inputProps={{ step: "0.1" }} />
            <TextField label="MUAC (cm)" name="muac" type="number" value={formData.muac} onChange={handleChange} fullWidth inputProps={{ step: "0.1" }} />
            <TextField label="Head Circumference (cm)" name="headCircumference" type="number" value={formData.headCircumference} onChange={handleChange} fullWidth inputProps={{ step: "0.1" }} />
        </fieldset>
        <Box>
            <Button type="submit" variant="contained" color="primary">Save Measurements</Button>
        </Box>
    </Box>
  );
};
