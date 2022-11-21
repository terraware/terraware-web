import React, { useCallback, useEffect, useState } from 'react';
import strings from 'src/strings';
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
import { NurseryWithdrawal } from 'src/api/types/batch';
import { isInTheFuture } from '@terraware/web-components/utils';
import { ServerOrganization } from 'src/types/Organization';
import { DatePicker, Dropdown, Textfield } from '@terraware/web-components';
import { getAllNurseries, isContributor } from 'src/utils/organization';
import { DropdownItem } from '@terraware/web-components/components/Dropdown';

type SelectPurposeFormProps = {
  organization: ServerOrganization;
  onNext: (withdrawal: NurseryWithdrawal) => void;
  batches: any[];
  nurseryWithdrawal: NurseryWithdrawal;
  validate: boolean;
  onErrors: () => void;
};
export default function SelectPurposeForm(props: SelectPurposeFormProps): JSX.Element {
  const { organization, nurseryWithdrawal, onNext, batches, validate, onErrors } = props;
  const { isMobile } = useDeviceInfo();
  const theme = useTheme();
  const contributor = isContributor(organization);
  const [isNurseryTransfer, setIsNurseryTransfer] = useState(contributor ? true : false);
  const [fieldsErrors, setFieldsErrors] = useState<{ [key: string]: string | undefined }>({});
  const [localRecord, setLocalRecord] = useState<NurseryWithdrawal>(nurseryWithdrawal);
  const [selectedNursery, setSelectedNursery] = useState<string>();
  const [destinationNurseriesOptions, setDestinationNurseriesOptions] = useState<DropdownItem[]>();

  const updateField = (field: keyof NurseryWithdrawal, value: any) => {
    setLocalRecord((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const onChangePurpose = (event: React.ChangeEvent<HTMLInputElement>) => {
    updateField('purpose', (event.target as HTMLInputElement).value);
    if ((event.target as HTMLInputElement).value === 'Nursery Transfer') {
      setIsNurseryTransfer(true);
    } else {
      setIsNurseryTransfer(false);
    }
  };

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
      updateField('withdrawnDate', value);
    }
  };

  const validateNurseryTransfer = useCallback(() => {
    if (isNurseryTransfer) {
      if (localRecord.destinationFacilityId === -1) {
        setIndividualError('destinationFacilityId', strings.REQUIRED_FIELD);
        return false;
      }
    }
    return true;
  }, [isNurseryTransfer, localRecord]);

  const validateSelectedNursery = useCallback(() => {
    if (!selectedNursery) {
      setIndividualError('fromFacilityId', strings.REQUIRED_FIELD);
      return false;
    }
    return true;
  }, [selectedNursery]);

  const onNextHandler = useCallback(() => {
    const nurseryTransferInvalid = !validateNurseryTransfer();
    const selectedNurseryInvalid = !validateSelectedNursery();
    if (fieldsErrors.withdrawDate || nurseryTransferInvalid || selectedNurseryInvalid) {
      onErrors();
      return;
    }

    onNext({
      ...localRecord,
      facilityId: Number(selectedNursery as string),
      batchWithdrawals: batches
        .filter((batch) => batch.facility_id.toString() === selectedNursery)
        .map((batch) => ({
          batchId: batch.id,
          notReadyQuantityWithdrawn: batch.notReadyQuantity,
          readyQuantityWithdrawn: batch.readyQuantity,
        })),
    });
  }, [
    localRecord,
    batches,
    fieldsErrors,
    onNext,
    selectedNursery,
    validateNurseryTransfer,
    validateSelectedNursery,
    onErrors,
  ]);

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

  const validateSelection = useCallback(() => {
    if (validate) {
      onNextHandler();
    }
  }, [validate, onNextHandler]);

  useEffect(() => {
    validateSelection();
  }, [validateSelection, localRecord]);

  useEffect(() => {
    const allNurseries = getAllNurseries(organization);
    const destinationNurseries = allNurseries.filter((nursery) => nursery.id.toString() !== selectedNursery);
    setDestinationNurseriesOptions(
      destinationNurseries.map((nursery) => ({ label: nursery.name, value: nursery.id.toString() }))
    );
  }, [selectedNursery, organization]);

  return (
    <>
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
                <FormLabel sx={{ color: theme.palette.TwClrTxtSecondary, fontSize: '14px' }}>
                  {strings.PURPOSE}
                </FormLabel>
                <RadioGroup name='radio-buttons-purpose' value={localRecord.purpose} onChange={onChangePurpose}>
                  {!contributor && <FormControlLabel value='Out Plant' control={<Radio />} label={strings.OUTPLANT} />}
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
                    selectedValue={localRecord.destinationFacilityId?.toString()}
                    options={destinationNurseriesOptions}
                    onChange={(value) => updateField('destinationFacilityId', value)}
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
                value={localRecord.withdrawnDate}
                onChange={onChangeDate}
                errorText={fieldsErrors.withdrawnDate}
              />
            </Grid>
            <Grid item xs={12} sx={{ marginTop: theme.spacing(2) }}>
              <Textfield
                id='notes'
                value={localRecord.notes}
                onChange={(id, value) => updateField('notes', value)}
                type='textarea'
                label={strings.NOTES}
              />
            </Grid>
          </Grid>
        </Grid>
      </Container>
    </>
  );
}
