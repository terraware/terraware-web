import { Checkbox } from '@terraware/web-components';
import { useEffect, useState } from 'react';
import strings from 'src/strings';
import { TimeZoneDescription } from 'src/types/TimeZones';
import { useDefaultTimeZone } from 'src/utils/useTimeZoneUtils';
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
  const defaultTimeZone = useDefaultTimeZone();

  useEffect(() => {
    if (!location?.timeZone) {
      setOrgTZChecked(true);
    } else {
      setOrgTZChecked(false);
    }
  }, [location]);

  const onOrgTimeZoneChecked = (checked: boolean) => {
    if (checked) {
      setOrgTZChecked(true);
      onChangeTimeZone(undefined);
    } else {
      setOrgTZChecked(false);
      onChangeTimeZone(defaultTimeZone);
    }
  };

  return (
    <>
      <TimeZoneSelector
        selectedTimeZone={location.timeZone || defaultTimeZone.id}
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
