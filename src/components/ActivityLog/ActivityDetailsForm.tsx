import React, { useCallback, useEffect, useMemo } from 'react';

import { Grid } from '@mui/material';
import { Checkbox, Dropdown, Textfield } from '@terraware/web-components';
import { getTodaysDateFormatted } from '@terraware/web-components/utils/date';
import { DateTime } from 'luxon';

import DatePicker from 'src/components/common/DatePicker';
import { useLocalization, useOrganization } from 'src/providers/hooks';
import {
  ACTIVITY_TYPES,
  Activity,
  ActivityType,
  CreateActivityRequestPayload,
  UpdateActivityRequestPayload,
  activityTypeLabel,
} from 'src/types/Activity';
import useForm from 'src/utils/useForm';

interface ActivityDetailsFormProps {
  activityId?: number;
  projectId: number;
}

type SavableActivity = (CreateActivityRequestPayload | UpdateActivityRequestPayload) & Activity;

type FormRecord = Partial<SavableActivity> | undefined;

export default function ActivityDetailsForm({ projectId }: ActivityDetailsFormProps): JSX.Element {
  const { strings } = useLocalization();
  const { selectedOrganization } = useOrganization();
  const [record, setRecord, onChange, onChangeCallback] = useForm<FormRecord>(undefined);

  // initialize record, if creating new
  useEffect(() => {
    if (record) {
      return;
    }

    const newActivity: Partial<CreateActivityRequestPayload> = {
      date: getTodaysDateFormatted(),
      description: '',
      projectId,
    };

    setRecord({ ...newActivity });
  }, [projectId, record, selectedOrganization, setRecord]);

  const activityTypeOptions = useMemo(() => {
    return ACTIVITY_TYPES.map((activityType: ActivityType) => ({
      label: activityTypeLabel(activityType, strings),
      value: activityType,
    }));
  }, [strings]);

  const onChangeActivityType = useCallback(
    (value: string | number | null): void => {
      onChange('type', value as SavableActivity['type']);
    },
    [onChange]
  );

  const onChangeDate = useCallback(
    (value?: DateTime<boolean> | undefined): void => {
      onChange('date', value?.toFormat('yyyy-MM-dd'));
    },
    [onChange]
  );

  const onChangeIsVerified = useCallback(
    (value: boolean): void => {
      onChange('isVerified', value);
    },
    [onChange]
  );

  if (!record) {
    return <></>;
  }

  return (
    <Grid container spacing={1} textAlign='left' xs={12}>
      <Grid item lg={6} xs={12}>
        <Dropdown
          fullWidth
          label={strings.ACTIVITY_TYPE}
          onChange={onChangeActivityType}
          options={activityTypeOptions}
          required
          selectedValue={record.type}
        />
      </Grid>

      <Grid item lg={5} xs={12}>
        <DatePicker
          aria-label={strings.DATE}
          id='date'
          label={strings.DATE_REQUIRED}
          onDateChange={onChangeDate}
          sx={{ '& .MuiInputBase-input': { paddingRight: 0 } }}
          value={record.date}
        />
      </Grid>

      <Grid item xs={12}>
        <Textfield
          id='description'
          label={strings.DESCRIPTION}
          onChange={onChangeCallback('description')}
          required
          sx={{ '& .textfield-value': { minHeight: '80px' } }}
          type='textarea'
          value={record?.description}
        />
      </Grid>

      <Grid item xs={12}>
        <Checkbox
          id='verified'
          label={strings.VERIFIED}
          name='verified'
          onChange={onChangeIsVerified}
          value={record?.isVerified}
        />
      </Grid>

      {/* TODO: render media upload component */}

      {/* TODO: render media items */}
    </Grid>
  );
}
