import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import strings from 'src/strings';
import { APP_PATHS } from 'src/constants';
import { ServerOrganization } from 'src/types/Organization';
import useForm from 'src/utils/useForm';
import { Box, Container, Divider, Grid, Typography, useTheme } from '@mui/material';
import useDeviceInfo from 'src/utils/useDeviceInfo';
import Textfield from 'src/components/common/Textfield/Textfield';
import FormBottomBar from 'src/components/common/FormBottomBar';
import { getTodaysDateFormatted } from '@terraware/web-components/utils';
import useSnackbar from 'src/utils/useSnackbar';
import { DatePicker } from '@terraware/web-components';
import { Species2Dropdown } from '../accession2/properties';
import { createBatch, CreateBatchRequestPayload } from 'src/api/batch/batch';
import NurseryDropdown from './NurseryDropdown';

type CreateInventoryProps = {
  organization: ServerOrganization;
};

const defaultBatch = (): CreateBatchRequestPayload =>
  ({
    addedDate: getTodaysDateFormatted(),
    facilityId: undefined,
    speciesId: undefined,
    germinatingQuantity: undefined,
    notReadyQuantity: undefined,
    readyQuantity: undefined,
  } as unknown as CreateBatchRequestPayload);

const MANDATORY_FIELDS = [
  'speciesId',
  'facilityId',
  'addedDate',
  'germinatingQuantity',
  'notReadyQuantity',
  'readyQuantity',
] as const;

type MandatoryField = typeof MANDATORY_FIELDS[number];

export default function CreateInventory(props: CreateInventoryProps): JSX.Element {
  const { organization } = props;
  const { isMobile } = useDeviceInfo();
  const theme = useTheme();
  const history = useHistory();
  const snackbar = useSnackbar();
  const [validateFields, setValidateFields] = useState<boolean>(false);
  const [record, setRecord, onChange] = useForm<CreateBatchRequestPayload>(defaultBatch());
  const [totalQuantity, setTotalQuantity] = useState(0);

  useEffect(() => {
    setTotalQuantity(
      (isNaN(record.notReadyQuantity) ? 0 : Number(record.notReadyQuantity)) +
        (isNaN(record.readyQuantity) ? 0 : Number(record.readyQuantity))
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
    const response = await createBatch(record);
    if (response.requestSucceeded) {
      history.replace(inventoryLocation);
      history.push({
        pathname: APP_PATHS.INVENTORY,
      });
    } else {
      snackbar.toastError(response.error);
    }
  };

  const gridSize = () => (isMobile ? 12 : 6);

  const paddingSeparator = () => (isMobile ? 0 : 1.5);

  const changeDate = (id: string, value?: any) => {
    onChange(id, value);
  };

  return (
    <Box>
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
        padding={theme.spacing(0, 3)}
      >
        <Typography variant='h2' sx={{ fontSize: '20px', fontWeight: 'bold', paddingBottom: 1 }}>
          {strings.ADD_INVENTORY}
        </Typography>
        <Typography sx={{ fontSize: '14px' }}>{strings.ADD_INVENTORY_DESCRIPTION}</Typography>
        <Container
          maxWidth={false}
          sx={{
            width: isMobile ? '100%' : '640px',
            marginTop: theme.spacing(3),
            border: `1px solid ${theme.palette.TwClrBrdrTertiary}`,
            borderRadius: '16px',
            paddingBottom: 3,
            marginBottom: 5,
          }}
        >
          <Grid container padding={0}>
            <Grid item xs={12} sx={marginTop}>
              <Species2Dropdown
                record={record}
                organization={organization}
                setRecord={setRecord}
                validate={validateFields}
              />
            </Grid>
            <Grid item xs={gridSize()} sx={marginTop} paddingRight={paddingSeparator}>
              <NurseryDropdown
                organization={organization}
                record={record}
                setRecord={setRecord}
                validate={validateFields}
                label={strings.RECEIVING_NURSERY_REQUIRED}
              />
            </Grid>
            <Grid item xs={gridSize()} sx={marginTop} paddingLeft={paddingSeparator}>
              <DatePicker
                id='dateAdded'
                label={strings.DATE_ADDED_REQUIRED}
                aria-label={strings.DATE_ADDED_REQUIRED}
                value={record.addedDate}
                onChange={changeDate}
                errorText={validateFields && !record.addedDate ? strings.REQUIRED_FIELD : ''}
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
                onChange={onChange}
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
                onChange={onChange}
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
                onChange={changeDate}
              />
            </Grid>
            <Grid item xs={gridSize()} sx={marginTop} paddingRight={paddingSeparator}>
              <Textfield
                id='readyQuantity'
                value={record.readyQuantity}
                onChange={onChange}
                type='text'
                label={strings.READY_QUANTITY_REQUIRED}
                tooltipTitle={strings.TOOLTIP_READY_QUANTITY}
                errorText={validateFields && !record.readyQuantity ? strings.REQUIRED_FIELD : ''}
              />
            </Grid>
            <Grid item xs={12} sx={{ marginTop: theme.spacing(4) }}>
              <Textfield
                id='totalQuantity'
                value={totalQuantity}
                onChange={onChange}
                type='text'
                label={strings.TOTAL_QUANTITY}
                display={true}
                tooltipTitle={strings.TOOLTIP_TOTAL_QUANTITY}
              />
            </Grid>
            <Grid item xs={12} sx={{ marginTop: theme.spacing(4) }}>
              <Textfield id='notes' value={record.notes} onChange={onChange} type='textarea' label={strings.NOTES} />
            </Grid>
          </Grid>
        </Container>
      </Box>
      <FormBottomBar onCancel={goToInventory} onSave={saveInventory} saveButtonText={strings.SAVE} />
    </Box>
  );
}
