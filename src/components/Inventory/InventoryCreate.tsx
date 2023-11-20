import React, { useEffect, useState, useMemo } from 'react';
import { useHistory } from 'react-router-dom';
import strings from 'src/strings';
import { APP_PATHS } from 'src/constants';
import useForm from 'src/utils/useForm';
import { Box, Divider, Grid, Typography, useTheme } from '@mui/material';
import useDeviceInfo from 'src/utils/useDeviceInfo';
import Textfield from 'src/components/common/Textfield/Textfield';
import PageForm from 'src/components/common/PageForm';
import getDateDisplayValue, { getTodaysDateFormatted } from '@terraware/web-components/utils/date';
import useSnackbar from 'src/utils/useSnackbar';
import DatePicker from 'src/components/common/DatePicker';
import SpeciesSelector from 'src/components/common/SpeciesSelector';
import { CreateBatchRequestPayload } from 'src/types/Batch';
import NurseryBatchService from 'src/services/NurseryBatchService';
import NurseryDropdown from './NurseryDropdown';
import TfMain from 'src/components/common/TfMain';
import { useLocationTimeZone } from 'src/utils/useTimeZoneUtils';
import { Facility, SubLocation } from 'src/types/Facility';
import { getNurseryById } from 'src/utils/organization';
import { useOrganization } from 'src/providers';
import { useUser } from 'src/providers';
import { useNumberFormatter } from 'src/utils/useNumber';
import isEnabled from 'src/features';
import { SubLocationService } from 'src/services';
import { MultiSelect } from '@terraware/web-components';

const MANDATORY_FIELDS = [
  'speciesId',
  'facilityId',
  'addedDate',
  'germinatingQuantity',
  'notReadyQuantity',
  'readyQuantity',
] as const;

type MandatoryField = typeof MANDATORY_FIELDS[number];

export default function CreateInventory(): JSX.Element {
  const { isMobile } = useDeviceInfo();
  const theme = useTheme();
  const history = useHistory();
  const snackbar = useSnackbar();
  const { user } = useUser();
  const numberFormatter = useNumberFormatter();
  const [validateFields, setValidateFields] = useState<boolean>(false);
  const [totalQuantity, setTotalQuantity] = useState(0);
  const { selectedOrganization } = useOrganization();
  const [selectedNursery, setSelectedNursery] = useState<Facility>();
  const tz = useLocationTimeZone().get(selectedNursery);
  const [timeZone, setTimeZone] = useState(tz.id);
  const [addedDateChanged, setAddedDateChanged] = useState(false);
  const [sublocations, setSubLocations] = useState<SubLocation[]>([]);
  const [selectedSubLocations, setSelectedSubLocations] = useState<number[]>([]);
  const nurseryV2 = isEnabled('Nursery Updates');
  const numericFormatter = useMemo(() => numberFormatter(user?.locale), [user?.locale, numberFormatter]);

  const subLocationsOptions = useMemo(
    () => new Map(sublocations.map((subLocation) => [subLocation.id, subLocation.name])),
    [sublocations]
  );

  const defaultBatch = (): CreateBatchRequestPayload =>
    ({
      addedDate: getTodaysDateFormatted(timeZone),
      facilityId: undefined,
      speciesId: undefined,
      germinatingQuantity: undefined,
      notReadyQuantity: undefined,
      readyQuantity: undefined,
    } as unknown as CreateBatchRequestPayload);

  const [record, setRecord, onChange] = useForm<CreateBatchRequestPayload>(defaultBatch());

  useEffect(() => {
    if (record.facilityId) {
      const batchNursery = getNurseryById(selectedOrganization, record.facilityId);
      setSelectedNursery(batchNursery);
    }
  }, [record.facilityId, selectedOrganization]);

  useEffect(() => {
    const fetchSubLocations = async () => {
      if (record.facilityId && nurseryV2) {
        setSubLocations([]);
        setSelectedSubLocations([]);
        const response = await SubLocationService.getSubLocations(record.facilityId);
        if (response.requestSucceeded) {
          setSubLocations(response.subLocations);
        }
      }
    };

    fetchSubLocations();
  }, [record.facilityId, nurseryV2]);

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
    const { readyQuantity, notReadyQuantity } = record;
    setTotalQuantity(
      (isNaN(notReadyQuantity) ? 0 : Number(notReadyQuantity)) + (isNaN(readyQuantity) ? 0 : Number(readyQuantity))
    );
  }, [record]);

  const inventoryLocation = {
    pathname: APP_PATHS.INVENTORY,
  };

  const marginTop = {
    marginTop: theme.spacing(2),
  };

  const goToInventory = () => {
    history.push(inventoryLocation);
  };

  const hasErrors = () => {
    const missingRequiredField = MANDATORY_FIELDS.some((field: MandatoryField) => !record[field]);
    return missingRequiredField;
  };

  const saveInventory = async () => {
    if (hasErrors()) {
      setValidateFields(true);
      return;
    }

    const { readyQuantity, notReadyQuantity, germinatingQuantity } = record;

    const response = await NurseryBatchService.createBatch({
      ...record,
      readyQuantity: isNaN(readyQuantity) ? 0 : readyQuantity,
      notReadyQuantity: isNaN(notReadyQuantity) ? 0 : notReadyQuantity,
      germinatingQuantity: isNaN(germinatingQuantity) ? 0 : germinatingQuantity,
      subLocationIds: selectedSubLocations,
    });
    if (response.requestSucceeded) {
      history.replace(inventoryLocation);
      history.push({
        pathname: `${APP_PATHS.INVENTORY}/${record.speciesId}`,
      });
    } else {
      snackbar.toastError();
    }
  };

  const gridSize = () => (isMobile ? 12 : 6);

  const paddingSeparator = () => (isMobile ? 0 : 1.5);

  const changeDate = (id: string, value?: any) => {
    setAddedDateChanged(id === 'addedDate');
    const date = value ? getDateDisplayValue(value.getTime(), timeZone) : null;
    onChange(id, date);
  };

  return (
    <TfMain>
      <PageForm
        cancelID='cancelAddInventory'
        saveID='saveAddInventory'
        onCancel={goToInventory}
        onSave={saveInventory}
        saveButtonText={strings.SAVE}
      >
        <Typography sx={{ paddingLeft: theme.spacing(3), fontWeight: 600, fontSize: '24px' }}>
          {strings.ADD_INVENTORY}
        </Typography>
        <Box
          display='flex'
          flexDirection='column'
          margin='0 auto'
          maxWidth='584px'
          marginTop={5}
          marginBottom={5}
          padding={theme.spacing(3)}
          borderRadius='16px'
          sx={{ backgroundColor: theme.palette.TwClrBg }}
        >
          <Typography variant='h2' sx={{ fontSize: '20px', fontWeight: 'bold', paddingBottom: 1 }}>
            {strings.ADD_INVENTORY}
          </Typography>
          <Typography sx={{ fontSize: '14px' }}>{strings.ADD_INVENTORY_DESCRIPTION}</Typography>
          <Box marginTop={theme.spacing(3)}>
            <Grid container padding={0}>
              <Grid item xs={12} sx={marginTop}>
                <SpeciesSelector record={record} setRecord={setRecord} validate={validateFields} />
              </Grid>
              <Grid item xs={gridSize()} sx={marginTop} paddingRight={paddingSeparator}>
                <NurseryDropdown
                  record={record}
                  setRecord={setRecord}
                  validate={validateFields}
                  isSelectionValid={(r) => !!r?.facilityId}
                  label={strings.RECEIVING_NURSERY_REQUIRED}
                />
              </Grid>
              {sublocations.length > 0 && (
                <Grid item xs={gridSize()} sx={marginTop}>
                  <MultiSelect
                    fullWidth={true}
                    label={strings.SUB_LOCATION}
                    onAdd={(val) => setSelectedSubLocations((prev) => [...prev, val])}
                    onRemove={(val) => setSelectedSubLocations((prev) => prev.filter((v) => v !== val))}
                    options={subLocationsOptions}
                    valueRenderer={(name: string) => name}
                    selectedOptions={selectedSubLocations}
                    placeHolder={strings.SELECT}
                  />
                </Grid>
              )}
              <Grid item xs={12} sx={marginTop}>
                <DatePicker
                  id='addedDate'
                  label={strings.DATE_ADDED_REQUIRED}
                  aria-label={strings.DATE_ADDED_REQUIRED}
                  value={record.addedDate}
                  onChange={(value) => changeDate('addedDate', value)}
                  errorText={validateFields && !record.addedDate ? strings.REQUIRED_FIELD : ''}
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
                  type='number'
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
                  type='number'
                  label={strings.READY_QUANTITY_REQUIRED}
                  tooltipTitle={strings.TOOLTIP_READY_QUANTITY}
                  errorText={validateFields && !record.readyQuantity ? strings.REQUIRED_FIELD : ''}
                />
              </Grid>
              <Grid item xs={12} sx={{ marginTop: theme.spacing(4) }}>
                <Textfield
                  id='totalQuantity'
                  value={numericFormatter.format(totalQuantity)}
                  type='text'
                  label={strings.TOTAL_QUANTITY}
                  display={true}
                  tooltipTitle={strings.TOOLTIP_TOTAL_QUANTITY}
                />
              </Grid>
              <Grid item xs={12} sx={{ marginTop: theme.spacing(4) }}>
                <Textfield
                  id='notes'
                  value={record.notes}
                  onChange={(value) => onChange('notes', value)}
                  type='textarea'
                  label={strings.NOTES}
                />
              </Grid>
            </Grid>
          </Box>
        </Box>
      </PageForm>
    </TfMain>
  );
}
