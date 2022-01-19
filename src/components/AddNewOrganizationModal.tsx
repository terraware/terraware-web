import { Box, Grid, Typography } from '@material-ui/core';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import React, { useState } from 'react';
import { useSetRecoilState } from 'recoil';
import { createOrganization } from 'src/api/organization/organization';
import Button from 'src/components/common/button/Button';
import DialogCloseButton from 'src/components/common/DialogCloseButton';
import strings from 'src/strings';
import { ServerOrganization } from 'src/types/Organization';
import useForm from 'src/utils/useForm';
import Select from './common/Select/Select';
import TextField from './common/Textfield/Textfield';
import snackbarAtom from 'src/state/snackbar';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    submit: {
      marginLeft: theme.spacing(2),
      color: theme.palette.common.white,
    },
    actions: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      paddingLeft: theme.spacing(2),
      paddingTop: theme.spacing(2),
      paddingBottom: theme.spacing(3),
    },
    paper: {
      minWidth: '500px',
    },
    container: {
      border: `1px solid ${theme.palette.grey[400]}`,
      borderRadius: '4px',
      display: 'block',
      padding: theme.spacing(1),
    },
    deleteSpecies: {
      backgroundColor: theme.palette.common.white,
      borderColor: theme.palette.secondary.main,
      color: theme.palette.secondary.main,
      borderWidth: 1,
    },
    spacing: {
      marginRight: theme.spacing(2),
    },
  })
);

export type AddNewOrganizationModalProps = {
  open: boolean;
  onCancel: () => void;
};

export default function AddNewOrganizationModal(props: AddNewOrganizationModalProps): JSX.Element {
  const classes = useStyles();
  const { onCancel, open } = props;
  const setSnackbar = useSetRecoilState(snackbarAtom);
  const [newOrganization, setNewOrganization, onChange] = useForm<ServerOrganization>({
    id: -1,
    name: '',
    role: 'Admin',
  });

  const onChangeCountry = () => {
    onChange('countryCode', '111');
  };

  const saveOrganization = async () => {
    const response = await createOrganization(newOrganization);
    if (response.requestSucceeded) {
      setSnackbar({
        type: 'success',
        msg: `You have created ${response.organization?.name}. You can access the organizations you’re in by clicking the arrow in the top right corner next to your profile.`,
      });
    } else {
      setSnackbar({
        type: 'delete',
        msg: strings.GENERIC_ERROR,
      });
    }
    onCancel();
  };

  return (
    <Dialog onClose={onCancel} disableEscapeKeyDown maxWidth='md' classes={{ paper: classes.paper }} open={open}>
      <DialogTitle>
        <Typography variant='h6'>{strings.ADD_NEW_ORGANIZATION}</Typography>
        <DialogCloseButton onClick={onCancel} />
      </DialogTitle>
      <DialogContent dividers>
        <Grid item xs={12}>
          <TextField label={strings.ORGANIZATION_NAME} type='text' id='name' onChange={onChange} />
        </Grid>
        <Grid item xs={12}>
          <TextField label={strings.DESCRIPTION} type='text' id='description' onChange={onChange} />
        </Grid>
        <Grid item xs={12}>
          <Select label={strings.COUNTRY} id='county' onChange={onChangeCountry} />
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
          <Button onClick={saveOrganization} id='saveSpecies' label={strings.CREATE} />
        </Box>
      </DialogActions>
    </Dialog>
  );
}
