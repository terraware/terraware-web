import React, { type JSX, useEffect, useMemo, useState } from 'react';

import { Box, Grid, Typography, useTheme } from '@mui/material';
import { Checkbox, Dropdown, DropdownItem } from '@terraware/web-components';
import { DateTime } from 'luxon';

import DatePicker from 'src/components/common/DatePicker';
import DialogBox from 'src/components/common/DialogBox/DialogBox';
import TextField from 'src/components/common/Textfield/Textfield';
import Button from 'src/components/common/button/Button';
import { APP_PATHS } from 'src/constants';
import useOrganizationPlantingSites from 'src/hooks/useOrganizationPlantingSites';
import { useSyncNavigate } from 'src/hooks/useSyncNavigate';
import { useTrackModalAbandonment } from 'src/hooks/useTrackModalAbandonment';
import { useLocalization, useOrganization } from 'src/providers';
import {
  CreatePlantingSeasonRequestPayload,
  useCreatePlantingSeasonMutation,
  useGetSpeciesTargetsQuery,
  useLazyListPlantingSeasonsQuery,
} from 'src/queries/generated/plantingSeasons';
import strings from 'src/strings';
import useForm from 'src/utils/useForm';
import useSnackbar from 'src/utils/useSnackbar';

type AddPlantingSeasonModalProps = {
  onClose: () => void;
  initialPlantingSiteId?: number;
};

type PlantingSeasonForm = Partial<CreatePlantingSeasonRequestPayload> & { copyPrevious: boolean };

const AddPlantingSeasonModal = ({ onClose, initialPlantingSiteId }: AddPlantingSeasonModalProps): JSX.Element => {
  const theme = useTheme();
  const { activeLocale } = useLocalization();
  const { selectedOrganization } = useOrganization();
  const { plantingSites } = useOrganizationPlantingSites({ full: true });
  const snackbar = useSnackbar();
  const [createPlantingSeason, { isLoading }] = useCreatePlantingSeasonMutation();
  const markSubmitted = useTrackModalAbandonment('planting_season_add', true);
  const navigate = useSyncNavigate();

  const [record, setRecord, onChange] = useForm<PlantingSeasonForm>({
    plantingSiteId: initialPlantingSiteId && initialPlantingSiteId > 0 ? initialPlantingSiteId : undefined,
    copyPrevious: false,
    fromPlantingSeasonId: undefined,
    name: '',
    startDate: undefined,
    endDate: undefined,
  });

  const { data: speciesTargets } = useGetSpeciesTargetsQuery(record.fromPlantingSeasonId!, {
    skip: !record.fromPlantingSeasonId,
  });

  const speciesCount = new Set(speciesTargets?.targets.map((t) => t.speciesId)).size;
  const substrataCount = new Set(speciesTargets?.targets.map((t) => t.substratumId)).size;

  const [validate, setValidate] = useState<boolean>(false);

  const timeZoneId = useMemo(() => selectedOrganization?.timeZone ?? 'Etc/UTC', [selectedOrganization]);

  const endDateBeforeStart = useMemo(() => {
    if (!record.startDate || !record.endDate) {
      return false;
    }
    return DateTime.fromISO(record.endDate) <= DateTime.fromISO(record.startDate);
  }, [record.startDate, record.endDate]);

  const plantingSiteOptions = useMemo<DropdownItem[]>(
    () =>
      plantingSites
        .map((site) => ({ label: site.name, value: site.id }))
        .sort((a, b) => a.label.localeCompare(b.label, activeLocale || undefined)),
    [plantingSites, activeLocale]
  );

  const [listPlantingSeasons, { data: plantingSeasonsData }] = useLazyListPlantingSeasonsQuery();

  useEffect(() => {
    if (record.plantingSiteId) {
      void listPlantingSeasons({ plantingSiteId: record.plantingSiteId });
    }
  }, [listPlantingSeasons, record.plantingSiteId]);

  const seasonsForSelectedSite = useMemo(
    () =>
      record.plantingSiteId
        ? (plantingSeasonsData?.seasons ?? []).filter(
            (s) => s.plantingSiteId === record.plantingSiteId && s.speciesTargets.length > 0
          )
        : [],
    [plantingSeasonsData, record.plantingSiteId]
  );

  const seasonToCopyOptions = useMemo<DropdownItem[]>(
    () =>
      seasonsForSelectedSite.map((season) => ({
        label: season.name,
        value: season.id,
      })),
    [seasonsForSelectedSite]
  );

  const onChangePlantingSite = (value: any) => {
    setRecord((prev) => ({ ...prev, plantingSiteId: Number(value), fromPlantingSeasonId: undefined }));
  };

  const onChangeStartDate = (value?: DateTime) => {
    onChange('startDate', value?.toISODate() ?? undefined);
  };

  const onChangeEndDate = (value?: DateTime) => {
    onChange('endDate', value?.toISODate() ?? undefined);
  };

  const onCreate = async () => {
    const { plantingSiteId, name, startDate, endDate, copyPrevious, fromPlantingSeasonId } = record;
    if (!plantingSiteId || !name?.trim() || !startDate || !endDate || endDateBeforeStart) {
      setValidate(true);
      return;
    }
    try {
      const response = await createPlantingSeason({
        endDate,
        fromPlantingSeasonId: copyPrevious ? fromPlantingSeasonId : undefined,
        name: name.trim(),
        plantingSiteId,
        startDate,
      }).unwrap();
      markSubmitted();
      onClose();
      if (response?.id) {
        navigate(APP_PATHS.PLANTING_SEASONS_VIEW.replace(':plantingSeasonId', String(response.id)));
      }
    } catch (e) {
      snackbar.toastError();
    }
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
        <Button
          key='create'
          id='createPlantingSeason'
          label={strings.CREATE_SEASON}
          onClick={() => void onCreate()}
          disabled={isLoading}
        />,
      ]}
    >
      <Grid container spacing={3} sx={{ padding: 0 }} textAlign='left'>
        <Grid item xs={12}>
          <Dropdown
            id='plantingSite'
            required
            label={strings.PLANTING_SITE}
            placeholder={strings.SELECT}
            selectedValue={record.plantingSiteId}
            options={plantingSiteOptions}
            onChange={onChangePlantingSite}
            errorText={validate && !record.plantingSiteId ? strings.REQUIRED_FIELD : ''}
            fullWidth
          />
        </Grid>
        <Grid item xs={12} sx={{ '&.MuiGrid-item': { paddingBottom: 0 } }}>
          <Checkbox
            id='copyPreviousSeason'
            name='copyPreviousSeason'
            label={strings.COPY_PREVIOUS_SEASON}
            disabled={seasonsForSelectedSite.length === 0}
            value={record.copyPrevious}
            onChange={(value) =>
              setRecord((prev) => ({
                ...prev,
                copyPrevious: value,
                fromPlantingSeasonId: value ? prev.fromPlantingSeasonId : undefined,
              }))
            }
          />
        </Grid>
        {record.copyPrevious && (
          <Grid item xs={12}>
            <Dropdown
              id='seasonToCopy'
              label={strings.SEASON_TO_COPY}
              placeholder={strings.SELECT}
              selectedValue={record.fromPlantingSeasonId}
              options={seasonToCopyOptions}
              onChange={(value) => onChange('fromPlantingSeasonId', Number(value))}
              fullWidth
            />
            {record.fromPlantingSeasonId !== undefined && (
              <Typography sx={{ color: theme.palette.TwClrTxtWarning, fontSize: '14px', marginTop: theme.spacing(1) }}>
                {strings.formatString(strings.COPYING_SPECIES_ACROSS_SUBSTRATUM, speciesCount, substrataCount)}
              </Typography>
            )}
          </Grid>
        )}
        <Grid item xs={12}>
          <TextField
            id='seasonName'
            type='text'
            label={strings.SEASON_NAME_REQUIRED}
            value={record.name ?? ''}
            onChange={(value) => onChange('name', String(value ?? ''))}
            errorText={validate && !record.name?.trim() ? strings.REQUIRED_FIELD : ''}
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

export default AddPlantingSeasonModal;
