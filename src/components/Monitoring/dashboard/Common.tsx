import moment from 'moment';

export const TIME_PERIODS = ['Last 12 hours', 'Last 24 hours', 'Last 7 days', 'Last 30 days'];

export type HumidityValues = {
  timestamp: string;
  value: string;
};

export const getTimePeriodParams = (period: string) => {
  const end = moment();

  switch (period) {
    case 'Last 12 hours':
      return {
        start: moment(Date.now()).subtract(12, 'h'),
        end,
        numDataPoints: 12 * 3,
      };
    case 'Last 24 hours':
      return {
        start: moment(Date.now()).subtract(24, 'h'),
        end,
        numDataPoints: 24 * 3,
      };
    case 'Last 7 days':
      return {
        start: moment(Date.now()).subtract(7, 'd'),
        end,
        numDataPoints: 7 * 24 * 3,
      };
    case 'Last 30 days':
      return {
        start: moment(Date.now()).subtract(30, 'd'),
        end,
        numDataPoints: 30 * 24 * 3,
      };
    default:
      return {
        start: moment(),
        end,
        numDataPoints: 12,
      };
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
    borderColor: '#0067C8' /* tw-clr-base-blue-600 */,
    backgroundColor: '#007DF2' /* tw-clr-base-blue-500 */,
  },
  STATE_OF_CHARGE: {
    borderColor: '#9A572B' /* tw-clr-base-orange-600 */,
    backgroundColor: '#BD6931' /* tw-clr-base-orange-500 */,
  },
  TEMPERATURE: {
    borderColor: '#9A572B' /* tw-clr-base-orange-600 */,
    backgroundColor: '#BD6931' /* tw-clr-base-orange-500 */,
  },
  TEMPERATURE_THRESHOLD: {
    borderColor: '#FAC4B1' /* tw-clr-base-orange-200 */,
    backgroundColor: '#FCE5DE' /* tw-clr-base-orange-100 */,
    fillColor: '#FCE5DE80' /* tw-clr-base-orange-100 @ 50% */,
  },
  HUMIDITY: {
    borderColor: '#0067C8' /* tw-clr-base-blue-600 */,
    backgroundColor: '#007DF2' /* tw-clr-base-blue-500 */,
  },
  HUMIDITY_THRESHOLD: {
    borderColor: '#BED0FF' /* tw-clr-base-blue-200 */,
    backgroundColor: '#E2E9FF' /* tw-clr-base-blue-100 */,
    fillColor: '#E2E9FF80' /* tw-clr-base-blue-100 @ 50% */,
  },
};
