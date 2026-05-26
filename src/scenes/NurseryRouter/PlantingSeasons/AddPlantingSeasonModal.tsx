import React, { type JSX, useMemo, useState } from 'react';

import { Box, Grid, Typography, useTheme } from '@mui/material';
import { Checkbox, Dropdown, DropdownItem } from '@terraware/web-components';
import { DateTime } from 'luxon';

import DatePicker from 'src/components/common/DatePicker';
import DialogBox from 'src/components/common/DialogBox/DialogBox';
import TextField from 'src/components/common/Textfield/Textfield';
import Button from 'src/components/common/button/Button';
import useOrganizationPlantingSites from 'src/hooks/useOrganizationPlantingSites';
import { useLocalization, useOrganization } from 'src/providers';
import strings from 'src/strings';

type AddPlantingSeasonModalProps = {
  onClose: () => void;
  initialPlantingSiteId?: number;
};

const AddPlantingSeasonModal = ({ onClose, initialPlantingSiteId }: AddPlantingSeasonModalProps): JSX.Element => {
  const theme = useTheme();
  const { activeLocale } = useLocalization();
  const { selectedOrganization } = useOrganization();
  const { plantingSites } = useOrganizationPlantingSites();

  const [plantingSiteId, setPlantingSiteId] = useState<number | undefined>(
    initialPlantingSiteId && initialPlantingSiteId > 0 ? initialPlantingSiteId : undefined
  );
  const [copyPrevious, setCopyPrevious] = useState<boolean>(false);
  const [seasonToCopyId, setSeasonToCopyId] = useState<number | undefined>();
  const [seasonName, setSeasonName] = useState<string>('');
  const [startDate, setStartDate] = useState<string | undefined>();
  const [endDate, setEndDate] = useState<string | undefined>();

  const [plantingSiteError, setPlantingSiteError] = useState<string>('');
  const [seasonNameError, setSeasonNameError] = useState<string>('');
  const [startDateError, setStartDateError] = useState<string>('');
  const [endDateError, setEndDateError] = useState<string>('');

  const timeZoneId = useMemo(() => selectedOrganization?.timeZone ?? 'Etc/UTC', [selectedOrganization]);

  const plantingSiteOptions = useMemo<DropdownItem[]>(
    () =>
      plantingSites
        .map((site) => ({ label: site.name, value: site.id }))
        .sort((a, b) => a.label.localeCompare(b.label, activeLocale || undefined)),
    [plantingSites, activeLocale]
  );

  const selectedSite = useMemo(
    () => plantingSites.find((site) => site.id === plantingSiteId),
    [plantingSites, plantingSiteId]
  );

  const seasonToCopyOptions = useMemo<DropdownItem[]>(() => {
    if (!selectedSite) {
      return [];
    }
    return selectedSite.plantingSeasons.map((season) => ({
      label: strings.formatString(strings.DATE_RANGE, season.startDate, season.endDate).toString(),
      value: season.id,
    }));
  }, [selectedSite]);

  const onChangePlantingSite = (value: any) => {
    setPlantingSiteId(Number(value));
    setSeasonToCopyId(undefined);
    setPlantingSiteError('');
  };

  const onChangeStartDate = (value?: DateTime) => {
    setStartDate(value?.toISODate() ?? undefined);
    setStartDateError('');
  };

  const onChangeEndDate = (value?: DateTime) => {
    setEndDate(value?.toISODate() ?? undefined);
    setEndDateError('');
  };

  const onCreate = () => {
    let hasErrors = false;
    if (!plantingSiteId) {
      setPlantingSiteError(strings.REQUIRED_FIELD);
      hasErrors = true;
    }
    if (!seasonName.trim()) {
      setSeasonNameError(strings.REQUIRED_FIELD);
      hasErrors = true;
    }
    if (!startDate) {
      setStartDateError(strings.REQUIRED_FIELD);
      hasErrors = true;
    }
    if (!endDate) {
      setEndDateError(strings.REQUIRED_FIELD);
      hasErrors = true;
    }
    if (startDate && endDate) {
      const start = DateTime.fromISO(startDate);
      const end = DateTime.fromISO(endDate);
      if (end <= start) {
        setEndDateError(strings.RECORDING_DATE_ERROR);
        hasErrors = true;
      }
    }
    if (hasErrors) {
      return;
    }
    // TODO: call create planting season API
    onClose();
  };

  return (
    <DialogBox
      onClose={onClose}
      open={true}
      title={strings.ADD_PLANTING_SEASON}
      size='medium'
      middleButtons={[
        <Button
          key='cancel'
          id='cancelAddPlantingSeason'
          label={strings.CANCEL}
          priority='secondary'
          type='passive'
          onClick={onClose}
        />,
        <Button key='create' id='createPlantingSeason' label={strings.CREATE_SEASON} onClick={onCreate} />,
      ]}
    >
      <Grid container spacing={3} sx={{ padding: 0 }} textAlign='left'>
        <Grid item xs={12}>
          <Dropdown
            id='plantingSite'
            required
            label={strings.PLANTING_SITE}
            placeholder={strings.SELECT}
            selectedValue={plantingSiteId}
            options={plantingSiteOptions}
            onChange={onChangePlantingSite}
            errorText={plantingSiteError}
            fullWidth
          />
        </Grid>
        <Grid item xs={12} sx={{ '&.MuiGrid-item': { paddingBottom: 0 } }}>
          <Checkbox
            id='copyPreviousSeason'
            name='copyPreviousSeason'
            label={strings.COPY_PREVIOUS_SEASON}
            value={copyPrevious}
            onChange={(value) => {
              setCopyPrevious(value);
              if (!value) {
                setSeasonToCopyId(undefined);
              }
            }}
          />
        </Grid>
        {copyPrevious && (
          <Grid item xs={12}>
            <Dropdown
              id='seasonToCopy'
              label={strings.SEASON_TO_COPY}
              placeholder={strings.SELECT}
              selectedValue={seasonToCopyId}
              options={seasonToCopyOptions}
              onChange={(value) => setSeasonToCopyId(Number(value))}
              fullWidth
            />
            {seasonToCopyId !== undefined && (
              <Typography sx={{ color: theme.palette.TwClrTxtWarning, fontSize: '14px', marginTop: theme.spacing(1) }}>
                {strings.formatString(strings.COPYING_SPECIES_ACROSS_SUBSTRATUM, 0, 0)}
              </Typography>
            )}
          </Grid>
        )}
        <Grid item xs={12}>
          <TextField
            id='seasonName'
            type='text'
            label={strings.SEASON_NAME_REQUIRED}
            value={seasonName}
            onChange={(value) => {
              setSeasonName(String(value ?? ''));
              setSeasonNameError('');
            }}
            errorText={seasonNameError}
          />
        </Grid>
        <Grid item xs={6}>
          <DatePicker
            id='startDate'
            label={strings.START_DATE_REQUIRED}
            aria-label='start-date'
            value={startDate ?? ''}
            onDateChange={onChangeStartDate}
            errorText={startDateError}
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
                value={endDate ?? ''}
                onDateChange={onChangeEndDate}
                errorText={endDateError}
                defaultTimeZone={timeZoneId}
              />
            </Box>
          </Box>
        </Grid>
      </Grid>
    </DialogBox>
  );
};

export default AddPlantingSeasonModal;
