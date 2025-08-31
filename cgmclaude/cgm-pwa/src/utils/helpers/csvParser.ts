export interface ParsedLMSData {
  Sex: number; // 1 for male, 2 for female
  Agemos?: number; // Age in months
  Length?: number; // Length in cm (for weight-for-length)
  L: number;
  M: number;
  S: number;
  P3?: number;
  P5?: number;
  P10?: number;
  P25?: number;
  P50?: number;
  P75?: number;
  P90?: number;
  P95?: number;
  P97?: number;
}

export const parseCsv = (csvString: string): ParsedLMSData[] => {
  const lines = csvString.trim().split('\n');
  const headers = lines[0].split(',').map(header => header.trim());
  const data: ParsedLMSData[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map(value => value.trim());
    const row: any = {};
    headers.forEach((header, index) => {
      const parsedValue = parseFloat(values[index]);
      row[header] = isNaN(parsedValue) ? values[index] : parsedValue;
    });
    data.push(row as ParsedLMSData);
  }
  return data;
};
