import { Checkbox } from '@terraware/web-components';
import { useEffect, useState } from 'react';
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
  location: TimeZoneEntity;
  tooltip?: string;
};

export default function LocationTimeZoneSelector(props: LocationTimeZoneSelectorProps): JSX.Element {
  const timeZoneFetcher = useLocationTimeZone();
  const { onChangeTimeZone, location, tooltip } = props;
  const [lastSelected, setLastSelected] = useState<TimeZoneEntity>(location);
  const [orgTZChecked, setOrgTZChecked] = useState<boolean>(!!location.timeZone);
  const [timeZone, setTimeZone] = useState<TimeZoneDescription>(timeZoneFetcher.get(lastSelected));

  useEffect(() => {
    if (location?.id && location?.id !== -1) {
      setLastSelected(location);
    }
  }, [location]);

  useEffect(() => {
    setTimeZone(timeZoneFetcher.get(lastSelected));
  }, [lastSelected, timeZoneFetcher]);

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
      setOrgTZChecked(true);
      onChangeTimeZone(undefined);
      setTimeZone(timeZoneFetcher.get(undefined, false));
    } else {
      setOrgTZChecked(false);
      const newTz = timeZoneFetcher.get(lastSelected, true);
      setTimeZone(newTz);
      onChangeTimeZone(newTz);
    }
  };

  return (
    <>
      <TimeZoneSelector
        selectedTimeZone={timeZone.id}
        onTimeZoneSelected={(value) => {
          setTimeZone(value);
          setLastSelected({ timeZone: value.id });
          onChangeTimeZone(value);
        }}
        label={strings.TIME_ZONE}
        disabled={orgTZChecked}
        tooltip={tooltip}
      />
      <Checkbox
        label={strings.USE_ORG_TZ}
        onChange={(value) => onOrgTimeZoneChecked(value)}
        id='orgTZ'
        name='orgTZ'
        value={orgTZChecked}
      />
    </>
  );
}
