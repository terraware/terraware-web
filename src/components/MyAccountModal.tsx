import { Box, Grid, Typography } from '@material-ui/core';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import React from 'react';
import { useSetRecoilState } from 'recoil';
import Button from 'src/components/common/button/Button';
import DialogCloseButton from 'src/components/common/DialogCloseButton';
import strings from 'src/strings';
import useForm from 'src/utils/useForm';
import TextField from './common/Textfield/Textfield';
import snackbarAtom from 'src/state/snackbar';
import { User } from 'src/types/User';
import { updateUser } from 'src/api/user/user';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    actions: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      paddingLeft: theme.spacing(2),
      paddingTop: theme.spacing(2),
      paddingBottom: theme.spacing(3),
    },
    spacing: {
      marginRight: theme.spacing(2),
    },
  })
);

export type MyAccountModalProps = {
  open: boolean;
  onCancel: () => void;
  user: User;
  reloadUser: () => void;
};

export default function MyAccountModal(props: MyAccountModalProps): JSX.Element {
  const classes = useStyles();
  const { onCancel, open, user, reloadUser } = props;
  const setSnackbar = useSetRecoilState(snackbarAtom);
  const [record, , onChange] = useForm<User>(user);

  const saveUser = async () => {
    const response = await updateUser(record);
    if (response.requestSucceeded) {
      reloadUser();
      setSnackbar({
        type: 'page',
        priority: 'success',
        msg: strings.CHANGES_SAVED,
      });
    } else {
      setSnackbar({
        type: 'page',
        priority: 'critical',
        msg: strings.GENERIC_ERROR,
      });
    }
    onCancel();
  };

  return (
    <Dialog onClose={onCancel} disableEscapeKeyDown maxWidth='md' open={open}>
      <DialogTitle>
        <Typography variant='h6'>{strings.ADD_NEW_ORGANIZATION}</Typography>
        <DialogCloseButton onClick={onCancel} />
      </DialogTitle>
      <DialogContent dividers>
        <Grid item xs={12}>
          <TextField
            label={strings.FIRST_NAME}
            type='text'
            id='firstName'
            onChange={onChange}
            value={record.firstName}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField label={strings.LAST_NAME} type='text' id='lastName' onChange={onChange} value={record.lastName} />
        </Grid>
        <Grid item xs={12}>
          <TextField
            label={strings.EMAIL}
            type='text'
            id='email'
            onChange={onChange}
            disabled={true}
            value={record.email}
          />
        </Grid>
      </DialogContent>
      <DialogActions>
        <Box width={'100%'} className={classes.actions}>
          <Button
            onClick={onCancel}
            id='cancel'
            label={strings.CANCEL}
            priority='secondary'
            type='passive'
            className={classes.spacing}
          />
          <Button onClick={saveUser} id='saveUser' label={strings.SAVE} />
        </Box>
      </DialogActions>
    </Dialog>
  );
}
