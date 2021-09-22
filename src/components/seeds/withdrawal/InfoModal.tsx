import { Box, Chip, DialogTitle, Grid, Typography } from '@material-ui/core';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import React from 'react';
import strings from '../../../strings';
import DialogCloseButton from '../../common/DialogCloseButton';

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
      flexDirection: 'row-reverse',
    },
    bold: {
      fontWeight: theme.typography.fontWeightBold,
    },
  })
);

export interface Props {
  open: boolean;
  onClose: () => void;
}

export default function InfoModal(props: Props): JSX.Element {
  const classes = useStyles();
  const { onClose, open } = props;

  const handleOk = () => {
    onClose();
  };

  return (
    <Dialog onClose={handleOk} disableEscapeKeyDown open={open} maxWidth='sm'>
      <DialogTitle>
        <Typography component='p' variant='h6' className={classes.bold}>
          {strings.SEEDS_WITHDRAWN}
        </Typography>
        <DialogCloseButton onClick={handleOk} />
      </DialogTitle>
      <DialogContent dividers>
        <Grid container spacing={4}>
          <Grid item xs={12}>
            <Typography component='p'>
              {strings.BOTH_WITHDRAWS_DESCRIPTION}
            </Typography>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Box width={'100%'} className={classes.actions}>
          <Box>
            <Chip
              id='ok'
              className={classes.submit}
              label={strings.GOT_IT}
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
