import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { Divider, Grid, Typography, useTheme } from '@mui/material';
import { Textfield } from '@terraware/web-components';
import { useDeviceInfo } from '@terraware/web-components/utils';
import getDateDisplayValue, { getTodaysDateFormatted } from '@terraware/web-components/utils/date';
import DatePicker from 'src/components/common/DatePicker';
import strings from 'src/strings';
import useForm from 'src/utils/useForm';
import { CreateBatchRequestPayload } from 'src/types/Batch';
import { useOrganization } from 'src/providers/hooks';
import { useLocationTimeZone } from 'src/utils/useTimeZoneUtils';
import { useNumberFormatter } from 'src/utils/useNumber';
import { useUser } from 'src/providers';
import FacilityService from 'src/services/FacilityService';
import { APP_PATHS } from 'src/constants';
import Link from 'src/components/common/Link';
import { NurseryBatchesSearchResponseElement, UpdateBatchRequestPayloadWithId } from 'src/services/NurseryBatchService';
import isEnabled from 'src/features';
import { SavableBatch } from 'src/redux/features/batches/batchesAsyncThunks';
import useSnackbar from 'src/utils/useSnackbar';
import { useSubLocations } from 'src/components/InventoryV2/form/useSubLocations';
import SubLocationsDropdown from 'src/components/InventoryV2/form/SubLocationsDropdown';
import { useAccessions } from 'src/components/InventoryV2/form/useAccessions';
import AccessionsDropdown from 'src/components/InventoryV2/form/AccessionsDropdown';
import { useSpecies } from 'src/components/InventoryV2/form/useSpecies';
import SpeciesDropdown from 'src/components/InventoryV2/form/SpeciesDropdown';
import { useNurseries } from 'src/components/InventoryV2/form/useNurseries';
import NurseryDropdownV2 from 'src/components/InventoryV2/form/NurseryDropdownV2';
import { useProjects } from 'src/components/InventoryV2/form/useProjects';
import ProjectsDropdown from 'src/components/InventoryV2/form/ProjectsDropdown';
import { OriginPage } from 'src/components/InventoryV2/InventoryBatch';

export interface BatchDetailsFormProps {
  doValidateBatch: boolean;
  onBatchValidated: (batchDetails: { batch: SavableBatch; organizationId: number; timezone: string } | false) => void;
  origin: OriginPage;
  originId?: number;
  selectedBatch?: NurseryBatchesSearchResponseElement;
}

type FormRecord = Partial<SavableBatch> | undefined;
type SavableFormRecord = Partial<SavableBatch>;

const convertSelectedBatchToFormRecord = (input: NurseryBatchesSearchResponseElement | undefined): FormRecord =>
  !input
    ? input
    : ({
        accessionId: input.accession_id ? Number(input.accession_id) : undefined,
        addedDate: input.addedDate,
        batchNumber: input.batchNumber,
        facilityId: Number(input.facility_id),
        germinatingQuantity: Number(input['germinatingQuantity(raw)']),
        id: Number(input.id),
        notes: input.notes,
        notReadyQuantity: Number(input['notReadyQuantity(raw)']),
        projectId: Number(input.project_id),
        readyQuantity: Number(input['readyQuantity(raw)']),
        readyByDate: input.readyByDate,
        speciesId: Number(input.species_id),
        subLocationIds: (input.subLocations || []).map((subLocation) => Number(subLocation.subLocation_id)),
        version: Number(input.version),
      } as Partial<CreateBatchRequestPayload | UpdateBatchRequestPayloadWithId>);

const QUANTITY_FIELDS = ['germinatingQuantity', 'notReadyQuantity', 'readyQuantity'] as const;

type QuantityField = (typeof QUANTITY_FIELDS)[number];

const MANDATORY_FIELDS = ['addedDate', 'facilityId', ...QUANTITY_FIELDS, 'speciesId'] as const;

type MandatoryField = (typeof MANDATORY_FIELDS)[number];

export default function BatchDetailsForm(props: BatchDetailsFormProps): JSX.Element {
  const { onBatchValidated, doValidateBatch, selectedBatch, originId, origin } = props;

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

  const { availableSubLocations, selectedSubLocations } = useSubLocations(facilityId, record);
  const { selectedSpecies } = useSpecies(record);
  const { availableAccessions, selectedAccession } = useAccessions(record, selectedSpecies?.id ?? speciesId, true);
  const { availableNurseries, selectedNursery } = useNurseries(record);
  const { availableProjects, selectedProject } = useProjects(record);

  const [totalQuantity, setTotalQuantity] = useState(0);
  const [addedDateChanged, setAddedDateChanged] = useState(false);
  const [validateFields, setValidateFields] = useState<boolean>(false);
  const [timeZone, setTimeZone] = useState('');
  const numericFormatter = useMemo(() => numberFormatter(user?.locale), [numberFormatter, user?.locale]);

  const hasErrors = useCallback(() => {
    if (record) {
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
  }, [record, snackBar]);

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

    const initBatch = () =>
      selectedBatch
        ? convertSelectedBatchToFormRecord(selectedBatch)
        : {
            ...newBatch,
            id: -1,
            batchNumber: '',
            latestObservedTime: '',
            version: 0,
          };

    setRecord(initBatch());
  }, [selectedBatch, setRecord, selectedOrganization, facilityId, speciesId, record]);

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

  return (
    <>
      {record && (
        <>
          {record.id !== -1 && (
            <Grid container item xs={12} spacing={2} textAlign='left'>
              <Grid item xs={gridSize()} sx={marginTop} paddingRight={paddingSeparator}>
                {selectedSpecies && (
                  <Textfield
                    id='scientificName'
                    value={selectedSpecies?.scientificName}
                    type='text'
                    label={strings.SPECIES}
                    display={true}
                  />
                )}
              </Grid>
              <Grid item xs={gridSize()} sx={marginTop} paddingLeft={paddingSeparator}>
                {selectedSpecies && (
                  <Textfield
                    id='commonName'
                    value={selectedSpecies?.commonName}
                    type='text'
                    label={strings.COMMON_NAME}
                    display={true}
                  />
                )}
              </Grid>

              {selectedAccession && (
                <Grid item xs={gridSize()} sx={marginTop} paddingLeft={paddingSeparator}>
                  <Typography sx={{ color: theme.palette.TwClrTxtSecondary, fontSize: '14px' }}>
                    {strings.ACCESSION}
                  </Typography>

                  <Link
                    to={APP_PATHS.ACCESSIONS2_ITEM.replace(':accessionId', selectedAccession.id.toString())}
                    target='_blank'
                  >
                    {selectedAccession.accessionNumber}
                  </Link>
                </Grid>
              )}

              {selectedNursery && (
                <Grid item xs={gridSize()} sx={marginTop} paddingRight={paddingSeparator}>
                  <Textfield
                    id='facilityId'
                    value={selectedNursery.name}
                    type='text'
                    label={strings.NURSERY}
                    display={true}
                  />
                </Grid>
              )}

              {selectedSubLocations && (
                <Grid item xs={gridSize()} sx={marginTop} paddingRight={paddingSeparator}>
                  <Textfield
                    id='subLocationIds'
                    value={selectedSubLocations.map((selectedSubLocation) => selectedSubLocation.name).join(', ')}
                    type='text'
                    label={strings.SUB_LOCATIONS}
                    display={true}
                  />
                </Grid>
              )}

              {featureFlagProjects && selectedProject && (
                <Grid item xs={gridSize()} sx={marginTop} paddingRight={paddingSeparator}>
                  <Textfield
                    id='projectId'
                    value={selectedProject.name}
                    type='text'
                    label={strings.PROJECT}
                    display={true}
                  />
                </Grid>
              )}
            </Grid>
          )}

          <Grid container item xs={12} spacing={1} textAlign='left'>
            {record.id === -1 && (
              <>
                {['InventoryAdd', 'Nursery'].includes(origin) && (
                  <Grid item xs={12} padding={dropdownPadding}>
                    <SpeciesDropdown<FormRecord>
                      record={record}
                      setRecord={setRecord}
                      validateFields={validateFields}
                    />
                  </Grid>
                )}

                <Grid item xs={12} padding={dropdownPadding}>
                  <AccessionsDropdown<FormRecord>
                    availableAccessions={availableAccessions}
                    record={record}
                    setRecord={setRecord}
                  />
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
              </>
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
                  validateFields && isUndefinedQuantity(record.germinatingQuantity) ? strings.REQUIRED_FIELD : ''
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
                errorText={validateFields && isUndefinedQuantity(record.notReadyQuantity) ? strings.REQUIRED_FIELD : ''}
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
                errorText={validateFields && isUndefinedQuantity(record.readyQuantity) ? strings.REQUIRED_FIELD : ''}
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
