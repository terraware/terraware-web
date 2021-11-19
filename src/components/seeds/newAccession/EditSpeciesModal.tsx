import { Box, Chip, DialogTitle, Typography } from '@material-ui/core';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import React from 'react';
import strings from 'src/strings';
import CancelButton from '../../common/CancelButton';
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
  onOk: () => void;
}

export default function EditSpeciesModal(props: Props): JSX.Element {
  const classes = useStyles();
  const { onClose, open, onOk } = props;

  return (
    <Dialog onClose={onClose} disableEscapeKeyDown open={open} maxWidth='sm' id='speciesModal'>
      <DialogTitle>
        <Typography component='p' variant='h6' className={classes.bold}>
          {strings.EDIT_SPECIES}
        </Typography>
        <Typography component='p'>{strings.EDIT_SPECIES_MODAL_QUESTION}</Typography>
        <DialogCloseButton onClick={onClose} />
      </DialogTitle>
      <DialogActions>
        <Box width={'100%'} className={classes.actions}>
          <Box>
            <CancelButton onClick={onClose} label={strings.EDIT_SPECIES_MODAL_ANSWER_NO} />
            <Chip
              id='applyAll'
              className={classes.submit}
              label={strings.EDIT_SPECIES_MODAL_ANSWER_YES}
              clickable
              color='primary'
              onClick={onOk}
            />
          </Box>
        </Box>
      </DialogActions>
    </Dialog>
  );
}
