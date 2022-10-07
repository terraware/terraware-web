import React, { useEffect, useState } from 'react';
import strings from 'src/strings';
import Button from 'src/components/common/button/Button';
import DialogBox from 'src/components/common/DialogBox/DialogBox';
import { Box, Grid, Link, useTheme } from '@mui/material';
import { Checkbox, DatePicker, Select, SelectT, Textfield } from '@terraware/web-components';
import { Accession2, Withdrawal2 } from 'src/api/accessions2/accession';
import useForm from 'src/utils/useForm';
import { postWithdrawal } from 'src/api/accessions2/withdrawals';
import { postViabilityTest, ViabilityTestPostRequest } from 'src/api/accessions2/viabilityTest';
import { WITHDRAWAL_PURPOSES } from 'src/utils/withdrawalPurposes';
import { getOrganizationUsers } from 'src/api/organization/organization';
import { OrganizationUser, User } from 'src/types/User';
import { ServerOrganization } from 'src/types/Organization';
import { Unit, WEIGHT_UNITS_V2 } from 'src/components/seeds/nursery/NewTest';
import { getTodaysDateFormatted, isInTheFuture } from '@terraware/web-components/utils';
import { SUBSTRATES, TREATMENTS, WITHDRAWAL_TYPES } from 'src/types/Accession';
import useSnackbar from 'src/utils/useSnackbar';
import { Dropdown } from '@terraware/web-components';
import { isContributor } from 'src/utils/organization';
import { renderUser } from 'src/utils/renderUser';

export interface WithdrawDialogProps {
  open: boolean;
  accession: Accession2;
  onClose: () => void;
  reload: () => void;
  organization: ServerOrganization;
  user: User;
}

export default function WithdrawDialog(props: WithdrawDialogProps): JSX.Element {
  const { onClose, open, accession, reload, organization, user } = props;

  const newWithdrawal: Withdrawal2 = {
    purpose: 'Nursery',
    withdrawnByUserId: user.id,
    date: getTodaysDateFormatted(),
    withdrawnQuantity: undefined,
    notes: '',
  };

  const newViabilityTesting: ViabilityTestPostRequest = {
    testType: 'Lab',
    seedsTested: 0,
  };

  const [record, setRecord, onChange] = useForm(newWithdrawal);
  const [viabilityTesting, , onChangeViabilityTesting] = useForm(newViabilityTesting);
  const [users, setUsers] = useState<OrganizationUser[]>();
  const [withdrawAllSelected, setWithdrawAllSelected] = useState(false);
  const [isNotesOpened, setIsNotesOpened] = useState(false);
  const [fieldsErrors, setFieldsErrors] = useState<{ [key: string]: string | undefined }>({});
  const theme = useTheme();
  const snackbar = useSnackbar();
  const contributor = isContributor(organization);

  useEffect(() => {
    const getOrgUsers = async () => {
      const response = await getOrganizationUsers(organization);
      if (response.requestSucceeded) {
        setUsers(response.users);
      }
    };
    getOrgUsers();
  }, [organization]);

  const saveWithdrawal = async () => {
    let response;
    if (record) {
      if (!validateAmount()) {
        return;
      }
      if (fieldsErrors.date) {
        return;
      }
      if (record.purpose === 'Viability Testing') {
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
    if (record) {
      setRecord({
        ...record,
        withdrawnQuantity:
          value.toString().trim() === ''
            ? undefined
            : {
                quantity: value || 0,
                units: record.withdrawnQuantity?.units || accession.remainingQuantity?.units || 'Grams',
              },
      });
    }
  };

  const onChangeUser = (newValue: OrganizationUser) => {
    onChange('withdrawnByUserId', newValue.id);
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
      }
    } else {
      setRecord({
        ...record,
        withdrawnQuantity: undefined,
      });
    }

    setWithdrawAllSelected(withdrawAll);
  };

  const validateDate = (value?: any) => {
    if (!value) {
      setIndividualError('date', strings.REQUIRED_FIELD);
      return false;
    } else if (isNaN(value.getTime())) {
      setIndividualError('date', strings.INVALID_DATE);
      return false;
    } else if (isInTheFuture(value)) {
      setIndividualError('date', strings.NO_FUTURE_DATES);
      return false;
    } else {
      setIndividualError('date', '');
      return true;
    }
  };

  const onChangeDate = (id: string, value?: any) => {
    const valid = validateDate(value);
    if (valid) {
      onChange(id, value);
    }
  };

  const onCloseHandler = () => {
    setWithdrawAllSelected(false);
    setIsNotesOpened(false);
    setRecord(newWithdrawal);
    onClose();
  };

  const setIndividualError = (id: string, error?: string) => {
    setFieldsErrors((prev) => ({
      ...prev,
      [id]: error,
    }));
  };

  const validateAmount = () => {
    if (record.withdrawnQuantity?.quantity) {
      if (isNaN(record.withdrawnQuantity.quantity)) {
        setIndividualError('withdrawnQuantity', strings.INVALID_VALUE);
        return false;
      } else {
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
      }
    } else {
      setIndividualError('withdrawnQuantity', strings.REQUIRED_FIELD);
      return false;
    }
    setIndividualError('withdrawnQuantity', '');
    return true;
  };

  return (
    <DialogBox
      onClose={onCloseHandler}
      open={open}
      title={strings.WITHDRAW_SEEDS}
      size='medium'
      middleButtons={[
        <Button label={strings.CANCEL} type='passive' onClick={onCloseHandler} priority='secondary' key='button-1' />,
        <Button onClick={saveWithdrawal} label={strings.WITHDRAW} key='button-2' />,
      ]}
      scrolled={true}
    >
      <Grid item xs={12} textAlign='left'>
        <Grid item xs={12} paddingBottom={2}>
          <Select
            label={strings.PURPOSE}
            placeholder={strings.SELECT}
            options={WITHDRAWAL_PURPOSES}
            onChange={(value: string) => onChange('purpose', value)}
            selectedValue={record?.purpose}
            fullWidth={true}
            readonly={true}
          />
        </Grid>
        {record.purpose === 'Viability Testing' ? (
          <>
            <Grid item xs={12} paddingBottom={2}>
              <Select
                label={strings.TEST_TYPE}
                placeholder={strings.SELECT}
                options={WITHDRAWAL_TYPES}
                onChange={(value: string) => onChangeViabilityTesting('testType', value)}
                selectedValue={viabilityTesting?.testType}
                fullWidth={true}
                readonly={true}
              />
            </Grid>
            <Grid item xs={12} paddingBottom={2}>
              <Select
                label={strings.SUBSTRATE}
                placeholder={strings.SELECT}
                options={SUBSTRATES}
                onChange={(value: string) => onChangeViabilityTesting('substrate', value)}
                selectedValue={viabilityTesting.substrate}
                fullWidth={true}
                readonly={true}
              />
            </Grid>
            <Grid item xs={12} paddingBottom={2}>
              <Select
                label={strings.TREATMENT}
                placeholder={strings.SELECT}
                options={TREATMENTS}
                onChange={(value: string) => onChangeViabilityTesting('treatment', value)}
                selectedValue={viabilityTesting.treatment}
                fullWidth={true}
                readonly={true}
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
              onChange={(id, value) => onChangeWithdrawnQuantity(value as number)}
              type='text'
              value={record.withdrawnQuantity?.quantity.toString()}
              errorText={fieldsErrors.withdrawnQuantity}
            />
            <Box paddingLeft={1}>
              {accession.remainingQuantity?.units === 'Seeds' || record.purpose === 'Viability Testing' ? (
                <Box>{strings.CT}</Box>
              ) : (
                <Dropdown
                  options={WEIGHT_UNITS_V2}
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
            onChange={onSelectAll}
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
        <Grid item xs={12}>
          <DatePicker
            id='date'
            label={strings.DATE}
            aria-label={strings.DATE}
            value={record.date}
            onChange={onChangeDate}
            errorText={fieldsErrors.date}
          />
        </Grid>
        <Grid item xs={12} sx={{ marginTop: theme.spacing(2) }}>
          {isNotesOpened ? (
            <Textfield id='notes' value={record.notes} onChange={onChange} type='textarea' label={strings.NOTES} />
          ) : (
            <Box display='flex' justifyContent='flex-start'>
              <Link sx={{ textDecoration: 'none' }} href='#' id='addNotes' onClick={() => setIsNotesOpened(true)}>
                + {strings.ADD_NOTES}
              </Link>
            </Box>
          )}
        </Grid>
      </Grid>
    </DialogBox>
  );
}
