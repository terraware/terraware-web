import React, { useEffect, useState } from 'react';
import strings from 'src/strings';
import Button from '../common/button/Button';
import DialogBox from '../common/DialogBox/DialogBox';
import { Box, Grid, Link, useTheme } from '@mui/material';
import { Checkbox, DatePicker, Select, SelectT, Textfield } from '@terraware/web-components';
import { Accession2, Withdrawal2 } from 'src/api/accessions2/accession';
import useForm from 'src/utils/useForm';
import { updateAccession2 } from 'src/api/accessions2/accession';
import { postViabilityTest } from 'src/api/accessions2/viabilityTest';
import { WITHDRAWAL_PURPOSES } from 'src/utils/withdrawalPurposes';
import { getOrganizationUsers } from 'src/api/organization/organization';
import { OrganizationUser, User } from 'src/types/User';
import { ServerOrganization } from 'src/types/Organization';
import { Unit, WEIGHT_UNITS_V2 } from '../seeds/nursery/NewTest';
import { ViabilityTest } from 'src/api/types/tests';
import { getTodaysDateFormatted } from 'src/utils/date';
import { WITHDRAWAL_SUBSTRATES, WITHDRAWAL_TREATMENTS, WITHDRAWAL_TYPES } from 'src/types/Accession';
import useSnackbar from 'src/utils/useSnackbar';
import { Dropdown } from '@terraware/web-components';

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
    withdrawnQuantity:
      accession.remainingQuantity?.units === 'Seeds'
        ? { quantity: 0, units: 'Seeds' }
        : { quantity: 0, units: accession.remainingQuantity?.units || 'Grams' },
    notes: '',
  };

  const newViabilityTesting: ViabilityTest = {
    testType: 'Lab',
  };

  const [record, setRecord, onChange] = useForm(newWithdrawal);
  const [viabilityTesting, , onChangeViabilityTesting] = useForm(newViabilityTesting);
  const [users, setUsers] = useState<OrganizationUser[]>();
  const [withdrawAllSelected, setWithdrawAllSelected] = useState(false);
  const [isNotesOpened, setIsNotesOpened] = useState(false);
  const theme = useTheme();
  const snackbar = useSnackbar();

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
      if (record.purpose === 'Viability Testing') {
        response = await postViabilityTest(viabilityTesting, accession.id);
      } else {
        if (accession.withdrawals) {
          accession.withdrawals?.push(record);
        } else {
          accession.withdrawals = [record];
        }
        response = await updateAccession2(accession);
      }

      if (response.requestSucceeded) {
        reload();
      } else {
        snackbar.toastError();
      }
      onCloseHandler();
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
        withdrawnQuantity: { quantity: value || 0, units: record.withdrawnQuantity?.units || 'Grams' },
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

  const onSelectAll = (id: string, value: boolean) => {
    if (!withdrawAllSelected) {
      setRecord({
        ...record,
        withdrawnQuantity: {
          quantity: accession.remainingQuantity?.quantity || 0,
          units: accession.remainingQuantity?.units || 'Grams',
        },
      });
    } else {
      setRecord({
        ...record,
        withdrawnQuantity: {
          quantity: 0,
          units: 'Grams',
        },
      });
    }

    setWithdrawAllSelected(!withdrawAllSelected);
  };

  const onChangeDate = (id: string, value?: any) => {
    const date = new Date(value).getTime();
    const now = Date.now();
    if (isNaN(date) || date > now) {
      return;
    } else {
      onChange(id, value);
    }
  };

  const onCloseHandler = () => {
    setWithdrawAllSelected(false);
    setIsNotesOpened(false);
    setRecord(newWithdrawal);
    onClose();
  };

  const renderUser = (userSel: User) => `${userSel?.firstName} ${userSel?.lastName}`;

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
    >
      <Grid item xs={12} textAlign='left'>
        <Grid item xs={12}>
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
            <Select
              label={strings.TEST_TYPE}
              placeholder={strings.SELECT}
              options={WITHDRAWAL_TYPES}
              onChange={(value: string) => onChangeViabilityTesting('testType', value)}
              selectedValue={viabilityTesting?.testType}
              fullWidth={true}
              readonly={true}
            />
            <Select
              label={strings.SUBSTRATE}
              placeholder={strings.SELECT}
              options={WITHDRAWAL_SUBSTRATES}
              onChange={(value: string) => onChangeViabilityTesting('substrate', value)}
              selectedValue={viabilityTesting.substrate}
              fullWidth={true}
              readonly={true}
            />
            <Select
              label={strings.TREATMENT}
              placeholder={strings.SELECT}
              options={WITHDRAWAL_TREATMENTS}
              onChange={(value: string) => onChangeViabilityTesting('treatment', value)}
              selectedValue={viabilityTesting.treatment}
              fullWidth={true}
              readonly={true}
            />
          </>
        ) : null}
        <Grid item xs={12}>
          <Box display='flex' alignItems='end'>
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
            />
            {accession.remainingQuantity?.units === 'Seeds' ? (
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
          <Checkbox
            id='withdrawAll'
            name=''
            label={strings.WITHDRAW_ALL}
            onChange={onSelectAll}
            value={withdrawAllSelected}
          />
        </Grid>
        <Grid item xs={12}>
          <SelectT<OrganizationUser>
            label={strings.WITHDRAWN_BY}
            placeholder={strings.SELECT}
            options={users}
            onChange={onChangeUser}
            isEqual={(a: OrganizationUser, b: OrganizationUser) => a.id === b.id}
            renderOption={renderUser}
            displayLabel={renderUser}
            selectedValue={users?.find((userSel) => userSel.id === record.withdrawnByUserId)}
            toT={(firstName: string) => ({ firstName } as OrganizationUser)}
            fullWidth={true}
          />
        </Grid>
        <Grid item xs={12}>
          <DatePicker
            id='date'
            label={strings.DATE}
            aria-label={strings.DATE}
            value={record.date}
            onChange={onChangeDate}
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
