import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { Divider, Grid, Typography, useTheme } from '@mui/material';
import { Button, DialogBox, Dropdown, Textfield } from '@terraware/web-components';
import { useDeviceInfo } from '@terraware/web-components/utils';
import getDateDisplayValue, { getTodaysDateFormatted } from '@terraware/web-components/utils/date';
import DatePicker from 'src/components/common/DatePicker';
import strings from 'src/strings';
import useForm from 'src/utils/useForm';
import useSnackbar from 'src/utils/useSnackbar';
import { Batch, CreateBatchRequestPayload, isBatch, NurseryTransfer } from 'src/types/Batch';
import { NurseryBatchService, SpeciesService } from 'src/services';
import { Species } from 'src/types/Species';
import { useOrganization } from 'src/providers/hooks';
import { useLocationTimeZone } from 'src/utils/useTimeZoneUtils';
import { SubLocation } from 'src/types/Facility';
import { useNumberFormatter } from 'src/utils/useNumber';
import { useUser } from 'src/providers';
import FacilityService from 'src/services/FacilityService';
import SeedBankService from 'src/services/SeedBankService';
import SubLocationService, { SubLocationsResponse } from 'src/services/SubLocationService';
import { AllSpeciesResponse } from 'src/services/SpeciesService';
import { SearchResponseElement } from 'src/types/Search';
import { APP_PATHS } from 'src/constants';
import Link from 'src/components/common/Link';
import { Response } from 'src/services/HttpService';
import AccessionService from 'src/services/AccessionService';
import { BatchData, BatchId, NurseryBatchesSearchResponseElement } from 'src/services/NurseryBatchService';

export interface BatchDetailsModalProps {
  onClose: () => void;
  reload: () => void;
  selectedBatch: NurseryBatchesSearchResponseElement | undefined;
  nurseryId: number;
}

const SEARCH_FIELDS_ACCESSIONS = ['id', 'accessionNumber', 'speciesName'];
type SearchResponseAccession = {
  id: number;
  accessionNumber: string;
  speciesName: string;
};

type FormRecord = Partial<CreateBatchRequestPayload & Batch> | undefined;

const convertSelectedBatchToFormRecord = (input: NurseryBatchesSearchResponseElement | undefined): FormRecord =>
  !input
    ? input
    : ({
        facilityId: Number(input.facility_id),
        accessionId: input.accession_id ? Number(input.accession_id) : undefined,
        addedDate: input.addedDate,
        batchNumber: input.batchNumber,
        germinatingQuantity: Number(input['germinatingQuantity(raw)']),
        id: Number(input.id),
        notes: input.notes,
        notReadyQuantity: Number(input['notReadyQuantity(raw)']),
        readyQuantity: Number(input['readyQuantity(raw)']),
        readyByDate: input.readyByDate,
        speciesId: Number(input.species_id),
        subLocationIds: (input.subLocations || []).map((subLocation) => Number(subLocation.subLocation_id)),
        version: Number(input.version),
      } as Partial<CreateBatchRequestPayload>);

export default function BatchDetailsModal(props: BatchDetailsModalProps): JSX.Element {
  const { onClose, reload, selectedBatch, nurseryId } = props;

  const numberFormatter = useNumberFormatter();
  const { user } = useUser();
  const { selectedOrganization } = useOrganization();
  const snackbar = useSnackbar();
  const theme = useTheme();
  const { isMobile } = useDeviceInfo();
  const [record, setRecord, onChange] = useForm<FormRecord>(undefined);

  const [availableSpecies, setAvailableSpecies] = useState<Species[]>([]);
  const [selectedSpecies, setSelectedSpecies] = useState<Species>();
  const [availableAccessions, setAvailableAccessions] = useState<SearchResponseAccession[]>([]);
  const [selectedAccession, setSelectedAccession] = useState<SearchResponseAccession>();
  const [availableSubLocations, setAvailableSubLocations] = useState<SubLocation[]>([]);
  const [selectedSubLocations, setSelectedSubLocations] = useState<SubLocation[]>();
  const [totalQuantity, setTotalQuantity] = useState(0);
  const [addedDateChanged, setAddedDateChanged] = useState(false);
  const [validateFields, setValidateFields] = useState<boolean>(false);

  const facility = FacilityService.getFacility({
    organization: selectedOrganization,
    facilityId: nurseryId,
    type: 'Nursery',
  });
  const tz = useLocationTimeZone().get(facility);
  const [timeZone, setTimeZone] = useState(tz.id);

  const numericFormatter = useMemo(() => numberFormatter(user?.locale), [numberFormatter, user?.locale]);

  const initSpecies = useCallback(async () => {
    const result: AllSpeciesResponse = await SpeciesService.getAllSpecies(selectedOrganization.id);
    if (!result.requestSucceeded || !result.species) {
      snackbar.toastError(strings.ERROR_LOAD_SPECIES);
      return;
    }

    setAvailableSpecies(result.species);
  }, [selectedOrganization.id, snackbar]);

  const initAccessions = useCallback(async () => {
    const results: SearchResponseElement[] | null = await SeedBankService.searchAccessions({
      organizationId: selectedOrganization.id,
      fields: SEARCH_FIELDS_ACCESSIONS,
    });

    if (!results?.length) {
      return;
    }

    setAvailableAccessions(results as SearchResponseAccession[]);
  }, [selectedOrganization.id]);

  const initSubLocations = useCallback(async () => {
    const result: SubLocationsResponse = await SubLocationService.getSubLocations(nurseryId);
    if (!result.requestSucceeded || !result.subLocations) {
      snackbar.toastError(strings.ERROR_LOAD_SUB_LOCATIONS);
      return;
    }

    setAvailableSubLocations(result.subLocations);
  }, [nurseryId, snackbar]);

  const populateDropdowns = useCallback(async () => {
    void (await Promise.allSettled([initSpecies(), initAccessions(), initSubLocations()]));
  }, [initSpecies, initAccessions, initSubLocations]);

  useEffect(() => {
    void populateDropdowns();
  }, [populateDropdowns]);

  useEffect(() => {
    if (record) {
      const notReadyQuantity = record?.notReadyQuantity ?? 0;
      const readyQuantity = record?.readyQuantity ?? 0;
      setTotalQuantity(+notReadyQuantity + +readyQuantity);
    }
  }, [record, populateDropdowns]);

  useEffect(() => {
    if (availableSpecies && selectedBatch?.species_id) {
      setSelectedSpecies(
        availableSpecies.find((singleSpecies) => singleSpecies.id.toString() === selectedBatch.species_id)
      );
    }
  }, [availableSpecies, selectedBatch?.species_id]);

  useEffect(() => {
    if (availableAccessions && selectedBatch?.accession_id) {
      setSelectedAccession(
        availableAccessions.find((accession) => accession.id.toString() === selectedBatch.accession_id)
      );
    }
  }, [availableAccessions, selectedBatch?.accession_id]);

  useEffect(() => {
    if (availableSubLocations && selectedBatch?.subLocations) {
      setSelectedSubLocations(
        availableSubLocations.filter((subLocation) =>
          (selectedBatch.subLocations || []).find(
            (batchSubLocation) => subLocation.id.toString() === batchSubLocation.subLocation_id
          )
        )
      );
    }
  }, [availableSubLocations, selectedBatch?.subLocations]);

  useEffect(() => {
    if (timeZone !== tz.id) {
      setTimeZone(tz.id);
    }
  }, [tz.id, timeZone]);

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
      facilityId: nurseryId,
      speciesId: undefined,
      germinatingQuantity: undefined,
      notReadyQuantity: undefined,
      readyQuantity: undefined,
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
  }, [selectedBatch, nurseryId, setRecord, selectedOrganization]);

  const MANDATORY_FIELDS = [
    'facilityId',
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
        if (record.accessionId && isBatch(record)) {
          const nurseryTransferRecord: NurseryTransfer = {
            date: getTodaysDateFormatted(timeZone),
            destinationFacilityId: record.facilityId,
            germinatingQuantity: record.germinatingQuantity,
            notReadyQuantity: record.notReadyQuantity,
            notes: record.notes,
            readyByDate: record.readyByDate,
            readyQuantity: record.readyQuantity,
          };
          const accessionResponse = await AccessionService.transferToNursery(nurseryTransferRecord, record.accessionId);
          if (!accessionResponse.requestSucceeded || !accessionResponse.data) {
            snackbar.toastError(strings.GENERIC_ERROR);
            return;
          }

          record.id = accessionResponse.data.batch.id;
          record.version = accessionResponse.data.batch.version;

          // This is where the sub locations are associated to the batch created through the nursery transfer
          response = await NurseryBatchService.updateBatch(record);
          if (response.batch) {
            responseQuantities = await NurseryBatchService.updateBatchQuantities({
              ...record,
              version: response.batch.version,
            });
          }
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
    const date = value ? getDateDisplayValue(value.getTime(), tz.id) : null;
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

              {selectedSubLocations && (
                <Grid item xs={gridSize()} sx={marginTop} paddingRight={paddingSeparator}>
                  <Textfield
                    id='subLocationIds'
                    value={selectedSubLocations.map((selectedSubLocation) => selectedSubLocation.name).join(', ')}
                    type='text'
                    label={strings.SUB_LOCATION}
                    display={true}
                  />
                </Grid>
              )}
            </Grid>
          )}

          <Grid container item xs={12} spacing={2} textAlign='left'>
            {record.id === -1 && (
              <>
                <Grid item xs={12} padding={theme.spacing(1, 0, 1, 2)}>
                  <Dropdown
                    id='speciesId'
                    label={strings.SPECIES}
                    selectedValue={record.speciesId}
                    options={availableSpecies.map((species) => ({ label: species.scientificName, value: species.id }))}
                    onChange={(speciesId: string) =>
                      setRecord((previousValue) => ({ ...previousValue, speciesId: Number(speciesId) }))
                    }
                    errorText={validateFields && !record.speciesId ? strings.REQUIRED_FIELD : ''}
                    fullWidth
                    required
                  />
                </Grid>

                <Grid item xs={12} padding={theme.spacing(1, 0, 1, 2)}>
                  <Dropdown
                    id='accessionId'
                    label={strings.ACCESSION}
                    selectedValue={record.accessionId}
                    options={availableAccessions.map((accession) => ({
                      label: `${accession.accessionNumber}`,
                      value: Number(accession.id),
                    }))}
                    onChange={(accessionId: string) =>
                      setRecord((previousValue) => ({
                        ...previousValue,
                        accessionId: Number(accessionId),
                      }))
                    }
                    fullWidth
                  />
                </Grid>

                <Grid item xs={12} padding={theme.spacing(1, 0, 1, 2)}>
                  <Dropdown
                    id='subLocationIds'
                    label={strings.SUB_LOCATION}
                    selectedValue={record.subLocationIds ? record.subLocationIds[0] : record.subLocationIds}
                    options={availableSubLocations.map((subLocation) => ({
                      label: subLocation.name,
                      value: subLocation.id,
                    }))}
                    onChange={(subLocationId: string) =>
                      setRecord((previousValue) => ({
                        ...previousValue,
                        subLocationIds: [Number(subLocationId)],
                      }))
                    }
                    fullWidth
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
                errorText={validateFields && !record.germinatingQuantity ? strings.REQUIRED_FIELD : ''}
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
                errorText={validateFields && !record.notReadyQuantity ? strings.REQUIRED_FIELD : ''}
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
                errorText={validateFields && !record.readyQuantity ? strings.REQUIRED_FIELD : ''}
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

            <Grid padding={theme.spacing(3, 0, 1, 2)} xs={12}>
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
