import { Checkbox } from '@terraware/web-components';
import { useEffect, useState } from 'react';
import strings from 'src/strings';
import { TimeZoneDescription } from 'src/types/TimeZones';
import { useDefaultTimeZone } from 'src/utils/useTimeZoneUtils';
import TimeZoneSelector from '../TimeZoneSelector';

type UpdateTimeZone = {
  timeZone?: string;
};

interface TimeZoneSelectorWithCheckboxProps<T extends UpdateTimeZone> {
  onChangeTimeZone: (tzSelected: TimeZoneDescription) => void;
  record: T;
  setRecord: React.Dispatch<React.SetStateAction<T>>;
}

export default function TimeZoneSelectorWithCheckbox<T extends UpdateTimeZone>(
  props: TimeZoneSelectorWithCheckboxProps<T>
): JSX.Element {
  const [orgTZChecked, setOrgTZChecked] = useState<boolean>(false);
  const { onChangeTimeZone, record, setRecord } = props;
  const defaultTimeZone = useDefaultTimeZone();

  useEffect(() => {
    if (!record?.timeZone) {
      setOrgTZChecked(true);
    } else {
      setOrgTZChecked(false);
    }
  }, [record]);

  const onOrgTimeZoneChecked = (checked: boolean) => {
    if (checked) {
      setOrgTZChecked(true);
      setRecord((previousRecord: T): T => {
        return {
          ...previousRecord,
          timeZone: undefined,
        };
      });
    } else {
      setOrgTZChecked(false);
    }
  };

  return (
    <>
      <TimeZoneSelector
        selectedTimeZone={record?.timeZone || defaultTimeZone.id}
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
