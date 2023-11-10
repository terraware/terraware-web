import React, { useEffect, useState } from 'react';
import strings from 'src/strings';
import Button from 'src/components/common/button/Button';
import DialogBox from 'src/components/common/DialogBox/DialogBox';
import { Box, Grid, useTheme, Radio, RadioGroup, FormControlLabel, Typography, Theme } from '@mui/material';
import { SelectT, Textfield } from '@terraware/web-components';
import DatePicker from 'src/components/common/DatePicker';
import { Accession, Withdrawal } from 'src/types/Accession';
import { NurseryTransfer } from 'src/types/Batch';
import useForm from 'src/utils/useForm';
import AccessionService, { ViabilityTestPostRequest } from 'src/services/AccessionService';
import { withdrawalPurposes } from 'src/utils/withdrawalPurposes';
import { OrganizationUserService } from 'src/services';
import { OrganizationUser, User } from 'src/types/User';
import getDateDisplayValue, { getTodaysDateFormatted, isInTheFuture } from '@terraware/web-components/utils/date';
import { treatments, withdrawalTypes } from 'src/types/Accession';
import useSnackbar from 'src/utils/useSnackbar';
import { Dropdown } from '@terraware/web-components';
import { isContributor, getAllNurseries, getSeedBank } from 'src/utils/organization';
import { renderUser } from 'src/utils/renderUser';
import { getSubstratesAccordingToType } from 'src/utils/viabilityTest';
import AddLink from 'src/components/common/AddLink';
import { useOrganization } from 'src/providers/hooks';
import { Facility } from 'src/types/Facility';
import { useLocationTimeZone } from 'src/utils/useTimeZoneUtils';
import { makeStyles } from '@mui/styles';
import CountWithdrawal from 'src/components/accession2/withdraw/CountWithdrawal';
import WeightWithdrawal from 'src/components/accession2/withdraw/WeightWithdrawal';
import { Unit } from 'src/units'

const useStyles = makeStyles((theme: Theme) => ({
  withdraw: {
    borderTop: `1px solid ${theme.palette.TwClrBrdrTertiary}`,
    borderBottom: `1px solid ${theme.palette.TwClrBrdrTertiary}`,
    paddingTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
  },
}));
export interface WithdrawDialogProps {
  open: boolean;
  accession: Accession;
  onClose: () => void;
  reload: () => void;
  user: User;
}

export default function WithdrawDialog(props: WithdrawDialogProps): JSX.Element {
  const { selectedOrganization } = useOrganization();
  const { onClose, open, accession, reload, user } = props;

  const newViabilityTesting: ViabilityTestPostRequest = {
    testType: 'Lab',
    seedsTested: 0,
  };

  const [isNurseryTransfer, setIsNurseryTransfer] = useState<boolean>(true);
  const [viabilityTesting, , onChangeViabilityTesting] = useForm(newViabilityTesting);
  const [users, setUsers] = useState<OrganizationUser[]>();
  const [isNotesOpened, setIsNotesOpened] = useState(false);
  const [fieldsErrors, setFieldsErrors] = useState<{ [key: string]: string | undefined }>({});
  const theme = useTheme();
  const snackbar = useSnackbar();
  const contributor = isContributor(selectedOrganization);
  const [selectedSeedBank, setSelectedSeedBank] = useState<Facility>();
  const tz = useLocationTimeZone().get(selectedSeedBank);
  const [timeZone, setTimeZone] = useState(tz.id);
  const [isByWeight, setIsByWeight] = useState(accession.remainingQuantity?.units === 'Seeds' ? false : true);
  const classes = useStyles();
  const [withdrawalQty, setWithdrawalQty] = useState<number>(0);
  const [withdrawalUnits, setWithdrawalUnits] = useState<Unit['value']>('Grams');
  const [withdrawalValid, setWithdrawalValid] = useState<boolean>(false);

  const newWithdrawal: Withdrawal = {
    purpose: 'Nursery',
    withdrawnByUserId: user.id,
    date: getTodaysDateFormatted(timeZone),
    withdrawnQuantity: undefined,
    notes: '',
  };

  const nurseryTransferWithdrawal: NurseryTransfer = {
    date: getTodaysDateFormatted(timeZone),
    destinationFacilityId: -1,
    germinatingQuantity: 0,
    notes: '',
    notReadyQuantity: 0,
    readyByDate: undefined,
    readyQuantity: 0,
    withdrawnByUserId: user.id,
  };

  const [record, setRecord, onChange] = useForm(newWithdrawal);
  const [nurseryTransferRecord, setNurseryTransferRecord, onChangeNurseryTransfer] = useForm(nurseryTransferWithdrawal);

  useEffect(() => {
    if (accession.facilityId) {
      const accessionSeedBank = getSeedBank(selectedOrganization, accession.facilityId);
      setSelectedSeedBank(accessionSeedBank);
    }
  }, [selectedOrganization, accession.facilityId]);

  useEffect(() => {
    if (timeZone !== tz.id) {
      setTimeZone(tz.id);
    }
  }, [tz.id, timeZone]);

  useEffect(() => {
    setRecord((previousRecord: Withdrawal): Withdrawal => {
      return {
        ...previousRecord,
        date: getTodaysDateFormatted(timeZone),
      };
    });
  }, [timeZone, setRecord]);

  useEffect(() => {
    const getOrgUsers = async () => {
      const response = await OrganizationUserService.getOrganizationUsers(selectedOrganization.id);
      if (response.requestSucceeded) {
        setUsers(response.users);
      }
    };
    getOrgUsers();
  }, [selectedOrganization]);

  useEffect(() => {
    setRecord((previousRecord: Withdrawal): Withdrawal => {
      if (previousRecord.withdrawnQuantity) {
        return {
          ...previousRecord,
          withdrawnQuantity: {
            quantity: previousRecord.withdrawnQuantity?.quantity,
            units:
              isNurseryTransfer || record.purpose === 'Viability Testing' || !isByWeight
                ? 'Seeds'
                : previousRecord.withdrawnQuantity?.units,
          },
        };
      } else {
        return previousRecord;
      }
    });
  }, [record.purpose, isNurseryTransfer, isByWeight, setRecord]);

  const saveWithdrawal = async () => {
    let response;
    if (record) {
      if (isNurseryTransfer && nurseryTransferRecord.destinationFacilityId === -1) {
        setIndividualError('destinationFacilityId', strings.REQUIRED_FIELD);
        return;
      }
      if (fieldsErrors.date || (isNurseryTransfer && fieldsErrors.readyByDate)) {
        return;
      }

      if (isNurseryTransfer) {
        nurseryTransferRecord.germinatingQuantity = withdrawalQty;
        response = await AccessionService.transferToNursery(nurseryTransferRecord, accession.id);
      } else if (record.purpose === 'Viability Testing') {
        viabilityTesting.seedsTested = withdrawalQty;
        viabilityTesting.startDate = record.date;
        response = await AccessionService.createViabilityTest(viabilityTesting, accession.id);
      } else {
        record.withdrawnQuantity = { quantity: withdrawalQty, units: withdrawalUnits };
        response = await AccessionService.createWithdrawal(record, accession.id);
      }

      if (response.requestSucceeded) {
        reload();
        onCloseHandler();
      } else {
        snackbar.toastError();
      }
    }
  };

  const onChangeUser = (newValue: OrganizationUser) => {
    onChange('withdrawnByUserId', newValue.id);
    onChangeNurseryTransfer('withdrawnByUserId', newValue.id);
  };

  const validateDate = (id: string, value?: any) => {
    if (!value) {
      if (id === 'date') {
        setIndividualError('date', strings.REQUIRED_FIELD);
        return false;
      }
    } else {
      if (isNaN(new Date(value).getTime())) {
        setIndividualError(id, strings.INVALID_DATE);
        return false;
      } else if (isInTheFuture(value, timeZone) && id === 'date') {
        setIndividualError('date', strings.NO_FUTURE_DATES);
        return false;
      } else {
        setIndividualError(id, '');
        return true;
      }
    }
  };

  const onChangeDate = (id: string, value?: any) => {
    const date = value ? getDateDisplayValue(value.getTime(), timeZone) : null;
    const valid = validateDate(id, value);
    if (valid) {
      if (id === 'date') {
        onChange(id, date);
      }
      onChangeNurseryTransfer(id, date);
    }
  };

  const onChangeNotes = (id: string, value: unknown) => {
    onChangeNurseryTransfer(id, value);
    onChange(id, value);
  };

  const onWithdrawCtUpdate = (withdrawnQuantity: Withdrawal['withdrawnQuantity'], valid: boolean) => {
    if (withdrawnQuantity) {
      setWithdrawalQty(withdrawnQuantity.quantity);
      setWithdrawalUnits(withdrawnQuantity.units);
    }
    setWithdrawalValid(valid);
  };

  const onChangePurpose = (value: string) => {
    const nurseryTransfer = value === 'Nursery';
    if (nurseryTransfer) {
      setIsNurseryTransfer(true);
    } else {
      setIsNurseryTransfer(false);
      onChange('purpose', value);
    }
  };

  const onCloseHandler = () => {
    setIsNotesOpened(false);
    setRecord(newWithdrawal);
    setNurseryTransferRecord(nurseryTransferWithdrawal);
    onClose();
  };

  const onChangeWithdrawBy = (_: React.ChangeEvent<HTMLInputElement>, value: string) => {
    setIndividualError('withdrawnQuantity', '');
    setIsByWeight(value === 'weight')
  };

  const setIndividualError = (id: string, error?: string) => {
    setFieldsErrors((prev) => ({
      ...prev,
      [id]: error,
    }));
  };

  return (
    <DialogBox
      onClose={onCloseHandler}
      open={open}
      title={strings.WITHDRAW_SEEDS}
      size='medium'
      middleButtons={[
        <Button
          id='cancelWithdraw'
          label={strings.CANCEL}
          type='passive'
          onClick={onCloseHandler}
          priority='secondary'
          key='button-1'
        />,
        <Button
          id='saveWithdraw'
          onClick={saveWithdrawal}
          label={strings.WITHDRAW}
          key='button-2'
          disabled={!withdrawalValid}
        />,
      ]}
      scrolled={true}
    >
      <Grid container textAlign='left'>
        <Grid item xs={12} paddingBottom={2}>
          <Dropdown
            label={strings.PURPOSE}
            placeholder={strings.SELECT}
            options={withdrawalPurposes()}
            onChange={onChangePurpose}
            selectedValue={isNurseryTransfer ? 'Nursery' : record?.purpose}
            fullWidth={true}
          />
        </Grid>
        {isNurseryTransfer ? (
          <>
            <Grid item xs={12} paddingBottom={2}>
              <Dropdown
                id='destinationFacilityId'
                label={strings.DESTINATION_REQUIRED}
                selectedValue={nurseryTransferRecord.destinationFacilityId.toString()}
                options={getAllNurseries(selectedOrganization).map((nursery) => ({
                  label: nursery.name,
                  value: nursery.id.toString(),
                }))}
                onChange={(value) => onChangeNurseryTransfer('destinationFacilityId', value)}
                errorText={fieldsErrors.destinationFacilityId}
                fullWidth={true}
              />
            </Grid>
          </>
        ) : null}
        {record.purpose === 'Viability Testing' && !isNurseryTransfer ? (
          <>
            <Grid item xs={12} paddingBottom={2}>
              <Dropdown
                label={strings.TEST_TYPE}
                placeholder={strings.SELECT}
                options={withdrawalTypes()}
                onChange={(value: string) => onChangeViabilityTesting('testType', value)}
                selectedValue={viabilityTesting?.testType}
                fullWidth={true}
              />
            </Grid>
            <Grid item xs={12} paddingBottom={2}>
              <Dropdown
                label={strings.SUBSTRATE}
                placeholder={strings.SELECT}
                options={getSubstratesAccordingToType(viabilityTesting?.testType)}
                onChange={(value: string) => onChangeViabilityTesting('substrate', value)}
                selectedValue={viabilityTesting.substrate}
                fullWidth={true}
              />
            </Grid>
            <Grid item xs={12} paddingBottom={2}>
              <Dropdown
                label={strings.TREATMENT}
                placeholder={strings.SELECT}
                options={treatments()}
                onChange={(value: string) => onChangeViabilityTesting('treatment', value)}
                selectedValue={viabilityTesting.treatment}
                fullWidth={true}
              />
            </Grid>
          </>
        ) : null}
        <Box className={classes.withdraw}>
          <Grid item xs={12} textAlign='left'>
            <Typography color={theme.palette.TwClrTxtSecondary} display='flex' fontSize={14}>
              {strings.WITHDRAW_BY}
            </Typography>
            <RadioGroup
              name='radio-buttons-withdraw-by'
              defaultValue={accession.remainingQuantity?.units === 'Seeds' ? 'count' : 'weight'}
              onChange={onChangeWithdrawBy}
            >
              <Grid item xs={12} textAlign='left' display='flex' flexDirection='row'>
                <FormControlLabel value='count' control={<Radio />} label={strings.SEED_COUNT} />
                <FormControlLabel value='weight' control={<Radio />} label={strings.SEED_WEIGHT} />
              </Grid>
            </RadioGroup>
          </Grid>
          {isByWeight ? (
            <WeightWithdrawal
              accession={accession}
              purpose={isNurseryTransfer ? 'Nursery' : record.purpose}
              onWithdrawCtUpdate={onWithdrawCtUpdate}
            />
          ) : (
            <CountWithdrawal accession={accession} onWithdrawCtUpdate={onWithdrawCtUpdate} />
          )}
        </Box>
        <Grid item xs={12} paddingBottom={2}>
          <SelectT<OrganizationUser>
            label={strings.WITHDRAWN_BY}
            placeholder={strings.SELECT}
            options={users}
            onChange={onChangeUser}
            isEqual={(a: OrganizationUser, b: OrganizationUser) => a.id === b.id}
            renderOption={(option) => renderUser(option, user, contributor)}
            displayLabel={(option) => renderUser(option, user, contributor)}
            selectedValue={users?.find((userSel) => userSel.id === record.withdrawnByUserId)}
            toT={(firstName: string) => ({ firstName } as OrganizationUser)}
            fullWidth={true}
            disabled={contributor}
          />
        </Grid>
        {isNurseryTransfer ? (
          <>
            <Grid item xs={12} marginBottom={theme.spacing(2)}>
              <DatePicker
                id='readyByDate'
                label={strings.ESTIMATED_READY_DATE}
                aria-label={strings.ESTIMATED_READY_DATE}
                value={nurseryTransferRecord.readyByDate}
                onChange={(value) => onChangeDate('readyByDate', value)}
                errorText={fieldsErrors.readyByDate}
                defaultTimeZone={timeZone}
              />
            </Grid>
          </>
        ) : null}
        <Grid item xs={12}>
          <DatePicker
            id='date'
            label={strings.DATE}
            aria-label={strings.DATE}
            value={record.date}
            onChange={(value) => onChangeDate('date', value)}
            errorText={fieldsErrors.date}
            defaultTimeZone={timeZone}
          />
        </Grid>
        <Grid item xs={12} sx={{ marginTop: theme.spacing(2) }}>
          {isNotesOpened ? (
            <Textfield
              id='notes'
              value={record.notes}
              onChange={(value) => onChangeNotes('notes', value)}
              type='textarea'
              label={strings.NOTES}
            />
          ) : (
            <Box display='flex' justifyContent='flex-start'>
              <AddLink id='addNotes' onClick={() => setIsNotesOpened(true)} text={strings.ADD_NOTES} large={true} />
            </Box>
          )}
        </Grid>
      </Grid>
    </DialogBox>
  );
}
