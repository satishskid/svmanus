import { parseCsv } from '../../../utils/helpers/csvParser';
import type { ParsedLMSData } from '../../../utils/helpers/csvParser';

// Import raw CSV data using Vite's ?raw import
import wtageinfCsv from '../../../data/references/who-standards/weight-for-age-infants.csv?raw';
import lenageinfCsv from '../../../data/references/who-standards/length-for-age-infants.csv?raw';
import wtleninfCsv from '../../../data/references/who-standards/weight-for-length-infants.csv?raw';
import hcageinfCsv from '../../../data/references/who-standards/head-circumference-for-age-infants.csv?raw';

export interface LMSData {
  age: number; // in days
  L: number;
  M: number;
  S: number;
}

export type Indicator = 'heightForAge' | 'weightForAge' | 'weightForLength' | 'bmiForAge' | 'headCircumference';
export type Sex = 'boys' | 'girls';

// Parse CSV data
const parsedWtageinf = parseCsv(wtageinfCsv);
const parsedLenageinf = parseCsv(lenageinfCsv);
const parsedWtleninf = parseCsv(wtleninfCsv);
const parsedHcageinf = parseCsv(hcageinfCsv);

// Helper to convert parsed CSV data to a more usable map
const processLMSData = (data: ParsedLMSData[], indicatorType: 'Agemos' | 'Length') => {
  const result: Record<Sex, Record<number, LMSData>> = {
    boys: {},
    girls: {}
  };

  data.forEach(row => {
    const sexKey: Sex = row.Sex === 1 ? 'boys' : 'girls';
    const ageOrLength = indicatorType === 'Agemos' ? row.Agemos : row.Length;
    if (ageOrLength !== undefined) {
      result[sexKey][ageOrLength] = {
        age: ageOrLength, // This will be age in months or length in cm
        L: row.L,
        M: row.M,
        S: row.S
      };
    }
  });
  return result;
};

const wtageData = processLMSData(parsedWtageinf, 'Agemos');
const lenageData = processLMSData(parsedLenageinf, 'Agemos');
const wtlenData = processLMSData(parsedWtleninf, 'Length');
const hcageData = processLMSData(parsedHcageinf, 'Agemos');


export const WHOStandards: Record<Indicator, Record<Sex, Record<number, LMSData>>> = {
  weightForAge: wtageData,
  heightForAge: lenageData, // CDC uses 'Length' for height in infants
  weightForLength: wtlenData,
  headCircumference: hcageData,
  bmiForAge: { boys: {}, girls: {} } // Will be populated with 2-20 years data later
};

// Function to get LMS data for a given age (in days) with interpolation
export const getLMSDataForAge = (ageInDays: number, sex: Sex, indicator: Indicator): LMSData | null => {
  const ageInMonths = ageInDays / (365.25 / 12); // Convert days to months
  const data = WHOStandards[indicator]?.[sex];

  if (!data) {
    console.warn(`No data found for indicator: ${indicator}, sex: ${sex}`);
    return null;
  }

  // Find the two closest monthly data points
  const lowerMonth = Math.floor(ageInMonths);
  const upperMonth = Math.ceil(ageInMonths);

  const lowerData = data[lowerMonth];
  const upperData = data[upperMonth];

  if (lowerData && upperData && lowerMonth !== upperMonth) {
    // Perform linear interpolation
    const fraction = (ageInMonths - lowerMonth) / (upperMonth - lowerMonth);
    return {
      age: ageInDays, // Return age in days for consistency
      L: lowerData.L + fraction * (upperData.L - lowerData.L),
      M: lowerData.M + fraction * (upperData.M - lowerData.M),
      S: lowerData.S + fraction * (upperData.S - lowerData.S)
    };
  } else if (lowerData) {
    // If age is exactly on a month or only one data point is available
    return lowerData;
  } else if (upperData) {
    // If only upper data is available (e.g., age is 0.1 months, only 1 month data exists)
    return upperData;
  }

  console.warn(`No LMS data found for age ${ageInDays} days (${ageInMonths.toFixed(2)} months) for ${sex} ${indicator}.`);
  return null;
};

// Function to get LMS data for a given length (in cm) with interpolation (for WFL)
export const getLMSDataForLength = (lengthCm: number, sex: Sex, indicator: Indicator): LMSData | null => {
  const data = WHOStandards[indicator]?.[sex];

  if (!data) {
    console.warn(`No data found for indicator: ${indicator}, sex: ${sex}`);
    return null;
  }

  // Find the two closest length data points
  const lengths = Object.keys(data).map(Number).sort((a, b) => a - b);
  let lowerLength = lengths.find(l => l <= lengthCm);
  let upperLength = lengths.find(l => l >= lengthCm);

  if (lowerLength === undefined && lengths.length > 0) lowerLength = lengths[0];
  if (upperLength === undefined && lengths.length > 0) upperLength = lengths[lengths.length - 1];


  const lowerData = lowerLength !== undefined ? data[lowerLength] : undefined;
  const upperData = upperLength !== undefined ? data[upperLength] : undefined;

  if (lowerData && upperData && lowerLength !== upperLength) {
    const fraction = (lengthCm - (lowerLength ?? 0)) / ((upperLength ?? 1) - (lowerLength ?? 0));
    return {
      age: lengthCm, // This will be length in cm
      L: lowerData.L + fraction * (upperData.L - lowerData.L),
      M: lowerData.M + fraction * (upperData.M - lowerData.M),
      S: lowerData.S + fraction * (upperData.S - lowerData.S)
    };
  } else if (lowerData) {
    return lowerData;
  } else if (upperData) {
    return upperData;
  }

  console.warn(`No LMS data found for length ${lengthCm} cm for ${sex} ${indicator}.`);
  return null;
};
