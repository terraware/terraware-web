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
  const [orgTZChecked, setOrgTZChecked] = useState<boolean>(false);
  const { onChangeTimeZone, location } = props;
  const defaultTimeZone = useDefaultTimeZone();
  const [timeZoneEntity, setTimeZoneEntity] = useState<TimeZoneEntity>();

  useEffect(() => {
    if (!location?.timeZone) {
      setOrgTZChecked(true);
    } else {
      setOrgTZChecked(false);
      setTimeZoneEntity(location);
    }
  }, [location]);

  const onOrgTimeZoneChecked = (checked: boolean) => {
    if (checked) {
      setOrgTZChecked(true);
      setTimeZoneEntity({
        timeZone: undefined,
      });
      onChangeTimeZone(undefined);
    } else {
      setOrgTZChecked(false);
      setTimeZoneEntity({
        timeZone: defaultTimeZone.id,
      });
      onChangeTimeZone(defaultTimeZone);
    }
  };

  return (
    <>
      <TimeZoneSelector
        selectedTimeZone={timeZoneEntity?.timeZone || defaultTimeZone.id}
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
