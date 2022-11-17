import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import strings from 'src/strings';
import { APP_PATHS } from 'src/constants';
import {
  Container,
  FormControl,
  FormControlLabel,
  FormLabel,
  Grid,
  Radio,
  RadioGroup,
  Typography,
  useTheme,
} from '@mui/material';
import useDeviceInfo from 'src/utils/useDeviceInfo';
import FormBottomBar from 'src/components/common/FormBottomBar';
import TfMain from 'src/components/common/TfMain';
import { Batch } from 'src/api/types/batch';
import { createBatchWithdrawal, CreateNurseryWithdrawalRequestPayload, getBatch } from 'src/api/batch/batch';
import useSnackbar from 'src/utils/useSnackbar';
import useForm from 'src/utils/useForm';
import { getTodaysDateFormatted, isInTheFuture } from '@terraware/web-components/utils';
import { ServerOrganization } from 'src/types/Organization';
import { DatePicker, Dropdown, Textfield } from '@terraware/web-components';
import { getAllNurseries, getNurseriesById } from 'src/utils/organization';

type SelectPurposeFormProps = {
  organization: ServerOrganization;
  onNext: () => void;
  batchIds: string[];
};
export default function SelectPurposeForm(props: SelectPurposeFormProps): JSX.Element {
  const { organization, batchIds } = props;
  const [batch, setBatch] = useState<Batch>();
  const [snackbar] = useState(useSnackbar());
  const { isMobile } = useDeviceInfo();
  const history = useHistory();
  const theme = useTheme();
  const newWithdrawal: CreateNurseryWithdrawalRequestPayload = {
    purpose: 'Out Plant',
    facilityId: -1,
    withdrawnDate: getTodaysDateFormatted(),
    batchWithdrawals: [
      {
        batchId: -1,
        notReadyQuantityWithdrawn: 0,
        readyQuantityWithdrawn: 0,
      },
    ],
  };

  const [record, setRecord, onChange] = useForm<CreateNurseryWithdrawalRequestPayload>(newWithdrawal);
  const [isNurseryTransfer, setIsNurseryTransfer] = useState(false);
  const [fieldsErrors, setFieldsErrors] = useState<{ [key: string]: string | undefined }>({});

  const goToInventory = () => {
    const pathname = batch
      ? APP_PATHS.INVENTORY_ITEM.replace(':speciesId', batch.speciesId.toString())
      : APP_PATHS.INVENTORY;

    history.push({ pathname });
  };

  const onChangePurpose = (event: React.ChangeEvent<HTMLInputElement>) => {
    onChange('purpose', (event.target as HTMLInputElement).value);
    if ((event.target as HTMLInputElement).value === 'Nursery Transfer') {
      setIsNurseryTransfer(true);
    } else {
      setIsNurseryTransfer(false);
    }
  };

  useEffect(() => {
    const batchId = batchIds[0];
    const fetchBatch = async () => {
      const response = await getBatch(Number(batchId));
      if (response.requestSucceeded && response.batch) {
        setBatch(response.batch);
        setRecord({
          purpose: 'Out Plant',
          facilityId: response.batch.facilityId,
          withdrawnDate: getTodaysDateFormatted(),
          batchWithdrawals: [
            {
              batchId: response.batch.id,
              notReadyQuantityWithdrawn: 0,
              readyQuantityWithdrawn: 0,
            },
          ],
        });
      } else {
        snackbar.toastError(response.error);
      }
    };

    if (batchId) {
      fetchBatch();
    }
  }, [batchIds, snackbar, setRecord]);

  const setIndividualError = (id: string, error?: string) => {
    setFieldsErrors((prev) => ({
      ...prev,
      [id]: error,
    }));
  };

  const validateDate = (id: string, value?: any) => {
    if (!value && id === 'date') {
      setIndividualError('date', strings.REQUIRED_FIELD);
      return false;
    } else if (isNaN(value.getTime())) {
      setIndividualError(id, strings.INVALID_DATE);
      return false;
    } else if (isInTheFuture(value) && id === 'date') {
      setIndividualError('date', strings.NO_FUTURE_DATES);
      return false;
    } else {
      setIndividualError(id, '');
      return true;
    }
  };

  const onChangeDate = (id: string, value?: any) => {
    const valid = validateDate(id, value);
    if (valid) {
      if (id === 'date') {
        onChange(id, value);
      }
    }
  };

  const validateNurseryTransfer = () => {
    if (isNurseryTransfer) {
      if (record.destinationFacilityId === -1) {
        setIndividualError('destinationFacilityId', strings.REQUIRED_FIELD);
        return false;
      }
    }
    return true;
  };

  const saveWithdrawal = async () => {
    if (record) {
      const nurseryTransferInvalid = !validateNurseryTransfer();
      if (fieldsErrors.withdrawDate || nurseryTransferInvalid) {
        return;
      }

      const response = await createBatchWithdrawal(record);

      if (response.requestSucceeded) {
        goToInventory();
        snackbar.pageSuccess(strings.CHANGES_SAVED);
      } else {
        snackbar.toastError(response.error);
      }
    }
  };

  return (
    <TfMain>
      <Typography variant='h2' sx={{ fontSize: '24px', fontWeight: 'bold' }}>
        {strings.WITHDRAW_FROM_BATCHES}
      </Typography>
      <Container
        maxWidth={false}
        sx={{
          margin: '0 auto',
          width: isMobile ? '100%' : '640px',
          paddingLeft: theme.spacing(4),
          paddingRight: theme.spacing(4),
          paddingTop: theme.spacing(5),
          paddingBottom: theme.spacing(5),
        }}
      >
        <Grid container minWidth={isMobile ? 0 : 700}>
          <Grid item xs={12}>
            <Typography variant='h2' sx={{ fontSize: '18px', fontWeight: 'bold', marginBottom: theme.spacing(2) }}>
              {strings.WITHDRAWAL_DETAILS}
            </Typography>
            <Typography>{strings.WITHDRAW_INSTRUCTIONS}</Typography>
            <Grid xs={12} padding={theme.spacing(4, 0, 0, 2)}>
              <FormControl>
                <FormLabel sx={{ color: '#5C6B6C', fontSize: '14px' }}>{strings.PURPOSE}</FormLabel>
                <RadioGroup name='radio-buttons-purpose' value={record?.purpose} onChange={onChangePurpose}>
                  <FormControlLabel value='Out Plant' control={<Radio />} label={strings.OUTPLANT} />
                  <FormControlLabel value='Nursery Transfer' control={<Radio />} label={strings.NURSERY_TRANSFER} />
                  <FormControlLabel value='Dead' control={<Radio />} label={strings.DEAD} />
                  <FormControlLabel value='Other' control={<Radio />} label={strings.OTHER} />
                </RadioGroup>
              </FormControl>
            </Grid>

            <Grid display='flex'>
              {batch && (
                <Grid item xs={isNurseryTransfer ? 6 : 12} sx={{ marginTop: theme.spacing(2) }} paddingRight={1}>
                  <Dropdown
                    id='from'
                    label={strings.FROM_NURSERY}
                    selectedValue={batch.facilityId.toString()}
                    options={[getNurseriesById(organization, batch.facilityId)].map((nursery) => ({
                      label: nursery.name,
                      value: nursery.id.toString(),
                    }))}
                    onChange={(value) => onChange('destinationFacilityId', value)}
                    fullWidth={true}
                  />
                </Grid>
              )}

              {isNurseryTransfer && (
                <Grid item xs={6} sx={{ marginTop: theme.spacing(2) }} paddingLeft={1}>
                  <Dropdown
                    id='destinationFacilityId'
                    label={strings.TO_NURSERY_REQUIRED}
                    selectedValue={record.destinationFacilityId?.toString()}
                    options={getAllNurseries(organization).map((nursery) => ({
                      label: nursery.name,
                      value: nursery.id.toString(),
                    }))}
                    onChange={(value) => onChange('destinationFacilityId', value)}
                    errorText={fieldsErrors.destinationFacilityId}
                    fullWidth={true}
                  />
                </Grid>
              )}
            </Grid>
            <Grid item xs={6} sx={{ marginTop: theme.spacing(2) }}>
              <DatePicker
                id='withdrawnDate'
                label={strings.WITHDRAW_DATE_REQUIRED}
                aria-label={strings.WITHDRAW_DATE_REQUIRED}
                value={record.withdrawnDate}
                onChange={onChangeDate}
                errorText={fieldsErrors.withdrawnDate}
              />
            </Grid>
            <Grid item xs={12} sx={{ marginTop: theme.spacing(2) }}>
              <Textfield id='notes' value={record.notes} onChange={onChange} type='textarea' label={strings.NOTES} />
            </Grid>
          </Grid>
        </Grid>
      </Container>
      <FormBottomBar onCancel={goToInventory} onSave={saveWithdrawal} saveButtonText={strings.NEXT} />
    </TfMain>
  );
}
