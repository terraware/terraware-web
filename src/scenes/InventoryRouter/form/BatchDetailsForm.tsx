import React, { useCallback, useEffect, useMemo, useState } from 'react';

import { Box, Divider, Grid, Typography, useTheme } from '@mui/material';
import { Textfield } from '@terraware/web-components';
import { useDeviceInfo } from '@terraware/web-components/utils';
import getDateDisplayValue, { getTodaysDateFormatted } from '@terraware/web-components/utils/date';

import ProjectsDropdown from 'src/components/ProjectsDropdown';
import DatePicker from 'src/components/common/DatePicker';
import isEnabled from 'src/features';
import { useProjects } from 'src/hooks/useProjects';
import { useUser } from 'src/providers';
import { useOrganization } from 'src/providers/hooks';
import { SavableBatch } from 'src/redux/features/batches/batchesAsyncThunks';
import { OriginPage } from 'src/scenes/InventoryRouter/InventoryBatchView';
import AccessionsDropdown from 'src/scenes/InventoryRouter/form/AccessionsDropdown';
import NurseryDropdownV2 from 'src/scenes/InventoryRouter/form/NurseryDropdownV2';
import SpeciesDropdown from 'src/scenes/InventoryRouter/form/SpeciesDropdown';
import SubLocationsDropdown from 'src/scenes/InventoryRouter/form/SubLocationsDropdown';
import { useAccessions } from 'src/scenes/InventoryRouter/form/useAccessions';
import { useNurseries } from 'src/scenes/InventoryRouter/form/useNurseries';
import { useSpecies } from 'src/scenes/InventoryRouter/form/useSpecies';
import { useSubLocations } from 'src/scenes/InventoryRouter/form/useSubLocations';
import FacilityService from 'src/services/FacilityService';
import strings from 'src/strings';
import { stateName } from 'src/types/Accession';
import { CreateBatchRequestPayload } from 'src/types/Batch';
import useForm from 'src/utils/useForm';
import { useNumberFormatter } from 'src/utils/useNumber';
import useSnackbar from 'src/utils/useSnackbar';
import { useLocationTimeZone } from 'src/utils/useTimeZoneUtils';

export interface BatchDetailsFormProps {
  doValidateBatch: boolean;
  onBatchValidated: (batchDetails: { batch: SavableBatch; organizationId: number; timezone: string } | false) => void;
  origin: OriginPage;
  originId?: number;
}

type FormRecord = Partial<SavableBatch> | undefined;
type SavableFormRecord = Partial<SavableBatch>;

const QUANTITY_FIELDS = ['germinatingQuantity', 'notReadyQuantity', 'readyQuantity'] as const;

type QuantityField = (typeof QUANTITY_FIELDS)[number];

const MANDATORY_FIELDS = ['addedDate', 'facilityId', ...QUANTITY_FIELDS, 'speciesId'] as const;

type MandatoryField = (typeof MANDATORY_FIELDS)[number];

export default function BatchDetailsForm(props: BatchDetailsFormProps): JSX.Element {
  const { doValidateBatch, onBatchValidated, originId, origin } = props;

  const numberFormatter = useNumberFormatter();
  const { user } = useUser();
  const { selectedOrganization } = useOrganization();
  const theme = useTheme();
  const snackBar = useSnackbar();
  const { isMobile } = useDeviceInfo();
  const locationTimezone = useLocationTimeZone();
  const [record, setRecord, onChange] = useForm<FormRecord>(undefined);
  const featureFlagProjects = isEnabled('Projects');

  const facilityId = origin === 'Nursery' ? originId : record?.facilityId;
  const speciesId = origin === 'Species' ? originId : record?.speciesId;

  const { availableSubLocations } = useSubLocations(facilityId, record);
  const { selectedSpecies } = useSpecies(record);
  const { availableAccessions, selectedAccession } = useAccessions(record, selectedSpecies?.id ?? speciesId, true);
  const { availableNurseries } = useNurseries(record);
  const { availableProjects } = useProjects(record);

  const [totalQuantity, setTotalQuantity] = useState(0);
  const [addedDateChanged, setAddedDateChanged] = useState(false);
  const [validateFields, setValidateFields] = useState<boolean>(false);
  const [timeZone, setTimeZone] = useState('');
  const numericFormatter = useMemo(() => numberFormatter(user?.locale), [numberFormatter, user?.locale]);

  const [invalidFields, setInvalidFields] = useState<Record<'germinating' | 'notReady' | 'ready', string>>({
    germinating: '',
    notReady: '',
    ready: '',
  });

  const hasErrors = useCallback(() => {
    if (record) {
      // if we have a pre-determined error
      if (Object.values(invalidFields).some((val: string) => val !== '')) {
        return true;
      }

      // There must be at least 1 seed in the batch
      const seedCount = QUANTITY_FIELDS.reduce(
        (acc: number, field: QuantityField): number => acc + (record[field] ? Number(record[field]) : 0),
        0
      );

      if (seedCount === 0) {
        snackBar.toastError(strings.ERROR_BATCH_SEED_COUNT);
        return true;
      }

      return MANDATORY_FIELDS.some((field: MandatoryField) => record[field] === '' || record[field] === undefined);
    }

    return true;
  }, [invalidFields, record, snackBar]);

  const handleBatchValidation = useCallback(
    (savableRecord: SavableFormRecord) => {
      if (hasErrors()) {
        setValidateFields(true);
        onBatchValidated(false);
        return;
      }

      onBatchValidated({
        batch: savableRecord as SavableBatch,
        organizationId: selectedOrganization.id,
        timezone: timeZone,
      });
    },
    [hasErrors, onBatchValidated, selectedOrganization.id, timeZone]
  );

  const accessionQuantity = useMemo<{ value: number; display?: string } | undefined>(() => {
    if (!selectedAccession || selectedAccession.remainingQuantity === undefined) {
      return undefined;
    }

    if (selectedAccession.remainingUnits === 'Seeds') {
      return {
        value: Number(selectedAccession['remainingQuantity(raw)']),
        display: selectedAccession.remainingQuantity,
      };
    }

    return {
      value: Number(selectedAccession['estimatedCount(raw)']),
      display: selectedAccession.estimatedCount,
    };
  }, [selectedAccession]);

  useEffect(() => {
    if (!facilityId) {
      return;
    }

    const facility = FacilityService.getFacility({
      organization: selectedOrganization,
      facilityId,
      type: 'Nursery',
    });

    const tz = locationTimezone.get(facility);
    setTimeZone(tz.id);
  }, [facilityId, record?.facilityId, locationTimezone, selectedOrganization]);

  useEffect(() => {
    if (record) {
      const notReadyQuantity = record?.notReadyQuantity ?? 0;
      const readyQuantity = record?.readyQuantity ?? 0;
      setTotalQuantity(+notReadyQuantity + +readyQuantity);
    }
  }, [record]);

  useEffect(() => {
    setRecord((previousRecord: FormRecord): FormRecord => {
      if (!previousRecord) {
        return previousRecord;
      }

      return {
        ...previousRecord,
        addedDate: addedDateChanged ? previousRecord.addedDate : getTodaysDateFormatted(timeZone),
      };
    });
  }, [timeZone, setRecord, addedDateChanged]);

  useEffect(() => {
    if (record) {
      return;
    }

    const newBatch: Partial<CreateBatchRequestPayload> = {
      addedDate: getTodaysDateFormatted(),
      germinatingQuantity: 0,
      notReadyQuantity: 0,
      readyQuantity: 0,
      facilityId,
      speciesId,
    };

    const initBatch = () => ({
      ...newBatch,
      id: -1,
      batchNumber: '',
      latestObservedTime: '',
      version: 0,
    });

    setRecord(initBatch());
  }, [setRecord, selectedOrganization, facilityId, speciesId, record]);

  useEffect(() => {
    if (record && doValidateBatch) {
      handleBatchValidation(record);
    }
  }, [record, doValidateBatch, handleBatchValidation]);

  const gridSize = () => (isMobile ? 12 : 6);

  const paddingSeparator = () => (isMobile ? 0 : 1.5);

  const changeDate = (id: string, value?: any) => {
    setAddedDateChanged(id === 'addedDate');
    const date = value ? getDateDisplayValue(value.getTime(), timeZone) : null;
    onChange(id, date);
  };

  const marginTop = {
    marginTop: theme.spacing(0.5),
  };

  const dropdownPadding = theme.spacing(0.5, 0, 1, 2);

  const isUndefinedQuantity = (val?: string | number) => val === undefined || val === '';

  // when sublocations change, clear current sublocations in the record
  useEffect(() => {
    // if this is a read-only view of an existing batch, don't update the sublocations
    if (record?.id !== -1) {
      return;
    }
    setRecord((previousRecord: FormRecord): FormRecord => {
      if (!previousRecord) {
        return previousRecord;
      }

      return {
        ...previousRecord,
        subLocationIds: [],
      };
    });
  }, [availableSubLocations, record?.id, setRecord]);

  useEffect(() => {
    const invalid = { germinating: '', notReady: '', ready: '' };
    if (selectedAccession) {
      const germinatingQuantity = Number(record?.germinatingQuantity ?? 0);
      const notReadyQuantity = Number(record?.notReadyQuantity ?? 0);
      const readyQuantity = Number(record?.readyQuantity ?? 0);
      const remainingSeeds = accessionQuantity?.value ?? 0;

      if (germinatingQuantity + totalQuantity > remainingSeeds) {
        // a L -> R analysis of which inputs to mark as invalid
        if (germinatingQuantity && germinatingQuantity > remainingSeeds) {
          invalid.germinating = strings.NOT_ENOUGH_SEEDS_IN_ACCESSION;
        }
        if (notReadyQuantity && germinatingQuantity + notReadyQuantity > remainingSeeds) {
          invalid.notReady = strings.NOT_ENOUGH_SEEDS_IN_ACCESSION;
        }
        if (readyQuantity && germinatingQuantity + notReadyQuantity + readyQuantity > remainingSeeds) {
          invalid.ready = strings.NOT_ENOUGH_SEEDS_IN_ACCESSION;
        }
      }
    }
    setInvalidFields(invalid);
  }, [
    accessionQuantity,
    record?.germinatingQuantity,
    record?.notReadyQuantity,
    record?.readyQuantity,
    selectedAccession,
    totalQuantity,
  ]);

  return (
    <>
      {record && (
        <>
          <Grid container item xs={12} spacing={1} textAlign='left'>
            {['InventoryAdd', 'Nursery'].includes(origin) && (
              <Grid item xs={12} padding={dropdownPadding}>
                <SpeciesDropdown<FormRecord> record={record} setRecord={setRecord} validateFields={validateFields} />
              </Grid>
            )}

            <Grid item xs={12} padding={dropdownPadding}>
              <AccessionsDropdown<FormRecord>
                availableAccessions={availableAccessions}
                record={record}
                setRecord={setRecord}
              />
              {selectedAccession && (
                <Box display='flex' justifyContent='space-between' flexDirection={isMobile ? 'column' : 'row'}>
                  <Typography fontSize='14px' fontWeight={400} marginTop={1}>
                    {strings.STATE}: {stateName(selectedAccession.state)}
                  </Typography>
                  {accessionQuantity === undefined && (
                    <Typography fontSize='14px' fontWeight={400} marginTop={1}>
                      {strings.NO_QUANTITY_SET}
                    </Typography>
                  )}
                  {accessionQuantity !== undefined && (
                    <Typography fontSize='14px' fontWeight={400} marginTop={1}>
                      {strings.REMAINING_SEEDS}: {accessionQuantity.display}
                    </Typography>
                  )}
                </Box>
              )}
            </Grid>

            {['InventoryAdd', 'Species'].includes(origin) && (
              <Grid item xs={12} padding={dropdownPadding}>
                <NurseryDropdownV2
                  availableNurseries={availableNurseries}
                  record={record}
                  setRecord={setRecord}
                  validateFields={validateFields}
                />
              </Grid>
            )}

            {availableSubLocations && availableSubLocations.length > 0 && (
              <Grid item xs={12} padding={dropdownPadding}>
                <SubLocationsDropdown<FormRecord>
                  availableSubLocations={availableSubLocations}
                  record={record}
                  setRecord={setRecord}
                />
              </Grid>
            )}

            {featureFlagProjects && (
              <Grid item xs={12} padding={dropdownPadding}>
                <ProjectsDropdown<FormRecord>
                  availableProjects={availableProjects}
                  record={record}
                  setRecord={setRecord}
                />
              </Grid>
            )}

            <Grid item xs={gridSize()} paddingLeft={paddingSeparator}>
              <DatePicker
                id='addedDate'
                label={strings.DATE_ADDED_REQUIRED}
                aria-label={strings.DATE_ADDED}
                value={record.addedDate}
                onChange={(value) => changeDate('addedDate', value)}
                defaultTimeZone={timeZone}
              />
            </Grid>

            <Grid item xs={12} sx={marginTop}>
              <Divider />
            </Grid>

            <Grid
              item
              xs={gridSize()}
              paddingRight={paddingSeparator}
              sx={{ ...marginTop, marginRight: isMobile ? 0 : theme.spacing(2) }}
            >
              <Textfield
                id='germinatingQuantity'
                value={record.germinatingQuantity}
                onChange={(value) => onChange('germinatingQuantity', value)}
                type='number'
                label={strings.GERMINATING_QUANTITY_REQUIRED}
                tooltipTitle={strings.TOOLTIP_GERMINATING_QUANTITY}
                errorText={
                  validateFields
                    ? isUndefinedQuantity(record.germinatingQuantity)
                      ? strings.REQUIRED_FIELD
                      : invalidFields.germinating
                    : ''
                }
                min={0}
                disabledCharacters={['.']}
              />
            </Grid>

            <Grid item xs={gridSize()} sx={marginTop} paddingRight={paddingSeparator}>
              <Textfield
                id='notReadyQuantity'
                value={record.notReadyQuantity}
                onChange={(value) => onChange('notReadyQuantity', value)}
                type='number'
                label={strings.NOT_READY_QUANTITY_REQUIRED}
                tooltipTitle={strings.TOOLTIP_NOT_READY_QUANTITY}
                errorText={
                  validateFields
                    ? isUndefinedQuantity(record.notReadyQuantity)
                      ? strings.REQUIRED_FIELD
                      : invalidFields.notReady
                    : ''
                }
                min={0}
                disabledCharacters={['.']}
              />
            </Grid>

            <Grid item xs={gridSize()} sx={marginTop} paddingLeft={paddingSeparator}>
              <DatePicker
                id='readyByDate'
                label={strings.ESTIMATED_READY_DATE}
                aria-label={strings.ESTIMATED_READY_DATE}
                value={record.readyByDate}
                onChange={(value) => changeDate('readyByDate', value)}
                defaultTimeZone={timeZone}
              />
            </Grid>

            <Grid item xs={gridSize()} sx={marginTop} paddingRight={paddingSeparator}>
              <Textfield
                id='readyQuantity'
                value={record.readyQuantity}
                onChange={(value) => onChange('readyQuantity', value)}
                type='number'
                label={strings.READY_QUANTITY_REQUIRED}
                tooltipTitle={strings.TOOLTIP_READY_QUANTITY}
                errorText={
                  validateFields
                    ? isUndefinedQuantity(record.readyQuantity)
                      ? strings.REQUIRED_FIELD
                      : invalidFields.ready
                    : ''
                }
                min={0}
                disabledCharacters={['.']}
              />
            </Grid>

            <Grid item xs={gridSize()} sx={marginTop} paddingLeft={paddingSeparator} />

            <Grid item xs={gridSize()} sx={marginTop} paddingRight={paddingSeparator}>
              <Textfield
                id='totalQuantity'
                value={numericFormatter.format(totalQuantity)}
                type='text'
                label={strings.TOTAL_QUANTITY}
                display={true}
                tooltipTitle={strings.TOOLTIP_TOTAL_QUANTITY}
              />
            </Grid>

            <Grid item xs={12} sx={marginTop}>
              <Divider />
            </Grid>

            <Grid item xs={12} padding={theme.spacing(3, 0, 1, 2)}>
              <Textfield
                id='notes'
                value={record?.notes}
                onChange={(value) => onChange('notes', value)}
                type='textarea'
                label={strings.NOTES}
              />
            </Grid>
          </Grid>
        </>
      )}
    </>
  );
}
