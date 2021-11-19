import { Box, Chip, DialogTitle, Typography } from '@material-ui/core';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import React from 'react';
import strings from 'src/strings';
import DialogCloseButton from '../../common/DialogCloseButton';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    submit: {
      color: theme.palette.common.white,
      fontSize: theme.typography.body1.fontSize,
      padding: theme.spacing(3, 1),
      marginBottom: theme.spacing(1),
      borderRadius: theme.spacing(3),
    },
    cancel: {
      backgroundColor: theme.palette.common.white,
      color: theme.palette.neutral[800],
      textDecoration: 'underline',
      fontSize: theme.typography.body1.fontSize,
      '&:hover': {
        backgroundColor: theme.palette.common.white,
      },
    },
    actions: {
      display: 'flex',
      alignItems: 'center',
      flexDirection: 'column',
    },
    bold: {
      fontWeight: theme.typography.fontWeightBold,
    },
    modalImage: {
      borderTop: `10px solid ${theme.palette.neutral[800]}`,
      borderLeft: `10px solid ${theme.palette.neutral[800]}`,
      borderTopLeftRadius: theme.spacing(1),
    },
    modalTitle: {
      padding: theme.spacing(5, 0, 3, 0),
      margin: '0 auto',
      maxWidth: '350px',
      textAlign: 'center',
    },
    modalContainer: {},
    imageContainer: {
      paddingLeft: theme.spacing(8),
      paddingTop: theme.spacing(1),
      lineHeight: '0',
    },
  })
);

export interface Props {
  open: boolean;
  onClose: () => void;
  onOk: () => void;
}

export default function OnboardingModal(props: Props): JSX.Element {
  const classes = useStyles();
  const { onClose, open, onOk } = props;

  return (
    <Dialog onClose={onClose} disableEscapeKeyDown open={open} maxWidth='lg' id='onboardingModal'>
      <DialogTitle className={classes.modalTitle}>
        <Typography component='p' variant='h5' className={classes.bold}>
          {strings.TOUR_TITLE}
        </Typography>
        <Typography component='p'>{strings.TOUR_DESCRIPTION}</Typography>
        <DialogCloseButton onClick={onClose} />
      </DialogTitle>
      <DialogActions>
        <Box width={'100%'} className={classes.actions}>
          <Chip
            id='acceptTour'
            className={classes.submit}
            label={strings.ACCEPT_TOUR}
            clickable
            color='primary'
            onClick={onOk}
          />
          <Chip id='declineTour' className={classes.cancel} label={strings.DECLINE_TOUR} clickable onClick={onClose} />
        </Box>
      </DialogActions>
      <div className={classes.imageContainer}>
        <img src='/assets/summaryImage.png' width='100%' className={classes.modalImage} alt='summary' />
      </div>
    </Dialog>
  );
}
