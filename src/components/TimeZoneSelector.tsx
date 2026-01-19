import React, { type JSX, useMemo } from 'react';

import { Autocomplete, Textfield } from '@terraware/web-components';

import { useTimeZones } from 'src/providers';
import strings from 'src/strings';
import { TimeZoneDescription } from 'src/types/TimeZones';

export type TimeZoneSelectorProps = {
  onTimeZoneSelected: (tzSelected: TimeZoneDescription) => void;
  selectedTimeZone?: string;
  countryCode?: string;
  disabled?: boolean;
  label?: string;
  tooltip?: string;
  errorText?: string;
};

export default function TimeZoneSelector(props: TimeZoneSelectorProps): JSX.Element {
  const { onTimeZoneSelected, selectedTimeZone, countryCode, disabled, label, tooltip, errorText } = props;
  const timeZones = useTimeZones();

  const tzToDropdownItem = (tz?: TimeZoneDescription) =>
    tz ? { label: tz.longName, value: tz.id } : { label: '', value: '' };

  const tzNameToDropdownItem = (tz?: string) => {
    const foundTimeZone = timeZones.find((iTtimeZone) => iTtimeZone.id.toString() === tz?.toString());
    return foundTimeZone ? { label: foundTimeZone.longName, value: foundTimeZone.id } : { label: '', value: '' };
  };

  const tzOptions: any[] = useMemo(() => {
    if (countryCode) {
      try {
        // get region info
        const regionInfo = new Intl.Locale('en-US', { region: countryCode }); // use en-US to get english time zone ids
        // get time zones for region
        const regionTimeZones = (regionInfo as any).timeZones;
        if (regionTimeZones) {
          // get list of time zones from the BE supported list, that are in the region's time zones list
          const supportedRegionTimeZones = timeZones.filter((tz) =>
            regionTimeZones.find((rtz: string) => rtz === tz.id)
          );
          if (supportedRegionTimeZones.length) {
            // return [region time zone, rest of the time zones] in that order
            const remainingTimeZones = timeZones.filter(
              (tz) => !supportedRegionTimeZones.find((rtz) => rtz.id === tz.id)
            );
            return [...supportedRegionTimeZones, ...remainingTimeZones].map((tz) => tzToDropdownItem(tz));
          }
        }
      } catch (e) {
        // invalid country code
      }
    }
    return timeZones.map((tz) => tzToDropdownItem(tz));
  }, [countryCode, timeZones]);

  const onChangeTimeZone = (timeZone: any) => {
    const foundTimeZone = timeZones.find((iTtimeZone) => iTtimeZone.id.toString() === timeZone.value?.toString());
    if (foundTimeZone) {
      onTimeZoneSelected(foundTimeZone);
    }
  };

  const isEqual = (optionA: any, optionB: any) => {
    return optionA?.value === optionB?.value;
  };

  return disabled ? (
    <Textfield
      id='time-zone-selector-disabled'
      value={tzNameToDropdownItem(selectedTimeZone).label}
      type='text'
      label={label || ''}
      display={true}
      tooltipTitle={tooltip}
    />
  ) : (
    <Autocomplete
      id='time-zone-selector'
      placeholder={strings.SELECT}
      selected={tzNameToDropdownItem(selectedTimeZone)}
      options={tzOptions}
      onChange={(value) => onChangeTimeZone(value)}
      isEqual={isEqual}
      freeSolo={false}
      hideClearIcon={true}
      label={label || ''}
      tooltipTitle={tooltip}
      errorText={errorText}
    />
  );
}
