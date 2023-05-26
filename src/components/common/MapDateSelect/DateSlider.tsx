import { Slider } from '@terraware/web-components';
import { useMemo } from 'react';

type DateSliderProps = {
  dates: Date[];
  onChange: (newDate: Date) => void;
  initialSelectionIndex: number;
};

export default function DateSlider(props: DateSliderProps): JSX.Element {
  const { dates, onChange, initialSelectionIndex } = props;

  const minTime = useMemo(() => {
    return Math.min(...dates.map((d) => d.getTime()));
  }, [dates]);

  const maxTime = useMemo(() => {
    return Math.max(...dates.map((d) => d.getTime()));
  }, [dates]);

  const marks = useMemo(() => {
    return dates.map((date) => ({ value: date.getTime() }));
  }, [dates]);

  const timestampForDate = useMemo(() => {
    const tsMap = new Map<number, Date>();
    for (const date of dates) {
      tsMap.set(date.getTime(), date);
    }

    return tsMap;
  }, [dates]);

  return (
    <Slider
      defaultValue={marks[initialSelectionIndex].value}
      min={minTime}
      max={maxTime}
      marks={marks}
      valueLabelDisplay='off'
      onChange={(ts) => onChange(timestampForDate.get(ts) ?? dates[initialSelectionIndex])}
    />
  );
}
