import { getLMSDataForAge, getLMSDataForLength, LMSData, Indicator, Sex } from './WHOReferences';

// This class is a port of the logic described in the PRD.
export class AdvancedZScoreCalculator {

  // This method now uses the interpolation functions from WHOReferences.ts
  private getReferenceData(ageInDays: number, sex: Sex, indicator: Indicator, lengthCm?: number): LMSData | null {
    if (indicator === 'weightForLength') {
      if (lengthCm === undefined) {
        console.error("Length is required for weightForLength indicator.");
        return null;
      }
      return getLMSDataForLength(lengthCm, sex, indicator);
    } else {
      return getLMSDataForAge(ageInDays, sex, indicator);
    }
  }

  private validateAndBoundZScore(zScore: number): number {
    // Basic validation, can be expanded based on WHO guidelines for flagging extreme values.
    if (isNaN(zScore) || !isFinite(zScore)) {
        return NaN;
    }
    return zScore;
  }

  // Standard Normal Cumulative Distribution Function (CDF)
  // Using the Abramowitz and Stegun approximation.
  private normalCDF(x: number): number {
    const b1 =  0.319381530;
    const b2 = -0.356563782;
    const b3 =  1.781477937;
    const b4 = -1.821255978;
    const b5 =  1.330274429;
    const p  =  0.2316419;
    const c  =  0.39894228;

    if(x >= 0.0) {
        const t = 1.0 / ( 1.0 + p * x );
        return (1.0 - c * Math.exp( -x * x / 2.0 ) * t * ( t * ( t * ( t * ( t * b5 + b4 ) + b3 ) + b2 ) + b1 ));
    }
    else {
        const t = 1.0 / ( 1.0 - p * x );
        return (c * Math.exp( -x * x / 2.0 ) * t * ( t * ( t * ( t * ( t * b5 + b4 ) + b3 ) + b2 ) + b1 ));
    }
  }

  // BMI Calculation
  public calculateBMI(weightKg: number, heightCm: number): number {
    if (heightCm === 0) return 0; // Avoid division by zero
    const heightM = heightCm / 100;
    return weightKg / (heightM * heightM);
  }

  public calculateZScore(measurement: number, ageInDays: number, sex: 'M' | 'F', indicator: Indicator, lengthCm?: number): number | null {
    const sexKey = sex === 'M' ? 'boys' : 'girls';
    let referenceData: LMSData | null;

    if (indicator === 'weightForLength') {
      referenceData = this.getReferenceData(ageInDays, sexKey, indicator, lengthCm);
    } else {
      referenceData = this.getReferenceData(ageInDays, sexKey, indicator);
    }

    if (!referenceData) {
      console.error(`No reference data found for indicator: ${indicator}, sex: ${sexKey}, age: ${ageInDays} (length: ${lengthCm || 'N/A'})`);
      return null;
    }

    const { L, M, S } = referenceData;

    let zScore;
    if (L !== 0) {
      zScore = (Math.pow(measurement / M, L) - 1) / (L * S);
    } else {
      zScore = Math.log(measurement / M) / S;
    }

    return this.validateAndBoundZScore(zScore);
  }

  public calculatePercentile(zScore: number): number | null {
    if (isNaN(zScore) || !isFinite(zScore)) {
        return null;
    }
    return this.normalCDF(zScore) * 100;
  }
};
