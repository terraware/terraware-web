import React, { type JSX, useMemo } from 'react';

import { Slider } from '@terraware/web-components';

type DateSliderProps = {
  dates: string[]; // date strings in the format 'YYYY-MM-DD'
  onChange: (newDate?: string) => void;
  selection: string;
};

export default function DateSlider(props: DateSliderProps): JSX.Element {
  const { dates, onChange, selection } = props;

  const minTime = useMemo(() => {
    return Math.min(...dates.map((d) => Date.parse(d)));
  }, [dates]);

  const maxTime = useMemo(() => {
    return Math.max(...dates.map((d) => Date.parse(d)));
  }, [dates]);

  const marks = useMemo(() => {
    return dates.map((date) => ({ value: Date.parse(date) }));
  }, [dates]);

  const timestampForDate = useMemo(() => {
    const tsMap = new Map<number, string>();
    for (const date of dates) {
      tsMap.set(Date.parse(date), date);
    }

    return tsMap;
  }, [dates]);

  return (
    <Slider
      value={marks.find((m) => m.value === Date.parse(selection))?.value}
      min={minTime}
      max={maxTime}
      marks={marks}
      valueLabelDisplay='off'
      onChange={(ts) => onChange(timestampForDate.get(ts))}
    />
  );
}
