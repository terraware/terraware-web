import { FormControl, FormControlLabel, FormLabel, Grid, Radio, RadioGroup, Typography, useTheme } from '@mui/material';
import { Button, DatePicker, DialogBox, Dropdown, Textfield } from '@terraware/web-components';
import strings from 'src/strings';
import useForm from 'src/utils/useForm';
import { ServerOrganization } from 'src/types/Organization';
import { useEffect, useMemo, useState } from 'react';
import useSnackbar from 'src/utils/useSnackbar';
import { getTodaysDateFormatted, useDeviceInfo } from '@terraware/web-components/utils';
import { Batch, BatchWithdrawal, NurseryWithdrawalPurpose } from 'src/api/types/batch';
import { createBatchWithdrawal, CreateNurseryWithdrawalRequestPayload } from 'src/api/batch/batch';
import { getSpecies } from 'src/api/species/species';
import { Species } from 'src/types/Species';
import { APP_PATHS } from 'src/constants';
import { Link } from 'react-router-dom';
import { getAllNurseries } from 'src/utils/organization';

export interface WithdrawalsModalProps {
  open: boolean;
  onClose: () => void;
  reload: () => void;
  organization: ServerOrganization;
  selectedBatch: Batch;
  speciesId: number;
}

export default function WithdrawalsModal(props: WithdrawalsModalProps): JSX.Element {
  const { onClose, open, organization, reload, speciesId, selectedBatch } = props;
  const [withdrawQuantity, setWithdrawQuantity] = useState(0);

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
      purpose: 'Out Plant' as NurseryWithdrawalPurpose,
      withdrawnDate: getTodaysDateFormatted(),
    };
    return cleanWithdrawalBatch;
  }, [selectedBatch]);

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
          title={strings.WITHDRAW}
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
                onChange={onChange}
                type='text'
                label={strings.SPECIES}
                display={true}
              />
            </Grid>
            <Grid item xs={gridSize()} sx={marginTop} paddingLeft={paddingSeparator}>
              <Textfield
                id='commonName'
                value={speciesSelected?.commonName}
                onChange={onChange}
                type='text'
                label={strings.COMMON_NAME}
                display={true}
              />
            </Grid>
            <Grid item xs={gridSize()} sx={marginTop} paddingRight={paddingSeparator}>
              <Textfield
                id='seedilingBatch'
                value={selectedBatch.batchNumber}
                onChange={onChange}
                type='text'
                label={strings.SEEDLING_BATCH}
                display={true}
              />
            </Grid>
            <Grid item xs={gridSize()} sx={marginTop} paddingLeft={paddingSeparator}>
              <Typography sx={{ color: '#5C6B6C', fontSize: '14px' }}>{strings.ACCESSION_ID}</Typography>
              {selectedBatch.accessionId && (
                <Link to={APP_PATHS.ACCESSIONS2_ITEM.replace('accessionid', selectedBatch.accessionId.toString())}>
                  {selectedBatch.accessionId}
                </Link>
              )}
            </Grid>
            <Grid xs={12} padding={theme.spacing(4, 0, 0, 2)}>
              <FormControl>
                <FormLabel sx={{ color: '#5C6B6C', fontSize: '14px' }}>{strings.PURPOSE}</FormLabel>
                <RadioGroup name='radio-buttons-purpose' value={record.purpose} onChange={onChangePurpose}>
                  <FormControlLabel value='Out Plant' control={<Radio />} label={strings.OUTPLANT} />
                  <FormControlLabel value='Nursery Transfer' control={<Radio />} label={strings.NURSERY_TRANSFER} />
                  <FormControlLabel value='Dead' control={<Radio />} label={strings.DEAD} />
                  <FormControlLabel value='Other' control={<Radio />} label={strings.OTHER} />
                </RadioGroup>
              </FormControl>
            </Grid>

            {record.purpose === 'Out Plant' ? (
              <>
                {record.batchWithdrawals.map((bw, index) => {
                  return (
                    <Grid item xs={gridSize()} sx={marginTop} paddingRight={paddingSeparator} key={`batch-${index}`}>
                      <Textfield
                        id='readyQuantityWithdrawn'
                        value={bw.readyQuantityWithdrawn}
                        onChange={(id, value) => onChangeQuantity('readyQuantityWithdrawn', value)}
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
                {record.purpose === 'Nursery Transfer' && (
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

                {record.batchWithdrawals.map((bw, index) => {
                  return (
                    <>
                      <Grid item xs={gridSize()} sx={marginTop} paddingRight={paddingSeparator} key={`batch-${index}`}>
                        <Textfield
                          id='notReadyQuantityWithdrawn'
                          value={bw.notReadyQuantityWithdrawn}
                          onChange={(id, value) => onChangeQuantity('notReadyQuantityWithdrawn', value)}
                          type='text'
                          label={strings.NOT_READY_QUANTITY_REQUIRED}
                          errorText={validateFields && bw.notReadyQuantityWithdrawn === 0 ? strings.REQUIRED_FIELD : ''}
                        />
                      </Grid>
                      <Grid item xs={gridSize()} sx={marginTop} paddingLeft={paddingSeparator}>
                        <DatePicker
                          id='readyByDate'
                          label={strings.ESTIMATED_READY_DATE}
                          aria-label={strings.ESTIMATED_READY_DATE}
                          value={record.readyByDate}
                          onChange={changeDate}
                          errorText={validateFields && !record.withdrawnDate ? strings.REQUIRED_FIELD : ''}
                        />
                      </Grid>
                      <Grid item xs={gridSize()} sx={marginTop} paddingRight={paddingSeparator} key={`batch-${index}`}>
                        <Textfield
                          id='readyQuantityWithdrawn'
                          value={bw.readyQuantityWithdrawn}
                          onChange={(id, value) => onChangeQuantity('readyQuantityWithdrawn', value)}
                          type='text'
                          label={strings.READY_QUANTITY_REQUIRED}
                          errorText={validateFields && bw.readyQuantityWithdrawn === 0 ? strings.REQUIRED_FIELD : ''}
                        />
                      </Grid>
                      <Grid item xs={gridSize()} sx={marginTop} paddingLeft={paddingSeparator}>
                        <Textfield
                          id='withdrawnQuantity'
                          value={withdrawQuantity}
                          onChange={onChange}
                          type='text'
                          label={strings.WITHDRAW_QUANTITY}
                          display={true}
                        />
                      </Grid>
                    </>
                  );
                })}
              </>
            )}
            <Grid
              item
              xs={gridSize()}
              sx={marginTop}
              paddingRight={record.purpose !== 'Out Plant' ? paddingSeparator : 0}
              paddingLeft={record.purpose === 'Out Plant' ? paddingSeparator : 0}
            >
              <DatePicker
                id='withdrawnDate'
                label={strings.WITHDRAW_DATE_REQUIRED}
                aria-label={strings.WITHDRAW_DATE_REQUIRED}
                value={record.withdrawnDate}
                onChange={changeDate}
                errorText={validateFields && !record.withdrawnDate ? strings.REQUIRED_FIELD : ''}
              />
            </Grid>
            <Grid padding={theme.spacing(3, 0, 1, 2)} xs={12}>
              <Textfield id='notes' value={record.notes} onChange={onChange} type='textarea' label={strings.NOTES} />
            </Grid>
          </Grid>
        </DialogBox>
      )}
    </>
  );
}
