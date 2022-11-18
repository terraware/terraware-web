import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import strings from 'src/strings';
import { APP_PATHS } from 'src/constants';
import {
  Box,
  CircularProgress,
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
import { NurseryWithdrawal } from 'src/api/types/batch';
import useSnackbar from 'src/utils/useSnackbar';
import { getTodaysDateFormatted, isInTheFuture } from '@terraware/web-components/utils';
import { ServerOrganization } from 'src/types/Organization';
import { DatePicker, Dropdown, Textfield } from '@terraware/web-components';
import { getAllNurseries } from 'src/utils/organization';
import { DropdownItem } from '@terraware/web-components/components/Dropdown';

type SelectPurposeFormProps = {
  organization: ServerOrganization;
  onNext: () => void;
  batches: any[];
  records: NurseryWithdrawal[];
  setRecords: React.Dispatch<React.SetStateAction<NurseryWithdrawal[]>>;
};
export default function SelectPurposeForm(props: SelectPurposeFormProps): JSX.Element {
  const { organization, setRecords, onNext, batches } = props;
  const [snackbar] = useState(useSnackbar());
  const { isMobile } = useDeviceInfo();
  const history = useHistory();
  const theme = useTheme();
  const [isNurseryTransfer, setIsNurseryTransfer] = useState(false);
  const [fieldsErrors, setFieldsErrors] = useState<{ [key: string]: string | undefined }>({});
  const [localRecords, setLocalRecords] = useState<NurseryWithdrawal[]>([]);
  const [selectedNursery, setSelectedNursery] = useState<string>();
  const [destinationNurseriesOptions, setDestinationNurseriesOptions] = useState<DropdownItem[]>();

  const goToInventory = () => {
    const pathname = APP_PATHS.INVENTORY;

    history.push({ pathname });
  };

  const updateFieldForAll = (field: keyof NurseryWithdrawal, value: any) => {
    const updated = localRecords.map((iRecord) => {
      return { ...iRecord, [field]: value };
    });

    setLocalRecords(updated);
  };

  const onChangePurpose = (event: React.ChangeEvent<HTMLInputElement>) => {
    updateFieldForAll('purpose', (event.target as HTMLInputElement).value);
    if ((event.target as HTMLInputElement).value === 'Nursery Transfer') {
      setIsNurseryTransfer(true);
    } else {
      setIsNurseryTransfer(false);
    }
  };

  useEffect(() => {
    const populateWithdrawals = () => {
      const withdrawalBatches: NurseryWithdrawal[] = [];
      batches.forEach((batch, index) => {
        const withdrawalBatch: NurseryWithdrawal = {
          id: -1,
          purpose: 'Out Plant',
          facilityId: batch.facilityId,
          withdrawnDate: getTodaysDateFormatted(),
          batchWithdrawals: [
            {
              batchId: batch.id,
              notReadyQuantityWithdrawn: batch.notReadyQuantity,
              readyQuantityWithdrawn: batch.readyQuantity,
            },
          ],
        };
        withdrawalBatches.push(withdrawalBatch);
      });
      setLocalRecords(withdrawalBatches);
    };
    if (batches) {
      populateWithdrawals();
    }
  }, [batches, snackbar, setLocalRecords]);

  const setIndividualError = (id: string, error?: string) => {
    setFieldsErrors((prev) => ({
      ...prev,
      [id]: error,
    }));
  };

  useEffect(() => {
    const allNurseries = getAllNurseries(organization);
    const destinantionNurseries = allNurseries.filter((nur) => nur.id.toString() !== selectedNursery);
    setDestinationNurseriesOptions(
      destinantionNurseries.map((nursery) => ({ label: nursery.name, value: nursery.id.toString() }))
    );
  }, [selectedNursery, organization]);

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
      updateFieldForAll('withdrawnDate', value);
    }
  };

  const validateNurseryTransfer = () => {
    if (isNurseryTransfer) {
      if (localRecords[0].destinationFacilityId === -1) {
        setIndividualError('destinationFacilityId', strings.REQUIRED_FIELD);
        return false;
      }
    }
    return true;
  };

  const validateSelectedNursery = () => {
    if (!selectedNursery) {
      setIndividualError('fromFacilityId', strings.REQUIRED_FIELD);
      return false;
    }
    return true;
  };

  const onNextHandler = async () => {
    if (localRecords) {
      const nurseryTransferInvalid = !validateNurseryTransfer();
      const selectedNurseryInvalid = !validateSelectedNursery();
      if (fieldsErrors.withdrawDate || nurseryTransferInvalid || selectedNurseryInvalid) {
        return;
      }
    }

    setRecords(localRecords.filter((rcd) => rcd.facilityId.toString() === selectedNursery));

    onNext();
  };

  const onChangeFromNursery = (facilityIdSelected: string) => {
    setSelectedNursery(facilityIdSelected);
  };

  const getNurseriesOptions = () => {
    const nurseries = batches.reduce((acc, batch) => {
      if (!acc[batch.facility_id.toString()]) {
        acc[batch.facility_id.toString()] = { label: batch.facility_name, value: batch.facility_id };
      }
      return acc;
    }, {});

    const options: DropdownItem[] = Object.values(nurseries);

    if (options.length === 1 && !selectedNursery) {
      setSelectedNursery(options[0].value);
    }
    return options;
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
          {localRecords && localRecords.length > 0 ? (
            <Grid item xs={12}>
              <Typography variant='h2' sx={{ fontSize: '18px', fontWeight: 'bold', marginBottom: theme.spacing(2) }}>
                {strings.WITHDRAWAL_DETAILS}
              </Typography>
              <Typography>{strings.WITHDRAW_INSTRUCTIONS}</Typography>
              <Grid xs={12} padding={theme.spacing(4, 0, 0, 2)}>
                <FormControl>
                  <FormLabel sx={{ color: theme.palette.TwClrTxtSecondary, fontSize: '14px' }}>
                    {strings.PURPOSE}
                  </FormLabel>
                  <RadioGroup name='radio-buttons-purpose' value={localRecords[0]?.purpose} onChange={onChangePurpose}>
                    <FormControlLabel value='Out Plant' control={<Radio />} label={strings.OUTPLANT} />
                    <FormControlLabel value='Nursery Transfer' control={<Radio />} label={strings.NURSERY_TRANSFER} />
                    <FormControlLabel value='Dead' control={<Radio />} label={strings.DEAD} />
                    <FormControlLabel value='Other' control={<Radio />} label={strings.OTHER} />
                  </RadioGroup>
                </FormControl>
              </Grid>

              <Grid display='flex'>
                <Grid item xs={isNurseryTransfer ? 6 : 12} sx={{ marginTop: theme.spacing(2) }} paddingRight={1}>
                  <Dropdown
                    id='fromFacilityId'
                    label={strings.FROM_NURSERY}
                    selectedValue={selectedNursery}
                    options={getNurseriesOptions()}
                    onChange={(newValue) => onChangeFromNursery(newValue)}
                    fullWidth={true}
                    errorText={fieldsErrors.fromFacilityId}
                  />
                </Grid>

                {isNurseryTransfer && (
                  <Grid item xs={6} sx={{ marginTop: theme.spacing(2) }} paddingLeft={1}>
                    <Dropdown
                      id='destinationFacilityId'
                      label={strings.TO_NURSERY_REQUIRED}
                      selectedValue={localRecords[0].destinationFacilityId?.toString()}
                      options={destinationNurseriesOptions}
                      onChange={(value) => updateFieldForAll('destinationFacilityId', value)}
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
                  value={localRecords[0].withdrawnDate}
                  onChange={onChangeDate}
                  errorText={fieldsErrors.withdrawnDate}
                />
              </Grid>
              <Grid item xs={12} sx={{ marginTop: theme.spacing(2) }}>
                <Textfield
                  id='notes'
                  value={localRecords[0].notes}
                  onChange={(id, value) => updateFieldForAll('notes', value)}
                  type='textarea'
                  label={strings.NOTES}
                />
              </Grid>
            </Grid>
          ) : (
            <Box display='flex' justifyContent='center' padding={theme.spacing(5)}>
              <CircularProgress />
            </Box>
          )}
        </Grid>
      </Container>
      <FormBottomBar onCancel={goToInventory} onSave={onNextHandler} saveButtonText={strings.NEXT} />
    </TfMain>
  );
}
