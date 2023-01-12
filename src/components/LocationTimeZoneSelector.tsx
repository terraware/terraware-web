import { Checkbox } from '@terraware/web-components';
import { useEffect, useState } from 'react';
import strings from 'src/strings';
import { TimeZoneDescription } from 'src/types/TimeZones';
import { useLocationTimeZone } from 'src/utils/useTimeZoneUtils';
import TimeZoneSelector from './TimeZoneSelector';

type TimeZoneEntity = {
  timeZone?: string;
};

type LocationTimeZoneSelectorProps = {
  onChangeTimeZone: (tzSelected: TimeZoneDescription | undefined) => void;
  location: TimeZoneEntity;
};

export default function LocationTimeZoneSelector(props: LocationTimeZoneSelectorProps): JSX.Element {
  const { onChangeTimeZone, location } = props;
  const [orgTZChecked, setOrgTZChecked] = useState<boolean>(!!location.timeZone);
  const timeZone = useLocationTimeZone(location);

  useEffect(() => {
    if (!location?.timeZone) {
      setOrgTZChecked(true);
    } else {
      setOrgTZChecked(false);
    }
  }, [location?.timeZone]);

  const onOrgTimeZoneChecked = (checked: boolean) => {
    if (checked) {
      setOrgTZChecked(true);
      onChangeTimeZone(undefined);
    } else {
      setOrgTZChecked(false);
      onChangeTimeZone(timeZone);
    }
  };

  return (
    <>
      <TimeZoneSelector
        selectedTimeZone={timeZone.id}
        onTimeZoneSelected={onChangeTimeZone}
        label={strings.TIME_ZONE}
        disabled={orgTZChecked}
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
