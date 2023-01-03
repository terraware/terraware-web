import { FormControl, FormControlLabel, FormLabel, Grid, Radio, RadioGroup, Typography, useTheme } from '@mui/material';
import { Button, DatePicker, DialogBox, Dropdown, Textfield } from '@terraware/web-components';
import strings from 'src/strings';
import useForm from 'src/utils/useForm';
import { ServerOrganization } from 'src/types/Organization';
import { useEffect, useMemo, useState } from 'react';
import useSnackbar from 'src/utils/useSnackbar';
import { getTodaysDateFormatted, useDeviceInfo } from '@terraware/web-components/utils';
import { BatchWithdrawal, NurseryWithdrawalPurposes } from 'src/api/types/batch';
import { createBatchWithdrawal, CreateNurseryWithdrawalRequestPayload } from 'src/api/batch/batch';
import { getSpecies } from 'src/api/species/species';
import { Species } from 'src/types/Species';
import { APP_PATHS } from 'src/constants';
import { getAllNurseries } from 'src/utils/organization';
import Link from 'src/components/common/Link';

export interface WithdrawalsModalProps {
  open: boolean;
  onClose: () => void;
  reload: () => void;
  organization: ServerOrganization;
  selectedBatch: any;
  speciesId: number;
}

export default function WithdrawalsModal(props: WithdrawalsModalProps): JSX.Element {
  const { onClose, open, organization, reload, speciesId, selectedBatch } = props;
  const [withdrawQuantity, setWithdrawQuantity] = useState(0);
  const { OUTPLANT, NURSERY_TRANSFER, DEAD, OTHER } = NurseryWithdrawalPurposes;

  const initWithdrawalBatch = useMemo(() => {
    const cleanWithdrawalBatch = {
      batchWithdrawals: [
        {
          batchId: selectedBatch.id,
          notReadyQuantityWithdrawn: 0,
          readyQuantityWithdrawn: 0,
        },
      ],
      facilityId: selectedBatch.facilityId,
      purpose: OUTPLANT,
      withdrawnDate: getTodaysDateFormatted(),
    };
    return cleanWithdrawalBatch;
  }, [selectedBatch, OUTPLANT]);

  const [record, setRecord, onChange] = useForm<CreateNurseryWithdrawalRequestPayload>(initWithdrawalBatch);
  const snackbar = useSnackbar();
  const theme = useTheme();
  const [validateFields, setValidateFields] = useState<boolean>(false);

  const { isMobile } = useDeviceInfo();
  const [speciesSelected, setSpeciesSelected] = useState<Species>();

  useEffect(() => {
    const populateSpecies = async () => {
      const speciesResponse = await getSpecies(speciesId, organization.id.toString());
      if (speciesResponse.requestSucceeded) {
        setSpeciesSelected(speciesResponse.species);
      }
    };

    populateSpecies();
  }, [organization, speciesId]);

  useEffect(() => {
    setRecord(initWithdrawalBatch);
  }, [selectedBatch, setRecord, initWithdrawalBatch]);

  const MANDATORY_FIELDS = ['purpose', 'withdrawnDate'] as const;
  type MandatoryField = typeof MANDATORY_FIELDS[number];

  const validateBatchWithdrawal = () => {
    if (record.batchWithdrawals && record.batchWithdrawals[0]) {
      if (!record.batchWithdrawals[0].readyQuantityWithdrawn) {
        return false;
      }
      return true;
    }
    return false;
  };

  const hasErrors = () => {
    if (record) {
      const missingRequiredField = MANDATORY_FIELDS.some((field: MandatoryField) => !record[field]);
      if (!missingRequiredField) {
        return !validateBatchWithdrawal();
      }
    }
    return true;
  };

  const saveWithdrawalBatch = async () => {
    if (record) {
      if (hasErrors()) {
        setValidateFields(true);
        return;
      }

      let response;
      response = await createBatchWithdrawal(record);

      if (response.requestSucceeded) {
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
    onChange(id, value);
  };

  const marginTop = {
    marginTop: theme.spacing(2),
  };

  const onChangePurpose = (event: React.ChangeEvent<HTMLInputElement>) => {
    onChange('purpose', (event.target as HTMLInputElement).value);
  };

  const onChangeQuantity = (id: keyof BatchWithdrawal, value: unknown) => {
    if (selectedBatch && record?.batchWithdrawals) {
      const newBatchWithdrawal = { ...record?.batchWithdrawals[0], [id]: value };

      setWithdrawQuantity(+newBatchWithdrawal.notReadyQuantityWithdrawn + +newBatchWithdrawal.readyQuantityWithdrawn);
      setRecord((previousRecord: CreateNurseryWithdrawalRequestPayload): CreateNurseryWithdrawalRequestPayload => {
        return {
          ...previousRecord,
          batchWithdrawals: [newBatchWithdrawal],
        };
      });
    }
  };

  const onChangeDestinationNursery = (facilityId: string) => {
    setRecord((previousRecord: CreateNurseryWithdrawalRequestPayload): CreateNurseryWithdrawalRequestPayload => {
      return {
        ...previousRecord,
        destinationFacilityId: Number.parseInt(facilityId, 10),
      };
    });
  };

  return (
    <>
      {record && (
        <DialogBox
          onClose={onCloseHandler}
          open={open}
          title={strings.WITHDRAW_SEEDLINGS}
          size='large'
          middleButtons={[
            <Button
              label={strings.CANCEL}
              type='passive'
              onClick={onCloseHandler}
              priority='secondary'
              key='button-1'
            />,
            <Button onClick={saveWithdrawalBatch} label={strings.WITHDRAW} key='button-2' />,
          ]}
          scrolled={true}
        >
          <Grid container item xs={12} spacing={2} textAlign='left'>
            <Grid item xs={gridSize()} sx={marginTop} paddingRight={paddingSeparator}>
              <Textfield
                id='scientificName'
                value={speciesSelected?.scientificName}
                onChange={(value) => onChange('scientificName', value)}
                type='text'
                label={strings.SPECIES}
                display={true}
              />
            </Grid>
            <Grid item xs={gridSize()} sx={marginTop} paddingLeft={paddingSeparator}>
              <Textfield
                id='commonName'
                value={speciesSelected?.commonName}
                onChange={(value) => onChange('commonName', value)}
                type='text'
                label={strings.COMMON_NAME}
                display={true}
              />
            </Grid>
            <Grid item xs={gridSize()} sx={marginTop} paddingRight={paddingSeparator}>
              <Textfield
                id='seedilingBatch'
                value={selectedBatch.batchNumber}
                onChange={(value) => onChange('seedilingBatch', value)}
                type='text'
                label={strings.SEEDLING_BATCH}
                display={true}
              />
            </Grid>
            <Grid item xs={gridSize()} sx={marginTop} paddingLeft={paddingSeparator}>
              <Typography sx={{ color: '#5C6B6C', fontSize: '14px' }}>{strings.ACCESSION_ID}</Typography>
              {selectedBatch.accession_id && (
                <Link to={APP_PATHS.ACCESSIONS2_ITEM.replace(':accessionId', selectedBatch.accession_id.toString())}>
                  {selectedBatch.accession_accessionNumber}
                </Link>
              )}
            </Grid>
            <Grid xs={12} padding={theme.spacing(4, 0, 0, 2)}>
              <FormControl>
                <FormLabel sx={{ color: '#5C6B6C', fontSize: '14px' }}>{strings.PURPOSE}</FormLabel>
                <RadioGroup name='radio-buttons-purpose' value={record.purpose} onChange={onChangePurpose}>
                  <FormControlLabel value={OUTPLANT} control={<Radio />} label={strings.OUTPLANT} />
                  <FormControlLabel value={NURSERY_TRANSFER} control={<Radio />} label={strings.NURSERY_TRANSFER} />
                  <FormControlLabel value={DEAD} control={<Radio />} label={strings.DEAD} />
                  <FormControlLabel value={OTHER} control={<Radio />} label={strings.OTHER} />
                </RadioGroup>
              </FormControl>
            </Grid>

            {record.purpose === OUTPLANT ? (
              <>
                {record.batchWithdrawals.map((bw, index) => {
                  return (
                    <Grid item xs={gridSize()} sx={marginTop} paddingRight={paddingSeparator} key={`batch-${index}`}>
                      <Textfield
                        id='readyQuantityWithdrawn'
                        value={bw.readyQuantityWithdrawn}
                        onChange={(value) => onChangeQuantity('readyQuantityWithdrawn', value)}
                        type='text'
                        label={strings.WITHDRAW_QUANTITY_REQUIRED}
                        errorText={validateFields && bw.readyQuantityWithdrawn === 0 ? strings.REQUIRED_FIELD : ''}
                      />
                    </Grid>
                  );
                })}
              </>
            ) : (
              <>
                {record.purpose === NURSERY_TRANSFER && (
                  <Grid item xs={12} sx={marginTop}>
                    <Dropdown
                      id='facilityId'
                      label={strings.DESTINATION_REQUIRED}
                      selectedValue={record.destinationFacilityId?.toString()}
                      options={getAllNurseries(organization).map((nursery) => ({
                        label: nursery.name,
                        value: nursery.id.toString(),
                      }))}
                      onChange={onChangeDestinationNursery}
                      errorText={validateFields && !record.destinationFacilityId ? strings.REQUIRED_FIELD : ''}
                      fullWidth={true}
                    />
                  </Grid>
                )}

                {record.batchWithdrawals.map((bw, index) => (
                  <Grid container key={`batch-not-ready-${index}`} sx={{ marginLeft: theme.spacing(2) }}>
                    <Grid item xs={gridSize()} sx={marginTop} paddingRight={paddingSeparator}>
                      <Textfield
                        id='notReadyQuantityWithdrawn'
                        value={bw.notReadyQuantityWithdrawn}
                        onChange={(value) => onChangeQuantity('notReadyQuantityWithdrawn', value)}
                        type='text'
                        label={strings.NOT_READY_QUANTITY_REQUIRED}
                        errorText={validateFields && bw.notReadyQuantityWithdrawn === 0 ? strings.REQUIRED_FIELD : ''}
                      />
                    </Grid>
                    <Grid item xs={gridSize()} sx={marginTop} paddingLeft={paddingSeparator}>
                      <Textfield
                        id='readyQuantityWithdrawn'
                        value={bw.readyQuantityWithdrawn}
                        onChange={(value) => onChangeQuantity('readyQuantityWithdrawn', value)}
                        type='text'
                        label={strings.READY_QUANTITY_REQUIRED}
                        errorText={validateFields && bw.readyQuantityWithdrawn === 0 ? strings.REQUIRED_FIELD : ''}
                      />
                    </Grid>
                    <Grid item xs={gridSize()} sx={marginTop} paddingRight={paddingSeparator}>
                      <Textfield
                        id='withdrawnQuantity'
                        value={withdrawQuantity}
                        onChange={(value) => onChange('withdrawnQuantity', value)}
                        type='text'
                        label={strings.WITHDRAW_QUANTITY}
                        display={true}
                      />
                    </Grid>
                  </Grid>
                ))}
              </>
            )}
            <Grid
              item
              xs={gridSize()}
              sx={marginTop}
              paddingRight={record.purpose !== OUTPLANT ? paddingSeparator : 0}
              paddingLeft={record.purpose === OUTPLANT ? paddingSeparator : 0}
            >
              <DatePicker
                id='withdrawnDate'
                label={strings.WITHDRAW_DATE_REQUIRED}
                aria-label={strings.WITHDRAW_DATE_REQUIRED}
                value={record.withdrawnDate}
                onChange={(value) => changeDate('withdrawnDate', value)}
                errorText={validateFields && !record.withdrawnDate ? strings.REQUIRED_FIELD : ''}
              />
            </Grid>
            <Grid padding={theme.spacing(3, 0, 1, 2)} xs={12}>
              <Textfield
                id='notes'
                value={record.notes}
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
