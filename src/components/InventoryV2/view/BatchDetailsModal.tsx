import React, { useEffect, useState, useMemo } from 'react';
import { Divider, Grid, Typography, useTheme } from '@mui/material';
import { Button, DialogBox, Textfield } from '@terraware/web-components';
import { useDeviceInfo } from '@terraware/web-components/utils';
import getDateDisplayValue, { getTodaysDateFormatted } from '@terraware/web-components/utils/date';
import DatePicker from 'src/components/common/DatePicker';
import strings from 'src/strings';
import useForm from 'src/utils/useForm';
import useSnackbar from 'src/utils/useSnackbar';
import { Batch, CreateBatchRequestPayload, isBatch, NurseryTransfer } from 'src/types/Batch';
import { NurseryBatchService } from 'src/services';
import { useOrganization } from 'src/providers/hooks';
import { useLocationTimeZone } from 'src/utils/useTimeZoneUtils';
import { useNumberFormatter } from 'src/utils/useNumber';
import { useUser } from 'src/providers';
import FacilityService from 'src/services/FacilityService';
import { APP_PATHS } from 'src/constants';
import Link from 'src/components/common/Link';
import { Response } from 'src/services/HttpService';
import AccessionService from 'src/services/AccessionService';
import { BatchData, BatchId, NurseryBatchesSearchResponseElement } from 'src/services/NurseryBatchService';
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

export interface BatchDetailsModalProps {
  onClose: () => void;
  reload: () => void;
  selectedBatch: NurseryBatchesSearchResponseElement | undefined;
  originId?: number;
  origin: OriginPage;
}

type FormRecord = Partial<CreateBatchRequestPayload & Batch> | undefined;

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
      } as Partial<CreateBatchRequestPayload>);

export default function BatchDetailsModal(props: BatchDetailsModalProps): JSX.Element {
  const { onClose, reload, selectedBatch, originId, origin } = props;

  const numberFormatter = useNumberFormatter();
  const { user } = useUser();
  const { selectedOrganization } = useOrganization();
  const snackbar = useSnackbar();
  const theme = useTheme();
  const { isMobile } = useDeviceInfo();
  const locationTimezone = useLocationTimeZone();
  const [record, setRecord, onChange] = useForm<FormRecord>(undefined);

  const facilityId = origin === 'Nursery' ? originId : record?.facilityId;
  const speciesId = origin === 'Species' ? originId : record?.speciesId;

  const { availableSubLocations, selectedSubLocations } = useSubLocations(facilityId, record);
  const { availableAccessions, selectedAccession } = useAccessions(record);
  const { availableSpecies, selectedSpecies } = useSpecies(record);
  const { availableNurseries, selectedNursery } = useNurseries(record);
  const { availableProjects, selectedProject } = useProjects(record);

  const [totalQuantity, setTotalQuantity] = useState(0);
  const [addedDateChanged, setAddedDateChanged] = useState(false);
  const [validateFields, setValidateFields] = useState<boolean>(false);
  const [multiStepRequestInFlight, setMultiStepRequestInFlight] = useState<boolean>(false);
  const [timeZone, setTimeZone] = useState('');
  const numericFormatter = useMemo(() => numberFormatter(user?.locale), [numberFormatter, user?.locale]);

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
  }, [selectedBatch, setRecord, selectedOrganization, facilityId, speciesId]);

  useEffect(() => {
    const onWindowBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();

      // This message does not seem to always make it to the alert
      event.returnValue = window.confirm(strings.CONFIRM_IN_FLIGHT_REQUEST);
    };

    if (multiStepRequestInFlight) {
      window.addEventListener('beforeunload', onWindowBeforeUnload);
    }

    return () => window.removeEventListener('beforeunload', onWindowBeforeUnload);
  }, [multiStepRequestInFlight]);

  const MANDATORY_FIELDS = [
    'facilityId',
    'speciesId',
    'germinatingQuantity',
    'notReadyQuantity',
    'readyQuantity',
    'addedDate',
  ] as const;
  type MandatoryField = (typeof MANDATORY_FIELDS)[number];

  const hasErrors = () => {
    if (record) {
      return MANDATORY_FIELDS.some((field: MandatoryField) => record[field] === '' || record[field] === undefined);
    }
    return true;
  };

  const saveBatch = async () => {
    if (record) {
      if (hasErrors()) {
        setValidateFields(true);
        return;
      }

      let response: (Response & BatchData) | (Response & BatchId) | undefined;
      let responseQuantities: Partial<Response> = { requestSucceeded: true, error: undefined };

      if (record.id === -1) {
        if (record.accessionId) {
          setMultiStepRequestInFlight(true);

          const nurseryTransferRecord: NurseryTransfer = {
            date: getTodaysDateFormatted(timeZone),
            destinationFacilityId: Number(record.facilityId),
            germinatingQuantity: Number(record.germinatingQuantity),
            notReadyQuantity: Number(record.notReadyQuantity),
            notes: record.notes,
            readyByDate: record.readyByDate,
            readyQuantity: Number(record.readyQuantity),
          };
          const accessionResponse = await AccessionService.transferToNursery(nurseryTransferRecord, record.accessionId);
          if (!accessionResponse.requestSucceeded || !accessionResponse.data) {
            snackbar.toastError(strings.GENERIC_ERROR);
            return;
          }

          record.id = accessionResponse.data.batch.id;
          record.version = accessionResponse.data.batch.version;

          // This is where the sub locations are associated to the batch created through the nursery transfer
          response = await NurseryBatchService.updateBatch(record as Batch);
          if (response.batch) {
            responseQuantities = await NurseryBatchService.updateBatchQuantities({
              ...(record as Batch),
              version: response.batch.version,
            });
          }

          setMultiStepRequestInFlight(false);
        } else {
          response = await NurseryBatchService.createBatch(record as CreateBatchRequestPayload);
        }
      } else if (isBatch(record)) {
        response = await NurseryBatchService.updateBatch(record);
        if (response.batch) {
          responseQuantities = await NurseryBatchService.updateBatchQuantities({
            ...record,
            version: response.batch.version,
          });
        }
      }

      if (response && response.requestSucceeded && responseQuantities.requestSucceeded) {
        reload();
        onCloseHandler();
      } else {
        snackbar.toastError(strings.GENERIC_ERROR);
      }
    }
  };

  const onCloseHandler = () => {
    setValidateFields(false);
    onClose();
  };

  const gridSize = () => (isMobile ? 12 : 6);

  const paddingSeparator = () => (isMobile ? 0 : 1.5);

  const changeDate = (id: string, value?: any) => {
    setAddedDateChanged(id === 'addedDate');
    const date = value ? getDateDisplayValue(value.getTime(), timeZone) : null;
    onChange(id, date);
  };

  const marginTop = {
    marginTop: theme.spacing(2),
  };

  return (
    <>
      {record && (
        <DialogBox
          onClose={onCloseHandler}
          open={true}
          title={record.id === -1 ? strings.ADD_BATCH : strings.BATCH_DETAILS}
          size='large'
          middleButtons={[
            <Button
              id='cancelBatchDetails'
              label={strings.CANCEL}
              type='passive'
              onClick={onCloseHandler}
              priority='secondary'
              key='button-1'
            />,
            <Button id='saveBatchDetails' onClick={saveBatch} label={strings.SAVE} key='button-2' />,
          ]}
          scrolled={true}
        >
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

              {selectedProject && (
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

          <Grid container item xs={12} spacing={2} textAlign='left'>
            {record.id === -1 && (
              <>
                {origin === 'Nursery' && (
                  <Grid item xs={12} padding={theme.spacing(1, 0, 1, 2)}>
                    <SpeciesDropdown<FormRecord>
                      availableSpecies={availableSpecies}
                      record={record}
                      setRecord={setRecord}
                      validateFields={validateFields}
                    />
                  </Grid>
                )}

                <Grid item xs={12} padding={theme.spacing(1, 0, 1, 2)}>
                  <AccessionsDropdown<FormRecord>
                    availableAccessions={availableAccessions}
                    record={record}
                    setRecord={setRecord}
                  />
                </Grid>

                {origin === 'Species' && (
                  <Grid item xs={12} padding={theme.spacing(1, 0, 1, 2)}>
                    <NurseryDropdownV2
                      availableNurseries={availableNurseries}
                      record={record}
                      setRecord={setRecord}
                      validateFields={validateFields}
                    />
                  </Grid>
                )}

                <Grid item xs={12} padding={theme.spacing(1, 0, 1, 2)}>
                  <SubLocationsDropdown<FormRecord>
                    availableSubLocations={availableSubLocations}
                    record={record}
                    setRecord={setRecord}
                  />
                </Grid>

                <Grid item xs={12} padding={theme.spacing(1, 0, 1, 2)}>
                  <ProjectsDropdown<FormRecord>
                    availableProjects={availableProjects}
                    record={record}
                    setRecord={setRecord}
                  />
                </Grid>
              </>
            )}

            <Grid item xs={gridSize()} sx={marginTop} paddingLeft={paddingSeparator}>
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
                onChange={(value) => onChange('germinatingQuantity', Number(value))}
                type='number'
                label={strings.GERMINATING_QUANTITY_REQUIRED}
                tooltipTitle={strings.TOOLTIP_GERMINATING_QUANTITY}
                errorText={validateFields && record.germinatingQuantity === undefined ? strings.REQUIRED_FIELD : ''}
                min={0}
              />
            </Grid>

            <Grid item xs={gridSize()} sx={marginTop} paddingRight={paddingSeparator}>
              <Textfield
                id='notReadyQuantity'
                value={record.notReadyQuantity}
                onChange={(value) => onChange('notReadyQuantity', Number(value))}
                type='number'
                label={strings.NOT_READY_QUANTITY_REQUIRED}
                tooltipTitle={strings.TOOLTIP_NOT_READY_QUANTITY}
                errorText={validateFields && record.notReadyQuantity === undefined ? strings.REQUIRED_FIELD : ''}
                min={0}
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
                onChange={(value) => onChange('readyQuantity', Number(value))}
                type='number'
                label={strings.READY_QUANTITY_REQUIRED}
                tooltipTitle={strings.TOOLTIP_READY_QUANTITY}
                errorText={validateFields && record.readyQuantity === undefined ? strings.REQUIRED_FIELD : ''}
                min={0}
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
        </DialogBox>
      )}
    </>
  );
}
