import React, { type JSX, useCallback, useEffect, useMemo, useState } from 'react';

import { Box, FormControlLabel, Grid, Radio, RadioGroup, Typography, useTheme } from '@mui/material';
import { Dropdown, SelectT, Textfield } from '@terraware/web-components';
import getDateDisplayValue, { getTodaysDateFormatted, isInTheFuture } from '@terraware/web-components/utils/date';

import AddLink from 'src/components/common/AddLink';
import DatePicker from 'src/components/common/DatePicker';
import DialogBox from 'src/components/common/DialogBox/DialogBox';
import Button from 'src/components/common/button/Button';
import { useLocalization, useOrganization } from 'src/providers/hooks';
import CountWithdrawal from 'src/scenes/AccessionsRouter/withdraw/CountWithdrawal';
import WeightWithdrawal from 'src/scenes/AccessionsRouter/withdraw/WeightWithdrawal';
import { OrganizationUserService } from 'src/services';
import AccessionService, { ViabilityTestPostRequest } from 'src/services/AccessionService';
import { Accession, Withdrawal, treatments, withdrawalTypes } from 'src/types/Accession';
import { NurseryTransfer } from 'src/types/Batch';
import { Facility } from 'src/types/Facility';
import { OrganizationUser, User } from 'src/types/User';
import { UnitType, convertUnits } from 'src/units';
import { getAllNurseries, getSeedBank, isContributor } from 'src/utils/organization';
import { renderUser } from 'src/utils/renderUser';
import useForm from 'src/utils/useForm';
import useSnackbar from 'src/utils/useSnackbar';
import { useLocationTimeZone } from 'src/utils/useTimeZoneUtils';
import { getSubstratesAccordingToType } from 'src/utils/viabilityTest';
import { withdrawalPurposes } from 'src/utils/withdrawalPurposes';

export interface WithdrawDialogProps {
  open: boolean;
  accession: Accession;
  onClose: () => void;
  reload: () => void;
  user: User;
}

export default function WithdrawDialog(props: WithdrawDialogProps): JSX.Element {
  const { strings } = useLocalization();
  const { selectedOrganization } = useOrganization();
  const { onClose, open, accession, reload, user } = props;

  const newViabilityTesting: ViabilityTestPostRequest = {
    testType: 'Lab',
    seedsTested: 0,
  };

  const [isNurseryTransfer, setIsNurseryTransfer] = useState<boolean>(true);
  const [viabilityTesting, , , onChangeViabilityCallback] = useForm(newViabilityTesting);
  const [users, setUsers] = useState<OrganizationUser[]>();
  const [isNotesOpened, setIsNotesOpened] = useState(false);
  const [fieldsErrors, setFieldsErrors] = useState<{ [key: string]: string | undefined }>({});
  const theme = useTheme();
  const snackbar = useSnackbar();
  const contributor = isContributor(selectedOrganization);
  const [selectedSeedBank, setSelectedSeedBank] = useState<Facility>();
  const tz = useLocationTimeZone().get(selectedSeedBank);
  const [timeZone, setTimeZone] = useState(tz.id);
  const [isByWeight, setIsByWeight] = useState(accession.remainingQuantity?.units !== 'Seeds');
  const [withdrawalQty, setWithdrawalQty] = useState<number>(0);
  const [withdrawalValid, setWithdrawalValid] = useState<boolean>(false);
  const [withdrawalButtonEnabled, setWithdrawalButtonEnabled] = useState<boolean>(true);

  const newWithdrawal: Withdrawal = useMemo(
    () => ({
      purpose: 'Nursery',
      withdrawnByUserId: user.id,
      date: getTodaysDateFormatted(timeZone),
      withdrawnQuantity: undefined,
      notes: '',
    }),
    [user.id, timeZone]
  );

  const nurseryTransferWithdrawal: NurseryTransfer = useMemo(
    () => ({
      date: getTodaysDateFormatted(timeZone),
      destinationFacilityId: -1,
      germinatingQuantity: 0,
      hardeningOffQuantity: 0,
      notes: '',
      activeGrowthQuantity: 0,
      readyByDate: undefined,
      readyQuantity: 0,
      withdrawnByUserId: user.id,
    }),
    [timeZone, user.id]
  );

  const [record, setRecord, onChange] = useForm(newWithdrawal);
  const [nurseryTransferRecord, setNurseryTransferRecord, onChangeNurseryTransfer, onChangeTransferCallback] =
    useForm(nurseryTransferWithdrawal);

  const setIndividualError = useCallback((id: string, error?: string) => {
    setFieldsErrors((prev) => ({
      ...prev,
      [id]: error,
    }));
  }, []);

  const onCloseHandler = useCallback(() => {
    setIsNotesOpened(false);
    setRecord(newWithdrawal);
    setNurseryTransferRecord(nurseryTransferWithdrawal);
    onClose();
  }, [newWithdrawal, nurseryTransferWithdrawal, setRecord, setNurseryTransferRecord, onClose]);

  useEffect(() => {
    if (accession.facilityId) {
      const accessionSeedBank = selectedOrganization
        ? getSeedBank(selectedOrganization, accession.facilityId)
        : undefined;
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
    if (selectedOrganization) {
      const getOrgUsers = async () => {
        const response = await OrganizationUserService.getOrganizationUsers(selectedOrganization.id);
        if (response.requestSucceeded) {
          setUsers(response.users);
        }
      };
      void getOrgUsers();
    }
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

  const estimatedWithdrawalQty = useMemo(() => {
    let estimated = 0;
    if (isByWeight && accession.subsetCount && accession.subsetWeight) {
      if (
        accession.remainingQuantity?.units &&
        accession.remainingQuantity?.units === 'Seeds' &&
        accession.estimatedWeight?.units
      ) {
        estimated = Math.round(
          convertUnits(withdrawalQty, accession.estimatedWeight?.units, accession.subsetWeight.units) *
            (accession.subsetCount / accession.subsetWeight.quantity)
        );
      } else if (accession.remainingQuantity?.units) {
        estimated = Math.round(
          convertUnits(withdrawalQty, accession.remainingQuantity?.units, accession.subsetWeight.units) *
            (accession.subsetCount / accession.subsetWeight.quantity)
        );
      }
    } else if (!isByWeight) {
      return withdrawalQty;
    }
    return estimated;
  }, [accession, isByWeight, withdrawalQty]);

  const onChangeUser = useCallback(
    (newValue: OrganizationUser) => {
      onChange('withdrawnByUserId', newValue.id);
      onChangeNurseryTransfer('withdrawnByUserId', newValue.id);
    },
    [onChange, onChangeNurseryTransfer]
  );

  const validateDate = useCallback(
    (id: string, value?: any) => {
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
    },
    [setIndividualError, strings, timeZone]
  );

  const onChangeDate = useCallback(
    (id: string, value?: any) => {
      const date = value ? getDateDisplayValue(value.getTime(), timeZone) : null;
      const valid = validateDate(id, value);
      if (valid) {
        if (id === 'date') {
          onChange(id, date);
        }
        onChangeNurseryTransfer(id, date);
      }
    },
    [timeZone, validateDate, onChange, onChangeNurseryTransfer]
  );

  const onChangeNotes = useCallback(
    (id: string, value: unknown) => {
      onChangeNurseryTransfer(id, value);
      onChange(id, value);
    },
    [onChangeNurseryTransfer, onChange]
  );

  const saveWithdrawalHandler = useCallback(async () => {
    setWithdrawalButtonEnabled(false);
    try {
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
          nurseryTransferRecord.germinatingQuantity = estimatedWithdrawalQty;
          response = await AccessionService.transferToNursery(nurseryTransferRecord, accession.id);
        } else if (record.purpose === 'Viability Testing') {
          viabilityTesting.seedsTested = estimatedWithdrawalQty;
          viabilityTesting.startDate = record.date;
          response = await AccessionService.createViabilityTest(viabilityTesting, accession.id);
        } else {
          let units: UnitType;
          if (isByWeight) {
            if (accession.remainingQuantity?.units === 'Seeds') {
              units = 'Grams';
            } else {
              units = accession.remainingQuantity?.units || 'Grams';
            }
          } else {
            units = 'Seeds';
          }
          record.withdrawnQuantity = { quantity: withdrawalQty, units };
          response = await AccessionService.createWithdrawal(record, accession.id);
        }

        if (response.requestSucceeded) {
          reload();
          onCloseHandler();
        } else {
          snackbar.toastError();
        }
      }
    } finally {
      setWithdrawalButtonEnabled(true);
    }
  }, [
    accession.id,
    accession.remainingQuantity?.units,
    estimatedWithdrawalQty,
    fieldsErrors,
    isByWeight,
    isNurseryTransfer,
    nurseryTransferRecord,
    onCloseHandler,
    record,
    reload,
    setIndividualError,
    snackbar,
    strings,
    viabilityTesting,
    withdrawalQty,
  ]);

  const handleSaveWithdrawal = useCallback(() => {
    void saveWithdrawalHandler();
  }, [saveWithdrawalHandler]);

  const onWithdrawCtUpdate = useCallback(
    (withdrawnQuantity: number, valid: boolean) => {
      if (withdrawnQuantity) {
        setWithdrawalQty(withdrawnQuantity);
      }
      setWithdrawalValid(valid);
    },
    [setWithdrawalQty, setWithdrawalValid]
  );

  const onChangePurpose = useCallback(
    (value: string) => {
      const nurseryTransfer = value === 'Nursery';
      if (nurseryTransfer) {
        setIsNurseryTransfer(true);
      } else {
        setIsNurseryTransfer(false);
        onChange('purpose', value);
      }
    },
    [onChange, setIsNurseryTransfer]
  );

  const onChangeReadyByDate = useCallback((value: any) => onChangeDate('readyByDate', value), [onChangeDate]);

  const onChangeDateHandler = useCallback((value: any) => onChangeDate('date', value), [onChangeDate]);

  const onChangeNotesHandler = useCallback((value: unknown) => onChangeNotes('notes', value), [onChangeNotes]);

  const onClickAddNotes = useCallback(() => setIsNotesOpened(true), []);

  const isEqualUsers = useCallback((a: OrganizationUser, b: OrganizationUser) => a.id === b.id, []);

  const renderOptionUser = useCallback(
    (option: OrganizationUser) => renderUser(option, user, contributor),
    [user, contributor]
  );

  const displayLabelUser = useCallback(
    (option: OrganizationUser) => renderUser(option, user, contributor),
    [user, contributor]
  );

  const toTUser = useCallback(
    (firstName: string) =>
      ({
        firstName,
      }) as OrganizationUser,
    []
  );

  const onChangeWithdrawBy = useCallback(
    (_: React.ChangeEvent<HTMLInputElement>, value: string) => {
      setIndividualError('withdrawnQuantity', '');
      setIsByWeight(value === 'weight');
    },
    [setIndividualError, setIsByWeight]
  );

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
          onClick={handleSaveWithdrawal}
          label={strings.WITHDRAW}
          key='button-2'
          disabled={!withdrawalValid || !withdrawalButtonEnabled}
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
                options={(selectedOrganization ? getAllNurseries(selectedOrganization) : []).map((nursery) => ({
                  label: nursery.name,
                  value: nursery.id.toString(),
                }))}
                onChange={onChangeTransferCallback('destinationFacilityId')}
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
                onChange={onChangeViabilityCallback('testType')}
                selectedValue={viabilityTesting?.testType}
                fullWidth={true}
              />
            </Grid>
            <Grid item xs={12} paddingBottom={2}>
              <Dropdown
                label={strings.SUBSTRATE}
                placeholder={strings.SELECT}
                options={getSubstratesAccordingToType(viabilityTesting?.testType)}
                onChange={onChangeViabilityCallback('substrate')}
                selectedValue={viabilityTesting.substrate}
                fullWidth={true}
              />
            </Grid>
            <Grid item xs={12} paddingBottom={2}>
              <Dropdown
                label={strings.TREATMENT}
                placeholder={strings.SELECT}
                options={treatments()}
                onChange={onChangeViabilityCallback('treatment')}
                selectedValue={viabilityTesting.treatment}
                fullWidth={true}
              />
            </Grid>
          </>
        ) : null}
        <Box
          sx={{
            borderTop: `1px solid ${theme.palette.TwClrBrdrTertiary}`,
            borderBottom: `1px solid ${theme.palette.TwClrBrdrTertiary}`,
            paddingTop: theme.spacing(2),
            marginBottom: theme.spacing(2),
          }}
        >
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
            isEqual={isEqualUsers}
            renderOption={renderOptionUser}
            displayLabel={displayLabelUser}
            selectedValue={users?.find((userSel) => userSel.id === record.withdrawnByUserId)}
            toT={toTUser}
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
                onChange={onChangeReadyByDate}
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
            onChange={onChangeDateHandler}
            errorText={fieldsErrors.date}
            defaultTimeZone={timeZone}
          />
        </Grid>
        <Grid item xs={12} sx={{ marginTop: theme.spacing(2) }}>
          {isNotesOpened ? (
            <Textfield
              id='notes'
              value={record.notes}
              onChange={onChangeNotesHandler}
              type='textarea'
              label={strings.NOTES}
            />
          ) : (
            <Box display='flex' justifyContent='flex-start'>
              <AddLink id='addNotes' onClick={onClickAddNotes} text={strings.ADD_NOTES} large={true} />
            </Box>
          )}
        </Grid>
      </Grid>
    </DialogBox>
  );
}
