import { DropdownItem } from '@terraware/web-components';
import moment from 'moment';

import strings from 'src/strings';
import theme from 'src/theme';
import { changeTimezone } from 'src/utils/useTimeZoneUtils';

export function timePeriods(): DropdownItem[] {
  return [
    {
      label: strings.PERIOD_LAST_12_HOURS,
      value: 'Last 12 hours',
    },
    {
      label: strings.PERIOD_LAST_24_HOURS,
      value: 'Last 24 hours',
    },
    {
      label: strings.PERIOD_LAST_7_DAYS,
      value: 'Last 7 days',
    },
    {
      label: strings.PERIOD_LAST_30_DAYS,
      value: 'Last 30 days',
    },
  ];
}

export type HumidityValues = {
  timestamp: string;
  value: string;
};

export const getTimePeriodParams = (period: string, timeZone: string) => {
  const end = moment(changeTimezone(moment().toDate(), timeZone));

  switch (period) {
    case 'Last 12 hours':
      return {
        start: moment(changeTimezone(moment(Date.now()).subtract(12, 'h').toDate(), timeZone)),
        end,
        numDataPoints: 50,
      };
    case 'Last 24 hours':
      return {
        start: moment(changeTimezone(moment(Date.now()).subtract(24, 'h').toDate(), timeZone)),
        end,
        numDataPoints: 50,
      };
    case 'Last 7 days':
      return {
        start: moment(changeTimezone(moment(Date.now()).subtract(7, 'd').toDate(), timeZone)),
        end,
        numDataPoints: 50,
      };
    case 'Last 30 days':
      return {
        start: moment(changeTimezone(moment(Date.now()).subtract(30, 'd').toDate(), timeZone)),
        end,
        numDataPoints: 50,
      };
    default:
      return {
        start: moment(changeTimezone(moment().toDate(), timeZone)),
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

export const convertEntryTimestamp = (timestamp: string, timeZone: string) => {
  return changeTimezone(new Date(timestamp), timeZone).getTime();
};
