export type Timeseries = {
  /** ID of device that produces this timeseries. */
  deviceId: number;
  timeseriesName: string;
  type: 'Numeric' | 'Text';
  /** Number of significant fractional digits (after the decimal point), if this is a timeseries with non-integer numeric values. */
  decimalPlaces?: number;
  /** Units of measure for values in this timeseries. */
  units?: string;
  latestValue?: TimeseriesValue;
};

export type TimeseriesValue = {
  timestamp: string;
  /** Value to record. If the timeseries is of type Numeric, this must be a decimal or integer value in string form. If the timeseries is of type Text, this can be an arbitrary string. */
  value: string;
};
