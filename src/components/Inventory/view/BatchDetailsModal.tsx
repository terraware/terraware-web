import { Divider, Grid, Typography, useTheme } from '@mui/material';
import { Button, DatePicker, DialogBox, Textfield } from '@terraware/web-components';
import strings from 'src/strings';
import useForm from 'src/utils/useForm';
import { useEffect, useState } from 'react';
import useSnackbar from 'src/utils/useSnackbar';
import { useDeviceInfo } from '@terraware/web-components/utils';
import NurseryDropdown from '../NurseryDropdown';
import { Batch, CreateBatchRequestPayload } from 'src/types/Batch';
import { NurseryBatchService } from 'src/services';
import { getSpecies } from 'src/api/species/species';
import { Species } from 'src/types/Species';
import { APP_PATHS } from 'src/constants';
import Link from 'src/components/common/Link';
import { useOrganization } from 'src/providers/hooks';
import isEnabled from 'src/features';
import { useLocationTimeZone } from 'src/utils/useTimeZoneUtils';
import { Facility } from 'src/types/Facility';
import { getNurseryById } from 'src/utils/organization';
import getDateDisplayValue, { getTodaysDateFormatted } from '@terraware/web-components/utils/date';

export interface BatchDetailsModalProps {
  open: boolean;
  onClose: () => void;
  reload: () => void;
  selectedBatch: any;
  speciesId: number;
}

export default function BatchDetailsModal(props: BatchDetailsModalProps): JSX.Element {
  const { selectedOrganization } = useOrganization();
  const { onClose, open, reload, selectedBatch, speciesId } = props;

  const [record, setRecord, onChange] = useForm(selectedBatch);
  const snackbar = useSnackbar();
  const theme = useTheme();
  const [validateFields, setValidateFields] = useState<boolean>(false);

  const { isMobile } = useDeviceInfo();
  const [totalQuantity, setTotalQuantity] = useState(0);
  const [speciesSelected, setSpeciesSelected] = useState<Species>();
  const [facility, setFacility] = useState<Facility>();

  const timeZoneFeatureEnabled = isEnabled('Timezones');
  const tz = useLocationTimeZone().get(timeZoneFeatureEnabled ? facility : undefined);
  const [timeZone, setTimeZone] = useState(tz.id);

  const [addedDateChanged, setAddedDateChanged] = useState(false);

  useEffect(() => {
    if (record) {
      const populateSpecies = async () => {
        const speciesResponse = await getSpecies(speciesId, selectedOrganization.id.toString());
        if (speciesResponse.requestSucceeded) {
          setSpeciesSelected(speciesResponse.species);
        }
      };

      setTotalQuantity(
        (isNaN(record.notReadyQuantity) ? 0 : Number(record.notReadyQuantity)) +
          (isNaN(record.readyQuantity) ? 0 : Number(record.readyQuantity))
      );

      populateSpecies();
    }
  }, [record, selectedOrganization, speciesId]);

  useEffect(() => {
    if (record?.facilityId) {
      const newFacility = getNurseryById(selectedOrganization, record.facilityId);
      if (newFacility.id.toString() !== facility?.id.toString()) {
        setFacility(newFacility);
      }
    }
  }, [record?.facilityId, selectedOrganization, facility?.id]);

  useEffect(() => {
    if (timeZone !== tz.id) {
      setTimeZone(tz.id);
    }
  }, [tz.id, timeZone]);

  useEffect(() => {
    setRecord((previousRecord: CreateBatchRequestPayload): CreateBatchRequestPayload => {
      return {
        ...previousRecord,
        addedDate: addedDateChanged ? previousRecord.addedDate : getTodaysDateFormatted(timeZone),
      };
    });
  }, [timeZone, setRecord, addedDateChanged]);

  useEffect(() => {
    const newBatch: CreateBatchRequestPayload = {
      addedDate: getTodaysDateFormatted(),
      facilityId: undefined,
      speciesId,
      germinatingQuantity: undefined,
      notReadyQuantity: undefined,
      readyQuantity: undefined,
    } as unknown as CreateBatchRequestPayload;
    const initBatch = () => {
      if (selectedBatch) {
        return selectedBatch;
      } else {
        return {
          ...newBatch,
          id: -1,
          batchNumber: '',
          latestObservedTime: '',
          version: 0,
        };
      }
    };

    setRecord(initBatch());

    const foundFacility = selectedOrganization.facilities?.find(
      (f) => f.id.toString() === selectedBatch?.facilityId.toString()
    );
    if (foundFacility) {
      setFacility(foundFacility);
    }
  }, [selectedBatch, speciesId, setRecord, selectedOrganization, open]);

  const MANDATORY_FIELDS = [
    'facilityId',
    'germinatingQuantity',
    'notReadyQuantity',
    'readyQuantity',
    'addedDate',
  ] as const;
  type MandatoryField = typeof MANDATORY_FIELDS[number];

  const hasErrors = () => {
    if (record) {
      const missingRequiredField = MANDATORY_FIELDS.some((field: MandatoryField) => !record[field]);
      return missingRequiredField;
    }
    return true;
  };

  const saveBatch = async () => {
    if (record) {
      if (hasErrors()) {
        setValidateFields(true);
        return;
      }

      let response;
      let responseQuantities = { requestSucceeded: true };
      if (record.id === -1) {
        response = await NurseryBatchService.createBatch(record);
      } else {
        response = await NurseryBatchService.updateBatch(record);
        if (response.batch) {
          responseQuantities = await NurseryBatchService.updateBatchQuantities({
            ...record,
            version: response.batch.version,
          });
        }
      }
      if (response.requestSucceeded && responseQuantities.requestSucceeded) {
        reload();
        onCloseHandler();
      } else {
        snackbar.toastError(response.error);
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
          open={open}
          title={record.id === -1 ? strings.ADD_SEEDLING_BATCH : strings.SEEDLING_BATCH_DETAILS}
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
                <Textfield
                  id='scientificName'
                  value={speciesSelected?.scientificName}
                  type='text'
                  label={strings.SPECIES}
                  display={true}
                />
              </Grid>
              <Grid item xs={gridSize()} sx={marginTop} paddingLeft={paddingSeparator}>
                <Textfield
                  id='commonName'
                  value={speciesSelected?.commonName}
                  type='text'
                  label={strings.COMMON_NAME}
                  display={true}
                />
              </Grid>
              <Grid item xs={gridSize()} sx={marginTop} paddingRight={paddingSeparator}>
                <Textfield
                  id='seedlingsBatch'
                  value={record.batchNumber}
                  type='text'
                  label={strings.SEEDLING_BATCH}
                  display={true}
                />
              </Grid>
              <Grid item xs={gridSize()} sx={marginTop} paddingLeft={paddingSeparator}>
                <Typography sx={{ color: theme.palette.TwClrTxtSecondary, fontSize: '14px' }}>
                  {strings.ACCESSION_ID}
                </Typography>
                {record.accession_id && (
                  <Link
                    to={APP_PATHS.ACCESSIONS2_ITEM.replace(':accessionId', record.accession_id.toString())}
                    target='_blank'
                  >
                    {record.accession_accessionNumber}
                  </Link>
                )}
              </Grid>
              <Grid item xs={gridSize()} sx={marginTop} paddingRight={paddingSeparator}>
                <Textfield id='nursery' value={facility?.name} type='text' label={strings.NURSERY} display={true} />
              </Grid>
            </Grid>
          )}

          <Grid container item xs={12} spacing={2} textAlign='left'>
            {record.id === -1 && (
              <Grid xs={12} padding={theme.spacing(1, 0, 1, 2)}>
                <NurseryDropdown
                  label={strings.NURSERY_REQUIRED}
                  record={record}
                  setRecord={setRecord as unknown as React.Dispatch<React.SetStateAction<Batch>>}
                  validate={validateFields}
                  isSelectionValid={(r) => !!r?.facilityId}
                />
              </Grid>
            )}
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
                type='text'
                label={strings.GERMINATING_QUANTITY_REQUIRED}
                tooltipTitle={strings.TOOLTIP_GERMINATING_QUANTITY}
                errorText={validateFields && !record.germinatingQuantity ? strings.REQUIRED_FIELD : ''}
              />
            </Grid>
            <Grid item xs={12} sx={marginTop}>
              <Divider />
            </Grid>
            <Grid item xs={gridSize()} sx={marginTop} paddingRight={paddingSeparator}>
              <Textfield
                id='notReadyQuantity'
                value={record.notReadyQuantity}
                onChange={(value) => onChange('notReadyQuantity', value)}
                type='text'
                label={strings.NOT_READY_QUANTITY_REQUIRED}
                tooltipTitle={strings.TOOLTIP_NOT_READY_QUANTITY}
                errorText={validateFields && !record.notReadyQuantity ? strings.REQUIRED_FIELD : ''}
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
                type='text'
                label={strings.READY_QUANTITY_REQUIRED}
                tooltipTitle={strings.TOOLTIP_READY_QUANTITY}
                errorText={validateFields && !record.readyQuantity ? strings.REQUIRED_FIELD : ''}
              />
            </Grid>

            <Grid item xs={gridSize()} sx={marginTop} paddingLeft={paddingSeparator} />
            <Grid item xs={gridSize()} sx={marginTop} paddingRight={paddingSeparator}>
              <Textfield
                id='totalQuantity'
                value={totalQuantity}
                type='text'
                label={strings.TOTAL_QUANTITY}
                display={true}
                tooltipTitle={strings.TOOLTIP_TOTAL_QUANTITY}
              />
            </Grid>

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
