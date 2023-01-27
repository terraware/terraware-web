import React, { useEffect, useState } from 'react';
import strings from 'src/strings';
import Button from 'src/components/common/button/Button';
import DialogBox from 'src/components/common/DialogBox/DialogBox';
import { Box, Grid, useTheme } from '@mui/material';
import { Checkbox, DatePicker, SelectT, Textfield } from '@terraware/web-components';
import { Accession2, Withdrawal2 } from 'src/api/accessions2/accession';
import { NurseryTransfer } from 'src/api/types/batch';
import useForm from 'src/utils/useForm';
import { transferToNursery, postWithdrawal } from 'src/api/accessions2/withdrawals';
import { postViabilityTest, ViabilityTestPostRequest } from 'src/api/accessions2/viabilityTest';
import { withdrawalPurposes } from 'src/utils/withdrawalPurposes';
import { OrganizationUserService } from 'src/services';
import { OrganizationUser, User } from 'src/types/User';
import { Unit, usePreferredWeightUnits } from 'src/units';
import getDateDisplayValue, { getTodaysDateFormatted, isInTheFuture } from '@terraware/web-components/utils/date';
import { treatments, withdrawalTypes } from 'src/types/Accession';
import useSnackbar from 'src/utils/useSnackbar';
import { Dropdown } from '@terraware/web-components';
import { isContributor, getAllNurseries, getSeedBank } from 'src/utils/organization';
import { renderUser } from 'src/utils/renderUser';
import { getSubstratesAccordingToType } from 'src/utils/viabilityTest';
import AddLink from 'src/components/common/AddLink';
import { useOrganization } from 'src/providers/hooks';
import { Facility } from 'src/api/types/facilities';
import { useLocationTimeZone } from 'src/utils/useTimeZoneUtils';

export interface WithdrawDialogProps {
  open: boolean;
  accession: Accession2;
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
  const [withdrawAllSelected, setWithdrawAllSelected] = useState(false);
  const [isNotesOpened, setIsNotesOpened] = useState(false);
  const [fieldsErrors, setFieldsErrors] = useState<{ [key: string]: string | undefined }>({});
  const theme = useTheme();
  const snackbar = useSnackbar();
  const contributor = isContributor(selectedOrganization);
  const [selectedSeedBank, setSelectedSeedBank] = useState<Facility>();
  const tz = useLocationTimeZone().get(selectedSeedBank);
  const [timeZone, setTimeZone] = useState(tz.id);

  const newWithdrawal: Withdrawal2 = {
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
  const preferredUnits = usePreferredWeightUnits();

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
    setRecord((previousRecord: Withdrawal2): Withdrawal2 => {
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

  const saveWithdrawal = async () => {
    let response;
    if (record) {
      const nurseryTransferInvalid = !validateNurseryTransfer();
      const amountInvalid = !validateAmount(isNurseryTransfer, record.purpose);
      if (
        fieldsErrors.date ||
        (isNurseryTransfer && fieldsErrors.readyByDate) ||
        nurseryTransferInvalid ||
        amountInvalid
      ) {
        return;
      }
      if (isNurseryTransfer) {
        response = await transferToNursery(nurseryTransferRecord, accession.id);
      } else if (record.purpose === 'Viability Testing') {
        viabilityTesting.seedsTested = record.withdrawnQuantity?.quantity || 0;
        viabilityTesting.startDate = record.date;
        response = await postViabilityTest(viabilityTesting, accession.id);
      } else {
        response = await postWithdrawal(record, accession.id);
      }

      if (response.requestSucceeded) {
        reload();
        onCloseHandler();
      } else {
        snackbar.toastError(response.error);
      }
    }
  };

  const onChangeWithdrawnQuantity = (value: number) => {
    if (
      value.toString() === accession.remainingQuantity?.quantity.toString() &&
      record.withdrawnQuantity?.units === accession.remainingQuantity?.units
    ) {
      setWithdrawAllSelected(true);
    } else {
      setWithdrawAllSelected(false);
    }

    setRecord((prev) => ({
      ...prev,
      withdrawnQuantity:
        value.toString().trim() === ''
          ? undefined
          : {
              quantity: value || 0,
              units: prev.withdrawnQuantity?.units || accession.remainingQuantity?.units || 'Grams',
            },
    }));

    setNurseryTransferRecord((prev) => ({
      ...prev,
      germinatingQuantity: value.toString().trim() === '' ? 0 : value || 0,
    }));

    setIndividualError('withdrawnQuantity', '');
    if (isNurseryTransfer || record.purpose === 'Viability Testing') {
      if (!accession.estimatedCount) {
        setIndividualError(
          'withdrawnQuantity',
          isNurseryTransfer
            ? strings.MISSING_SUBSET_WEIGHT_ERROR_NURSERY
            : strings.MISSING_SUBSET_WEIGHT_ERROR_VIABILITY_TEST
        );
      }
    }
  };

  const onChangeUser = (newValue: OrganizationUser) => {
    onChange('withdrawnByUserId', newValue.id);
    onChangeNurseryTransfer('withdrawnByUserId', newValue.id);
  };

  const onChangeUnit = (newValue: string) => {
    if (
      newValue === accession.remainingQuantity?.units &&
      record.withdrawnQuantity?.quantity.toString() === accession.remainingQuantity?.quantity.toString()
    ) {
      setWithdrawAllSelected(true);
    } else {
      setWithdrawAllSelected(false);
    }
    if (record) {
      setRecord({
        ...record,
        withdrawnQuantity: { quantity: record.withdrawnQuantity?.quantity || 0, units: newValue as Unit['value'] },
      });
    }
  };

  const onSelectAll = (id: string, withdrawAll: boolean) => {
    if (withdrawAll) {
      if (record.purpose === 'Viability Testing') {
        // if purpose is VT we use estimated count
        setRecord({
          ...record,
          withdrawnQuantity: {
            quantity: accession.estimatedCount ? accession.estimatedCount : 0,
            units: 'Seeds',
          },
        });
      } else {
        setRecord({
          ...record,
          withdrawnQuantity: accession.remainingQuantity
            ? {
                quantity: accession.remainingQuantity.quantity,
                units: accession.remainingQuantity.units,
              }
            : undefined,
        });
        setNurseryTransferRecord({
          ...nurseryTransferRecord,
          germinatingQuantity: accession.estimatedCount ? accession.estimatedCount : 0,
        });
      }
    } else {
      setRecord({
        ...record,
        withdrawnQuantity: undefined,
      });
      setNurseryTransferRecord({
        ...nurseryTransferRecord,
        germinatingQuantity: 0,
      });
    }

    setWithdrawAllSelected(withdrawAll);
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

  const onChangePurpose = (value: string) => {
    const nurseryTransfer = value === 'Nursery';
    if (value === 'Nursery' || value === 'Viability Testing') {
      validateAmount(nurseryTransfer, value);
    } else {
      setIndividualError('withdrawnQuantity', '');
    }
    if (nurseryTransfer) {
      setIsNurseryTransfer(true);
    } else {
      setIsNurseryTransfer(false);
      onChange('purpose', value);
    }
  };

  const onCloseHandler = () => {
    setWithdrawAllSelected(false);
    setIsNotesOpened(false);
    setRecord(newWithdrawal);
    setNurseryTransferRecord(nurseryTransferWithdrawal);
    onClose();
  };

  const setIndividualError = (id: string, error?: string) => {
    setFieldsErrors((prev) => ({
      ...prev,
      [id]: error,
    }));
  };

  const validateNurseryTransfer = () => {
    if (isNurseryTransfer) {
      if (nurseryTransferRecord.destinationFacilityId === -1) {
        setIndividualError('destinationFacilityId', strings.REQUIRED_FIELD);
        return false;
      }
    }
    return true;
  };

  const validateAmount = (nurseryTransfer: boolean, purpose?: string) => {
    if (record.withdrawnQuantity?.quantity) {
      if (isNaN(record.withdrawnQuantity.quantity)) {
        setIndividualError('withdrawnQuantity', strings.INVALID_VALUE);
        return false;
      }
      if (Number(record.withdrawnQuantity.quantity) <= 0) {
        setIndividualError('withdrawnQuantity', strings.INVALID_VALUE);
        return false;
      }
      if (
        accession.remainingQuantity?.units &&
        Number(record.withdrawnQuantity.units === accession.remainingQuantity.units)
      ) {
        if (record.withdrawnQuantity.quantity > accession.remainingQuantity?.quantity) {
          setIndividualError('withdrawnQuantity', strings.WITHDRAWN_QUANTITY_ERROR);
          return false;
        }
      }
      if (nurseryTransfer || purpose === 'Viability Testing') {
        if (!accession.estimatedCount) {
          setIndividualError(
            'withdrawnQuantity',
            nurseryTransfer
              ? strings.MISSING_SUBSET_WEIGHT_ERROR_NURSERY
              : strings.MISSING_SUBSET_WEIGHT_ERROR_VIABILITY_TEST
          );
          return false;
        }
      }
      setIndividualError('withdrawnQuantity', '');
      return true;
    } else {
      setIndividualError('withdrawnQuantity', strings.REQUIRED_FIELD);
      return false;
    }
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
        <Button id='saveWithdraw' onClick={saveWithdrawal} label={strings.WITHDRAW} key='button-2' />,
      ]}
      scrolled={true}
    >
      <Grid item xs={12} textAlign='left'>
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
        <Grid item xs={12} paddingBottom={2}>
          <Box display='flex' alignItems={fieldsErrors.withdrawnQuantity ? 'center' : 'end'}>
            <Textfield
              label={strings
                .formatString(
                  strings.AMOUNT_REMAINING,
                  `${accession.remainingQuantity?.quantity} ${accession.remainingQuantity?.units}`
                )
                .toString()}
              id='withdrawnQuantity'
              onChange={(value) => onChangeWithdrawnQuantity(Number(value))}
              type='text'
              value={
                isNurseryTransfer
                  ? nurseryTransferRecord.germinatingQuantity
                  : record.withdrawnQuantity?.quantity.toString()
              }
              errorText={fieldsErrors.withdrawnQuantity}
            />
            <Box paddingLeft={1}>
              {accession.remainingQuantity?.units === 'Seeds' ||
              record.purpose === 'Viability Testing' ||
              isNurseryTransfer ? (
                <Box>{strings.CT}</Box>
              ) : (
                <Dropdown
                  options={preferredUnits}
                  placeholder={strings.SELECT}
                  onChange={onChangeUnit}
                  selectedValue={record.withdrawnQuantity?.units}
                  fullWidth={true}
                />
              )}
            </Box>
          </Box>
          <Checkbox
            id='withdrawAll'
            name=''
            label={strings.WITHDRAW_ALL}
            onChange={(value) => onSelectAll('withdrawAll', value)}
            value={withdrawAllSelected}
          />
        </Grid>
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
