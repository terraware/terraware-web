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
