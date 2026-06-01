import React, { type JSX, useMemo, useState } from 'react';

import { Box, Grid, Typography, useTheme } from '@mui/material';
import { DateTime } from 'luxon';

import DatePicker from 'src/components/common/DatePicker';
import DialogBox from 'src/components/common/DialogBox/DialogBox';
import TextField from 'src/components/common/Textfield/Textfield';
import Button from 'src/components/common/button/Button';
import { useOrganization } from 'src/providers';
import { PlantingSeasonPayload, useUpdatePlantingSeasonMutation } from 'src/queries/generated/plantingSeasons';
import { PlantingSitePayload } from 'src/queries/generated/plantingSites';
import strings from 'src/strings';
import useForm from 'src/utils/useForm';
import useSnackbar from 'src/utils/useSnackbar';
import { useDefaultTimeZone } from 'src/utils/useTimeZoneUtils';

type EditPlantingSeasonModalProps = {
  onClose: () => void;
  plantingSeason: PlantingSeasonPayload;
  plantingSite: PlantingSitePayload;
};

type PlantingSeasonForm = {
  name: string;
  startDate?: string;
  endDate?: string;
};

const EditPlantingSeasonModal = ({
  onClose,
  plantingSeason,
  plantingSite,
}: EditPlantingSeasonModalProps): JSX.Element => {
  const theme = useTheme();
  const { selectedOrganization } = useOrganization();
  const defaultTimeZone = useDefaultTimeZone().get().id;
  const snackbar = useSnackbar();
  const [updatePlantingSeason, { isLoading }] = useUpdatePlantingSeasonMutation();

  const [record, , onChange] = useForm<PlantingSeasonForm>({
    name: plantingSeason.name,
    startDate: plantingSeason.startDate,
    endDate: plantingSeason.endDate,
  });

  const [validate, setValidate] = useState<boolean>(false);

  const timeZoneId = useMemo(
    () => plantingSite.timeZone ?? selectedOrganization?.timeZone ?? defaultTimeZone,
    [plantingSite.timeZone, selectedOrganization, defaultTimeZone]
  );

  const endDateBeforeStart = useMemo(() => {
    if (!record.startDate || !record.endDate) {
      return false;
    }
    return DateTime.fromISO(record.endDate) <= DateTime.fromISO(record.startDate);
  }, [record.startDate, record.endDate]);

  const onChangeStartDate = (value?: DateTime) => {
    onChange('startDate', value?.toISODate() ?? undefined);
  };

  const onChangeEndDate = (value?: DateTime) => {
    onChange('endDate', value?.toISODate() ?? undefined);
  };

  const onSave = async () => {
    const { name, startDate, endDate } = record;
    if (!name.trim() || !startDate || !endDate || endDateBeforeStart) {
      setValidate(true);
      return;
    }
    try {
      await updatePlantingSeason({
        id: plantingSeason.id,
        updatePlantingSeasonRequestPayload: {
          name: name.trim(),
          startDate,
          endDate,
        },
      }).unwrap();
      onClose();
    } catch (e) {
      snackbar.toastError();
    }
  };

  return (
    <DialogBox
      onClose={onClose}
      open={true}
      title={strings.EDIT_PLANTING_SEASON}
      size='medium'
      middleButtons={[
        <Button
          key='cancel'
          id='cancelEditPlantingSeason'
          label={strings.CANCEL}
          priority='secondary'
          type='passive'
          onClick={onClose}
        />,
        <Button
          key='save'
          id='saveEditPlantingSeason'
          label={strings.SAVE}
          onClick={() => void onSave()}
          disabled={isLoading}
        />,
      ]}
    >
      <Grid container spacing={3} sx={{ padding: 0 }} textAlign='left'>
        <Grid item xs={12}>
          <Typography fontWeight={600}>{plantingSite.name}</Typography>
        </Grid>
        <Grid item xs={12}>
          <TextField
            id='seasonName'
            type='text'
            label={strings.SEASON_NAME_REQUIRED}
            value={record.name}
            onChange={(value) => onChange('name', String(value ?? ''))}
            errorText={validate && !record.name.trim() ? strings.REQUIRED_FIELD : ''}
          />
        </Grid>
        <Grid item xs={6}>
          <DatePicker
            id='startDate'
            label={strings.START_DATE_REQUIRED}
            aria-label='start-date'
            value={record.startDate ?? ''}
            onDateChange={onChangeStartDate}
            errorText={validate && !record.startDate ? strings.REQUIRED_FIELD : ''}
            defaultTimeZone={timeZoneId}
          />
        </Grid>
        <Grid item xs={6}>
          <Box sx={{ alignItems: 'flex-end', display: 'flex', gap: theme.spacing(1) }}>
            <Typography sx={{ paddingBottom: theme.spacing(1.25) }}>{strings.TO}</Typography>
            <Box sx={{ flex: 1 }}>
              <DatePicker
                id='endDate'
                label={strings.END_DATE_REQUIRED}
                aria-label='end-date'
                value={record.endDate ?? ''}
                onDateChange={onChangeEndDate}
                errorText={
                  validate
                    ? !record.endDate
                      ? strings.REQUIRED_FIELD
                      : endDateBeforeStart
                        ? strings.RECORDING_DATE_ERROR
                        : ''
                    : ''
                }
                defaultTimeZone={timeZoneId}
              />
            </Box>
          </Box>
        </Grid>
      </Grid>
    </DialogBox>
  );
};

export default EditPlantingSeasonModal;
