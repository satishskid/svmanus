const headphoneDB = {
  'Apple EarPods (3.5mm)': {
    sensitivity: 100,
    freqResponse: { 1000: 1.0, 2000: 1.1, 4000: 0.9 },
  },
  'Sony MDR-EX155AP': {
    sensitivity: 105,
    freqResponse: { 1000: 1.0, 2000: 1.0, 4000: 0.85 },
  },
  default: {
    sensitivity: 100,
    freqResponse: { 1000: 1.0, 2000: 1.0, 4000: 1.0 },
  },
};

module.exports = { headphoneDB };