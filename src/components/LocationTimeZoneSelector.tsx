import React, { type JSX, useCallback, useEffect, useState } from 'react';

import { Checkbox } from '@terraware/web-components';

import strings from 'src/strings';
import { TimeZoneDescription } from 'src/types/TimeZones';
import { useLocationTimeZone } from 'src/utils/useTimeZoneUtils';

import TimeZoneSelector from './TimeZoneSelector';

type TimeZoneEntity = {
  id?: number;
  timeZone?: string;
};

type LocationTimeZoneSelectorProps = {
  onChangeTimeZone: (tzSelected: TimeZoneDescription | undefined) => void;
  /**
   * Called with  the time zone that will be used for the location. If the location has no time
   * zone, this will be the organization's time zone. This is called at component initialization
   * time and again whenever the user changes the location's time zone.
   */
  onEffectiveTimeZone?: (timeZone: TimeZoneDescription | undefined) => void;
  location: TimeZoneEntity;
  tooltip?: string;
};

export default function LocationTimeZoneSelector(props: LocationTimeZoneSelectorProps): JSX.Element {
  const timeZoneFetcher = useLocationTimeZone();
  const { onChangeTimeZone, onEffectiveTimeZone, location, tooltip } = props;
  const [lastSelected, setLastSelected] = useState<TimeZoneEntity>(location);
  const [orgTZChecked, setOrgTZChecked] = useState<boolean>(!!location.timeZone);
  const [timeZone, setTimeZone] = useState<TimeZoneDescription>(timeZoneFetcher.get(lastSelected));

  const setEffectiveTimeZone = useCallback(
    (value: TimeZoneDescription | undefined) => {
      if (onEffectiveTimeZone) {
        onEffectiveTimeZone(value);
      }
    },
    [onEffectiveTimeZone]
  );

  useEffect(() => {
    if (location?.id && location?.id !== -1) {
      const fetchedTimeZone = timeZoneFetcher.get(location, true);
      setLastSelected(location);
      setTimeZone(fetchedTimeZone);
      setEffectiveTimeZone(fetchedTimeZone);
    }
  }, [location, timeZoneFetcher, setEffectiveTimeZone]);

  useEffect(() => {
    if (!location?.timeZone) {
      if (!orgTZChecked) {
        setOrgTZChecked(true);
      }
    } else if (orgTZChecked) {
      setOrgTZChecked(false);
    }
  }, [location?.timeZone, orgTZChecked]);

  const onOrgTimeZoneChecked = (checked: boolean) => {
    if (checked) {
      const newTz = timeZoneFetcher.get(undefined, false);
      setOrgTZChecked(true);
      setTimeZone(newTz);
      setEffectiveTimeZone(newTz);
      onChangeTimeZone(undefined);
    } else {
      const newTz = timeZoneFetcher.get(lastSelected, true);
      setOrgTZChecked(false);
      setTimeZone(newTz);
      setEffectiveTimeZone(newTz);
      onChangeTimeZone(newTz);
    }
  };

  return (
    <>
      <TimeZoneSelector
        selectedTimeZone={timeZone.id}
        onTimeZoneSelected={(value) => {
          setTimeZone(value);
          setEffectiveTimeZone(value);
          setLastSelected({ timeZone: value.id });
          onChangeTimeZone(value);
        }}
        label={strings.TIME_ZONE}
        disabled={orgTZChecked}
        tooltip={tooltip}
      />
      <Checkbox
        label={strings.USE_ORGANIZATION_TIME_ZONE}
        onChange={(value) => onOrgTimeZoneChecked(value)}
        id='orgTZ'
        name='orgTZ'
        value={orgTZChecked}
      />
    </>
  );
}
