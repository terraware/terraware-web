import React, { useEffect, useMemo, useState } from 'react';
import { Autocomplete } from '@terraware/web-components';
import strings from 'src/strings';
import { getTimeZones } from 'src/api/timezones/timezones';

export type TimeZoneDescription = {
  id: string;
  longName: string;
};

export type TimeZoneSelectorProps = {
  onTimeZoneSelected: (tzSelected: TimeZoneDescription) => void;
  selectedTimeZone?: string;
};

export default function TimeZoneSelector(props: TimeZoneSelectorProps): JSX.Element {
  const { onTimeZoneSelected, selectedTimeZone } = props;
  const [timeZones, setTimeZones] = useState<TimeZoneDescription[]>([]);

  useEffect(() => {
    const fetchTimeZones = async () => {
      const timeZoneResponse = await getTimeZones();
      if (!timeZoneResponse.error && timeZoneResponse.timeZones) {
        setTimeZones(
          timeZoneResponse.timeZones.sort((a, b) => {
            if (a.longName > b.longName) {
              return 1;
            }
            if (b.longName > a.longName) {
              return -1;
            }
            return 0;
          })
        );
      }
    };

    fetchTimeZones();
  }, []);

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

  const isEqualAut = (optionA: any, optionB: any) => {
    if (optionA?.value && optionB?.value) {
      return optionA.value === optionB.value;
    }
    return false;
  };

  return (
    <Autocomplete
      id='timezones2'
      placeholder={strings.SELECT}
      selected={tzNameToDropdownItem(selectedTimeZone)}
      values={tzOptions}
      onChange={(value) => onChangeTimeZone(value)}
      isEqual={isEqualAut}
      freeSolo={false}
      hideClearIcon={true}
      label={''}
    />
  );
}
