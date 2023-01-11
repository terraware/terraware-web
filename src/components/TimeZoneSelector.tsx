import React, { useMemo } from 'react';
import { Autocomplete } from '@terraware/web-components';
import strings from 'src/strings';
import { useTimeZones } from 'src/providers';
import { TimeZoneDescription } from 'src/types/TimeZones';

export type TimeZoneSelectorProps = {
  onTimeZoneSelected: (tzSelected: TimeZoneDescription) => void;
  selectedTimeZone?: string;
  disabled?: boolean;
  label?: string;
};

export default function TimeZoneSelector(props: TimeZoneSelectorProps): JSX.Element {
  const { onTimeZoneSelected, selectedTimeZone, disabled, label } = props;
  const timeZones = useTimeZones();

  const tzToDropdownItem = (tz?: TimeZoneDescription) =>
    tz ? { label: tz.longName, value: tz.id } : { label: '', value: '' };

  const tzNameToDropdownItem = (tz?: string) => {
    const foundTimeZone = timeZones.find((iTtimeZone) => iTtimeZone.id.toString() === tz?.toString());
    return foundTimeZone ? { label: foundTimeZone.longName, value: foundTimeZone.id } : { label: '', value: '' };
  };

  const tzOptions: any[] = useMemo(() => {
    return timeZones.map((tz) => tzToDropdownItem(tz));
  }, [timeZones]);

  const onChangeTimeZone = (timeZone: any) => {
    const foundTimeZone = timeZones.find((iTtimeZone) => iTtimeZone.id.toString() === timeZone.value?.toString());
    if (foundTimeZone) {
      onTimeZoneSelected(foundTimeZone);
    }
  };

  const isEqual = (optionA: any, optionB: any) => {
    return optionA?.value === optionB?.value;
  };

  return (
    <Autocomplete
      id='timezones2'
      placeholder={strings.SELECT}
      selected={tzNameToDropdownItem(selectedTimeZone)}
      values={tzOptions}
      onChange={(value) => onChangeTimeZone(value)}
      isEqual={isEqual}
      freeSolo={false}
      hideClearIcon={true}
      label={label || ''}
      disabled={disabled}
    />
  );
}
