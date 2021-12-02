import { Box, Chip, Grid, Typography } from '@material-ui/core';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import React, { useEffect, useState } from 'react';
import CancelButton from 'src/components/common/CancelButton';
import DialogCloseButton from 'src/components/common/DialogCloseButton';
import TextField from 'src/components/common/TextField';
import strings from 'src/strings';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    submit: {
      marginLeft: theme.spacing(2),
      color: theme.palette.common.white,
    },
    actions: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingLeft: theme.spacing(2),
      paddingTop: theme.spacing(3),
      paddingBottom: theme.spacing(1),
    },
    paper: {
      minWidth: '500px',
    },
  })
);

export interface Props {
  open: boolean;
  onClose: (name?: string) => void;
}

export default function NewSpeciesModal(props: Props): JSX.Element {
  const classes = useStyles();
  const { onClose, open } = props;
  const [name, setName] = useState<string>('');

  useEffect(() => {
    if (open) {
      setName('');
    }
  }, [open]);

  const handleCancel = () => {
    setName('');
    onClose();
  };

  const handleOk = () => {
    onClose(name);
  };

  return (
    <Dialog onClose={handleCancel} disableEscapeKeyDown open={open} maxWidth='md' classes={{ paper: classes.paper }}>
      <DialogTitle>
        <Typography variant='h6'>New Species</Typography>
        <DialogCloseButton onClick={handleCancel} />
      </DialogTitle>
      <DialogContent dividers>
        <Grid container spacing={4}>
          <Grid item xs={12}>
            <TextField
              id='name'
              value={name}
              onChange={setName}
              label={strings.SPECIES_NAME}
              aria-label='Species Name'
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Box width={'100%'} className={classes.actions}>
          <Box>
            <CancelButton onClick={handleCancel} />
            <Chip
              id='saveSpecies'
              className={classes.submit}
              label={strings.CREATE}
              clickable
              color='primary'
              onClick={handleOk}
            />
          </Box>
        </Box>
      </DialogActions>
    </Dialog>
  );
}
