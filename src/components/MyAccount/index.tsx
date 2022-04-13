import Grid from '@material-ui/core/Grid';
import { createStyles, makeStyles } from '@material-ui/core/styles';
import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import Button from 'src/components/common/button/Button';
import Table from 'src/components/common/table';
import { TableColumnType } from 'src/components/common/table/types';
import { APP_PATHS } from 'src/constants';
import strings from 'src/strings';
import dictionary from 'src/strings/dictionary';
import { ServerOrganization } from 'src/types/Organization';
import { User } from 'src/types/User';
import FormBottomBar from '../common/FormBottomBar';
import TextField from '../common/Textfield/Textfield';
import TfDivisor from '../common/TfDivisor';
import TfMain from '../common/TfMain';
import AccountCellRenderer from './TableCellRenderer';

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
  { key: 'projects', name: strings.PROJECTS, type: 'string' },
  //   { key: 'totalUsers', name: strings.PEOPLE, type: 'string' },
];

type MyAccountProps = {
  user?: User;
  organizations?: ServerOrganization[];
  edit: boolean;
};

export default function MyAccount({ user, organizations, edit }: MyAccountProps): JSX.Element {
  const classes = useStyles();
  const [selectedRows, setSelectedRows] = useState<ServerOrganization[]>([]);
  const [personOrganizations, setPersonOrganizations] = useState<ServerOrganization[]>([]);
  const history = useHistory();

  useEffect(() => {
    if (organizations) {
      setPersonOrganizations(organizations);
    }
  }, [organizations]);

  const removeSelectedOrgs = () => {
    if (personOrganizations) {
      setPersonOrganizations((currentPersonOrganizations) => {
        const selectedRowsIds = selectedRows.map((sr) => sr.id);
        return currentPersonOrganizations?.filter((org) => !selectedRowsIds?.includes(org.id));
      });
    }
  };

  const saveChanges = () => {};

  return (
    <>
      <TfMain>
        <Grid container spacing={3}>
          <Grid item xs={2}>
            <h1 className={classes.title}>{strings.MY_ACCOUNT}</h1>
            <p>{dictionary.ENTER_DESCRIPTION}</p>
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
            <TextField label={strings.NAME} id='name' type='text' value={user?.firstName} display={!edit} />
          </Grid>
          <Grid item xs={4}>
            <TextField label={strings.LAST_NAME} id='lastName' type='text' value={user?.lastName} display={!edit} />
          </Grid>
          <Grid item xs={4}>
            <TextField label={strings.EMAIL} id='email' type='text' value={user?.email} display={!edit} />
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
