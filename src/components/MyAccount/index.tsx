import Grid from '@material-ui/core/Grid';
import { createStyles, makeStyles } from '@material-ui/core/styles';
import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { useSetRecoilState } from 'recoil';
import { updateUserProfile } from 'src/api/user/user';
import Button from 'src/components/common/button/Button';
import Table from 'src/components/common/table';
import { TableColumnType } from 'src/components/common/table/types';
import { APP_PATHS } from 'src/constants';
import strings from 'src/strings';
import dictionary from 'src/strings/dictionary';
import { ServerOrganization } from 'src/types/Organization';
import { User } from 'src/types/User';
import useForm from 'src/utils/useForm';
import FormBottomBar from '../common/FormBottomBar';
import TextField from '../common/Textfield/Textfield';
import TfDivisor from '../common/TfDivisor';
import TfMain from '../common/TfMain';
import AccountCellRenderer from './TableCellRenderer';
import snackbarAtom from 'src/state/snackbar';
import LeaveOrganizationDialog from './LeaveOrganizationModal';
import { leaveOrganization } from 'src/api/organization/organization';

const useStyles = makeStyles((theme) =>
  createStyles({
    title: {
      marginTop: 0,
      fontSize: '24px',
    },
    mainContent: {
      paddingTop: theme.spacing(4),
    },
    centered: {
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'flex-end',
    },
  })
);

const columns: TableColumnType[] = [
  { key: 'name', name: strings.NAME, type: 'string' },
  { key: 'description', name: strings.DESCRIPTION, type: 'string' },
  { key: 'totalUsers', name: strings.PEOPLE, type: 'string' },
];

type MyAccountProps = {
  user: User;
  organizations?: ServerOrganization[];
  edit: boolean;
  reloadUser: () => void;
  reloadData?: () => void;
};

export default function MyAccount({ user, organizations, edit, reloadUser, reloadData }: MyAccountProps): JSX.Element {
  const classes = useStyles();
  const [selectedRows, setSelectedRows] = useState<ServerOrganization[]>([]);
  const [personOrganizations, setPersonOrganizations] = useState<ServerOrganization[]>([]);
  const history = useHistory();
  const [record, setRecord, onChange] = useForm<User>(user);
  const setSnackbar = useSetRecoilState(snackbarAtom);
  const [removedOrg, setRemovedOrg] = useState<ServerOrganization>();
  const [leaveOrganizationModalOpened, setLeaveOrganizationModalOpened] = useState(false);

  useEffect(() => {
    if (organizations) {
      setPersonOrganizations(organizations);
    }
  }, [organizations]);

  useEffect(() => {
    setRecord(user);
  }, [user, setRecord]);

  const removeSelectedOrgs = () => {
    if (organizations && personOrganizations) {
      if (selectedRows.length > 1 || organizations.length - personOrganizations.length === 1) {
        setSnackbar({
          type: 'toast',
          priority: 'critical',
          msg: strings.REMOVE_ONLY_ONE_ORG_AT_A_TIME,
        });
      } else {
        setRemovedOrg(selectedRows[0]);
        setPersonOrganizations((currentPersonOrganizations) => {
          const selectedRowsIds = selectedRows.map((sr) => sr.id);
          return currentPersonOrganizations?.filter((org) => !selectedRowsIds?.includes(org.id));
        });
      }
    }
  };

  const saveChanges = async () => {
    // organizations validations (owner, no more in org, leave)
    if (removedOrg && removedOrg.role !== 'Owner') {
      setLeaveOrganizationModalOpened(true);
    } else {
      const updateUserResponse = await saveProfileChanges();
      if (updateUserResponse.requestSucceeded) {
        reloadUser();
        setSnackbar({
          type: 'toast',
          priority: 'success',
          msg: strings.CHANGES_SAVED,
        });
      } else {
        setSnackbar({
          type: 'toast',
          priority: 'critical',
          msg: strings.GENERIC_ERROR,
        });
      }
      history.push(APP_PATHS.MY_ACCOUNT);
    }
  };

  const saveProfileChanges = async () => {
    const updateUserResponse = await updateUserProfile(record);
    return updateUserResponse;
  };

  const leaveOrgHandler = async () => {
    const updateUserResponse = await saveProfileChanges();
    let leaveOrgResponse = {
      requestSucceeded: true,
    };
    if (removedOrg) {
      leaveOrgResponse = await leaveOrganization(removedOrg.id, user.id);
    }
    if (updateUserResponse.requestSucceeded && leaveOrgResponse.requestSucceeded) {
      if (reloadData) {
        reloadData();
      }
      reloadUser();
      setSnackbar({
        type: 'toast',
        priority: 'success',
        msg: strings.CHANGES_SAVED,
      });
    } else {
      setSnackbar({
        type: 'toast',
        priority: 'critical',
        msg: strings.GENERIC_ERROR,
      });
    }
    history.push(APP_PATHS.MY_ACCOUNT);
  };

  return (
    <>
      {removedOrg && (
        <LeaveOrganizationDialog
          open={leaveOrganizationModalOpened}
          onClose={() => setLeaveOrganizationModalOpened(false)}
          onSubmit={leaveOrgHandler}
          orgName={removedOrg.name}
        />
      )}
      <TfMain>
        <Grid container spacing={3}>
          <Grid item xs={2}>
            <h1 className={classes.title}>{strings.MY_ACCOUNT}</h1>
            <p>{strings.MY_ACCOUNT_DESC}</p>
          </Grid>
          <Grid item xs={8} />
          <Grid item xs={2} className={classes.centered}>
            <Button
              id='edit-account'
              label={dictionary.EDIT_ACCOUNT}
              onClick={() => history.push(APP_PATHS.MY_ACCOUNT_EDIT)}
              size='medium'
              priority='secondary'
            />
          </Grid>
          <Grid item xs={12}>
            <h2>{dictionary.GENERAL}</h2>
          </Grid>
          <Grid item xs={4}>
            <TextField
              label={strings.NAME}
              id='firstName'
              type='text'
              value={record.firstName}
              display={!edit}
              onChange={onChange}
            />
          </Grid>
          <Grid item xs={4}>
            <TextField
              label={strings.LAST_NAME}
              id='lastName'
              type='text'
              value={record.lastName}
              display={!edit}
              onChange={onChange}
            />
          </Grid>
          <Grid item xs={4}>
            <TextField
              label={strings.EMAIL}
              id='email'
              type='text'
              value={record.email}
              display={!edit}
              readonly={true}
            />
          </Grid>
          <Grid item xs={12}>
            <TfDivisor />
          </Grid>
          <Grid item xs={12}>
            <h2>{dictionary.ORGANIZATIONS}</h2>
          </Grid>
          <Grid item xs={12}>
            <div className={classes.mainContent}>
              <Grid container spacing={4}>
                <Grid item xs={12}>
                  {organizations && (
                    <Table
                      id='organizations-table'
                      columns={columns}
                      rows={personOrganizations}
                      orderBy='name'
                      selectedRows={selectedRows}
                      setSelectedRows={setSelectedRows}
                      showCheckbox={edit}
                      showTopBar={edit}
                      buttonType='destructive'
                      buttonText={strings.REMOVE}
                      onButtonClick={removeSelectedOrgs}
                      Renderer={AccountCellRenderer}
                    />
                  )}
                </Grid>
              </Grid>
            </div>
          </Grid>
        </Grid>
      </TfMain>
      {edit && <FormBottomBar onCancel={() => history.push(APP_PATHS.MY_ACCOUNT)} onSave={saveChanges} />}
    </>
  );
}
