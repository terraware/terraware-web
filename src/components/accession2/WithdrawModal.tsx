import React, { useEffect, useState } from 'react';
import strings from 'src/strings';
import Button from '../common/button/Button';
import DialogBox from '../common/DialogBox/DialogBox';
import { Box, Grid } from '@mui/material';
import { Checkbox, DatePicker, Select, SelectT, Textfield } from '@terraware/web-components';
import { Accession2, Withdrawal2 } from 'src/api/accessions2/accession';
import useForm from 'src/utils/useForm';
import { updateAccession2 } from 'src/api/accessions2/accession';
import moment from 'moment';
import { WITHDRAWAL_PURPOSES } from 'src/utils/withdrawalPurposes';
import { getOrganizationUsers } from 'src/api/organization/organization';
import { OrganizationUser, User } from 'src/types/User';
import { ServerOrganization } from 'src/types/Organization';
import { Unit, WEIGHT_UNITS_V2 } from '../seeds/nursery/NewTest';
import { ViabilityTest } from 'src/api/types/tests';

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
    date: moment().format('YYYY-MM-DD'),
    withdrawnQuantity:
      accession.initialQuantity?.units === 'Seeds'
        ? { quantity: 0, units: 'Seeds' }
        : { quantity: 0, units: accession.initialQuantity?.units || 'Grams' },
  };

  const newViabilityTesting: ViabilityTest = {
    testType: 'Lab',
  };

  const [record, setRecord, onChange] = useForm(newWithdrawal);
  const [viabilityTesting, , onChangeViabilityTesting] = useForm(newViabilityTesting);
  const [users, setUsers] = useState<OrganizationUser[]>();
  const [withdrawAllSelected, setWithdrawAllSelected] = useState(false);

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
    if (record) {
      if (record.purpose === 'Viability Testing') {
        if (accession.viabilityTests) {
          accession.viabilityTests.push(viabilityTesting);
        } else {
          accession.viabilityTests = [viabilityTesting];
        }
      }
      if (accession.withdrawals) {
        accession.withdrawals?.push(record);
      } else {
        accession.withdrawals = [record];
      }
      const response = await updateAccession2(accession);
      if (response.requestSucceeded) {
        reload();
      }
      onClose();
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

  const onChangeUnit = (newValue: Unit) => {
    if (
      newValue.value === accession.remainingQuantity?.units &&
      record.withdrawnQuantity?.quantity.toString() === accession.remainingQuantity?.quantity.toString()
    ) {
      setWithdrawAllSelected(true);
    } else {
      setWithdrawAllSelected(false);
    }
    if (record) {
      setRecord({
        ...record,
        withdrawnQuantity: { quantity: record.withdrawnQuantity?.quantity || 0, units: newValue.value },
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
    setRecord(newWithdrawal);
    onClose();
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
              options={['Lab', 'Nursery']}
              onChange={(value: string) => onChangeViabilityTesting('testType', value)}
              selectedValue={viabilityTesting?.testType}
              fullWidth={true}
              readonly={true}
            />
            <Select
              label={strings.SUBSTRATE}
              placeholder={strings.SELECT}
              options={['Nursery Media', 'Agar Petri Dish', 'Paper Petri Dish', 'Other']}
              onChange={(value: string) => onChangeViabilityTesting('substrate', value)}
              selectedValue={viabilityTesting.substrate}
              fullWidth={true}
              readonly={true}
            />
            <Select
              label={strings.TREATMENT}
              placeholder={strings.SELECT}
              options={['Soak', 'Scarify', 'GA3', 'Stratification', 'Other']}
              onChange={(value: string) => onChangeViabilityTesting('treatment', value)}
              selectedValue={viabilityTesting.treatment}
              fullWidth={true}
              readonly={true}
            />
          </>
        ) : null}
        <Grid item xs={12}>
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
          {accession.initialQuantity?.units === 'Seeds' ? (
            <Box>{strings.CT}</Box>
          ) : (
            <SelectT<Unit>
              options={WEIGHT_UNITS_V2}
              placeholder={strings.SELECT}
              onChange={onChangeUnit}
              isEqual={(a: Unit, b: Unit) => a.value === b.value}
              renderOption={(unit) => unit.label}
              displayLabel={(unit) => unit.label}
              selectedValue={WEIGHT_UNITS_V2.find((wu) => wu.value === record.withdrawnQuantity?.units)}
              toT={(label: string) => ({ label } as Unit)}
              fullWidth={true}
            />
          )}
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
            renderOption={(user) => `${user?.firstName} ${user?.lastName}`}
            displayLabel={(user) => `${user?.firstName} ${user?.lastName}`}
            selectedValue={users?.find((user) => user.id === record.withdrawnByUserId)}
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
      </Grid>
    </DialogBox>
  );
}
