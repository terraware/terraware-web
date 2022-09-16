import { Box, Grid } from '@mui/material';
import { Button, DatePicker, DialogBox, Select, SelectT } from '@terraware/web-components';
import { Accession2 } from 'src/api/accessions2/accession';
import { ViabilityTestPostRequest } from 'src/api/accessions2/viabilityTest';
import strings from 'src/strings';
import useForm from 'src/utils/useForm';
import { Dropdown } from '@terraware/web-components';
import { LAB_SUBSTRATES, NURSERY_SUBSTRATES, SEED_TYPES, TEST_METHODS, TREATMENTS } from 'src/types/Accession';
import { OrganizationUser, User } from 'src/types/User';
import { ServerOrganization } from 'src/types/Organization';
import { useEffect, useState } from 'react';
import { getOrganizationUsers } from 'src/api/organization/organization';
import { isContributor } from 'src/utils/organization';
import TextField from '@terraware/web-components/components/Textfield/Textfield';
import { postViabilityTest } from 'src/api/accessions2/viabilityTest';
import useSnackbar from 'src/utils/useSnackbar';
import { renderUser } from 'src/utils/renderUser';

export interface NewViabilityTestModalProps {
  open: boolean;
  accession: Accession2;
  onClose: () => void;
  reload: () => void;
  organization: ServerOrganization;
  user: User;
}

export default function NewViabilityTestModal(props: NewViabilityTestModalProps): JSX.Element {
  const { onClose, open, accession, organization, user, reload } = props;
  const newViabilityTest: ViabilityTestPostRequest = {};
  const [record, setRecord, onChange] = useForm(newViabilityTest);
  const [users, setUsers] = useState<OrganizationUser[]>();
  const contributor = isContributor(organization);
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

  const saveTest = async () => {
    const response = await postViabilityTest(record, accession.id);
    if (response.requestSucceeded) {
      reload();
      onCloseHandler();
    } else {
      snackbar.toastError();
    }
  };

  const onChangeUser = (newValue: OrganizationUser) => {
    onChange('testingStaffUserId', newValue.id);
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
    setRecord({});
    onClose();
  };

  const getSubstratesAccordingToType = (type?: string) => {
    if (type === 'Lab') {
      return LAB_SUBSTRATES;
    } else if (type === 'Nursery') {
      return NURSERY_SUBSTRATES;
    } else {
      return [];
    }
  };

  return (
    <DialogBox
      onClose={onCloseHandler}
      open={open}
      title={strings.VIABILITY_TEST}
      size='large'
      middleButtons={[
        <Button label={strings.CANCEL} type='passive' onClick={onCloseHandler} priority='secondary' key='button-1' />,
        <Button onClick={saveTest} label={strings.SAVE} key='button-2' />,
      ]}
      scrolled={true}
    >
      <Grid container item xs={12} spacing={2} textAlign='left'>
        <Grid item xs={12}>
          <Dropdown
            options={TEST_METHODS}
            placeholder={strings.SELECT}
            onChange={(value: string) => onChange('testType', value)}
            selectedValue={record.testType}
            fullWidth={true}
            label={strings.TEST_METHOD_REQUIRED}
          />
        </Grid>
        <Grid item xs={12}>
          <Select
            label={strings.SEED_TYPE}
            placeholder={strings.SELECT}
            options={SEED_TYPES}
            onChange={(value: string) => onChange('seedType', value)}
            selectedValue={record.seedType}
            fullWidth={true}
            readonly={true}
          />
        </Grid>
        <Grid item xs={12}>
          <Select
            label={strings.SUBSTRATE}
            placeholder={strings.SELECT}
            options={getSubstratesAccordingToType(record.testType)}
            onChange={(value: string) => onChange('substrate', value)}
            selectedValue={record.substrate}
            fullWidth={true}
            readonly={true}
          />
        </Grid>
        <Grid item xs={12}>
          <Select
            label={strings.TREATMENT}
            placeholder={strings.SELECT}
            options={TREATMENTS}
            onChange={(value: string) => onChange('treatment', value)}
            selectedValue={record.treatment}
            fullWidth={true}
            readonly={true}
          />
        </Grid>
        <Grid item xs={12}>
          <SelectT<OrganizationUser>
            label={strings.TESTING_STAFF}
            placeholder={strings.SELECT}
            options={users}
            onChange={onChangeUser}
            isEqual={(a: OrganizationUser, b: OrganizationUser) => a.id === b.id}
            renderOption={(option) => renderUser(option, user, contributor)}
            displayLabel={(option) => renderUser(option, user, contributor)}
            selectedValue={users?.find((userSel) => userSel.id === record.testingStaffUserId)}
            toT={(firstName: string) => ({ firstName } as OrganizationUser)}
            fullWidth={true}
            disabled={contributor}
          />
        </Grid>
        <Grid item xs={12}>
          <Box sx={{ display: 'flex', background: '#F2F4F5', borderRadius: '16px', padding: 3, alignItems: 'center' }}>
            <Grid item xs={12}>
              <DatePicker
                id='startDate'
                label={strings.START_DATE_REQUIRED}
                aria-label={strings.DATE}
                value={record.startDate}
                onChange={onChangeDate}
              />
            </Grid>
            <Grid item xs={12} marginLeft={1}>
              <TextField
                label={strings.NUMBER_OF_SEEDS_TESTED_REQUIRED}
                type='text'
                onChange={onChange}
                id='seedsTested'
                value={record.seedsTested}
              />
            </Grid>
          </Box>
        </Grid>
        <Grid item xs={12}>
          <TextField id='notes' value={record.notes} onChange={onChange} type='textarea' label={strings.NOTES} />
        </Grid>
      </Grid>
    </DialogBox>
  );
}
