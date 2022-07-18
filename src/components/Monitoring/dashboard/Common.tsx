import moment from 'moment';

export const TIME_PERIODS = ['Last 12 hours', 'Last 24 hours', 'Last 7 days', 'Last 30 days'];

export type HumidityValues = {
  timestamp: string;
  value: string;
};

export const getStartTime = (period: string) => {
  switch (period) {
    case 'Last 12 hours':
      return moment(Date.now()).subtract(12, 'h');
    case 'Last 24 hours':
      return moment(Date.now()).subtract(24, 'h');
    case 'Last 7 days':
      return moment(Date.now()).subtract(7, 'd');
    case 'Last 30 days':
      return moment(Date.now()).subtract(30, 'd');
    default:
      return moment();
  }
};

export const getFirstWord = (sensorName: string) => {
  const sensorNameWords = sensorName.split(' ');
  return sensorNameWords[0];
};

export const getUnit = (selectedPeriod?: string) => {
  if (selectedPeriod?.includes('hours')) {
    return 'hour';
  } else {
    return 'day';
  }
};

type ChartLine =
  | 'SYSTEM_POWER'
  | 'STATE_OF_CHARGE'
  | 'TEMPERATURE'
  | 'TEMPERATURE_THRESHOLD'
  | 'HUMIDITY'
  | 'HUMIDITY_THRESHOLD';

type ChartLinePalette = {
  borderColor: string;
  backgroundColor: string;
  fillColor?: string;
};

type ChartPaletteType = {
  [key in ChartLine]: ChartLinePalette;
};

export const ChartPalette: ChartPaletteType = {
  SYSTEM_POWER: {
    borderColor: '#0067C8',
    backgroundColor: '#007DF2',
  },
  STATE_OF_CHARGE: {
    borderColor: 'BD6931',
    backgroundColor: '#DE7935',
  },
  TEMPERATURE: {
    borderColor: 'BD6931',
    backgroundColor: '#DE7935',
  },
  TEMPERATURE_THRESHOLD: {
    borderColor: '#F89E74',
    backgroundColor: '#FAC4B1',
    fillColor: '#FFBFD035',
  },
  HUMIDITY: {
    borderColor: '#0067C8',
    backgroundColor: '#007DF2',
  },
  HUMIDITY_THRESHOLD: {
    borderColor: '#BED0FF',
    backgroundColor: '#E2E9FF',
    fillColor: '#E2E9FF',
  },
};
