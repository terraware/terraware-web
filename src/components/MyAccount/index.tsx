import Grid from '@material-ui/core/Grid';
import { createStyles, makeStyles } from '@material-ui/core/styles';
import React, { useState } from 'react';
import Button from 'src/components/common/button/Button';
import Table from 'src/components/common/table';
import { TableColumnType } from 'src/components/common/table/types';
import strings from 'src/strings';
import dictionary from 'src/strings/dictionary';
import { ServerOrganization } from 'src/types/Organization';
import { User } from 'src/types/User';
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
};

export default function MyAccount({ user, organizations }: MyAccountProps): JSX.Element {
  const classes = useStyles();
  const [selectedRows, setSelectedRows] = useState<ServerOrganization[]>([]);

  return (
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
            onClick={() => true}
            size='medium'
            priority='secondary'
          />
        </Grid>
        <Grid item xs={12}>
          <h2>{dictionary.GENERAL}</h2>
        </Grid>
        <Grid item xs={4}>
          <TextField label={strings.NAME} id='name' type='text' value={user?.firstName} display={true} />
        </Grid>
        <Grid item xs={4}>
          <TextField label={strings.LAST_NAME} id='lastName' type='text' value={user?.lastName} display={true} />
        </Grid>
        <Grid item xs={4}>
          <TextField label={strings.EMAIL} id='email' type='text' value={user?.email} display={true} />
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
                    rows={organizations}
                    orderBy='name'
                    selectedRows={selectedRows}
                    setSelectedRows={setSelectedRows}
                    showCheckbox={true}
                    showTopBar={true}
                    buttonType='destructive'
                    buttonText={strings.REMOVE}
                    onButtonClick={() => true}
                    Renderer={AccountCellRenderer}
                  />
                )}
              </Grid>
            </Grid>
          </div>
        </Grid>
      </Grid>
    </TfMain>
  );
}
