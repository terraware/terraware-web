import {
  CircularProgress,
  createStyles,
  Fab,
  makeStyles,
} from '@material-ui/core';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import WarningIcon from '@material-ui/icons/Warning';
import React from 'react';
import { useRecoilValueLoadable } from 'recoil';
import notifications from '../../../state/selectors/notifications';
import strings from '../../../strings';

const useStyles = makeStyles((theme) =>
  createStyles({
    fab: {
      backgroundColor: theme.palette.accent[3],
      width: '36px',
      height: '36px',
      cursor: 'auto',
      '&:hover': {
        backgroundColor: theme.palette.accent[3],
      },
      '&:active': {
        boxShadow:
          '0px 3px 5px -1px rgb(0 0 0 / 20%), 0px 6px 10px 0px rgb(0 0 0 / 14%), 0px 1px 18px 0px rgb(0 0 0 / 12%);',
      },
    },
    alertCell: {
      paddingLeft: 0,
    },
  })
);

export default function Alerts(): JSX.Element {
  const notificationLoadable = useRecoilValueLoadable(notifications);
  const contents =
    notificationLoadable.state === 'hasValue'
      ? notificationLoadable.contents
      : undefined;
  const isLoading = notificationLoadable.state === 'loading';
  const hasError = notificationLoadable.state === 'hasError';
  const classes = useStyles();

  const alerts = contents?.filter(
    (notification) => notification.type === 'Alert'
  );

  return (
    <Table size='small'>
      <TableHead>
        <TableRow>
          <TableCell colSpan={2} className={classes.alertCell}>
            {strings.ALERTS}
          </TableCell>
        </TableRow>
      </TableHead>
      <TableBody id='alerts-table'>
        {hasError && (
          <TableRow>
            <TableCell>{strings.GENERIC_ERROR}</TableCell>
          </TableRow>
        )}
        {isLoading && (
          <TableRow>
            <TableCell>
              <CircularProgress id='spinner-alerts' />
            </TableCell>
          </TableRow>
        )}
        {contents &&
          alerts?.map(({ id, text }) => (
            <TableRow key={id}>
              <TableCell className={classes.alertCell}>
                <Fab
                  aria-label='add'
                  className={classes.fab}
                  variant='round'
                  disableRipple={true}
                >
                  <WarningIcon htmlColor='#fff' fontSize='small' />
                </Fab>
              </TableCell>
              <TableCell>{text}</TableCell>
            </TableRow>
          ))}
      </TableBody>
    </Table>
  );
}
