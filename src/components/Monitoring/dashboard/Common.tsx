import moment from 'moment';
import theme from 'src/theme';

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
        numDataPoints: 50,
      };
    case 'Last 24 hours':
      return {
        start: moment(Date.now()).subtract(24, 'h'),
        end,
        numDataPoints: 50,
      };
    case 'Last 7 days':
      return {
        start: moment(Date.now()).subtract(7, 'd'),
        end,
        numDataPoints: 50,
      };
    case 'Last 30 days':
      return {
        start: moment(Date.now()).subtract(30, 'd'),
        end,
        numDataPoints: 50,
      };
    default:
      return {
        start: moment(),
        end,
        numDataPoints: 50,
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
    borderColor: theme.palette.TwClrBaseBlue600 as string,
    backgroundColor: theme.palette.TwClrBaseBlue500 as string,
  },
  STATE_OF_CHARGE: {
    borderColor: theme.palette.TwClrBaseOrange600 as string,
    backgroundColor: theme.palette.TwClrBaseOrange500 as string,
  },
  TEMPERATURE: {
    borderColor: theme.palette.TwClrBaseOrange600 as string,
    backgroundColor: theme.palette.TwClrBaseOrange500 as string,
  },
  TEMPERATURE_THRESHOLD: {
    borderColor: theme.palette.TwClrBaseOrange200 as string,
    backgroundColor: theme.palette.TwClrBaseOrange100 as string,
    fillColor: `${theme.palette.TwClrBaseOrange100 as string}80` /* 0x80: alpha channel = 0.5 */,
  },
  HUMIDITY: {
    borderColor: theme.palette.TwClrBaseBlue600 as string,
    backgroundColor: theme.palette.TwClrBaseBlue500 as string,
  },
  HUMIDITY_THRESHOLD: {
    borderColor: theme.palette.TwClrBaseBlue200 as string,
    backgroundColor: theme.palette.TwClrBaseBlue100 as string,
    fillColor: `${theme.palette.TwClrBaseBlue100 as string}80` /* 0x80: alpha channel = 0.5 */,
  },
};
