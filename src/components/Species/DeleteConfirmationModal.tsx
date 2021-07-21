import { Box, Chip, Typography } from '@material-ui/core';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import React from 'react';
import { useRecoilValue, useResetRecoilState } from 'recoil';
import { deleteSpeciesName } from '../../api/speciesNames';
import { SpeciesName } from '../../api/types/species';
import sessionSelector from '../../state/selectors/session';
import speciesNamesSelector from '../../state/selectors/speciesNames';
import CancelButton from '../common/CancelButton';
import DialogCloseButton from '../common/DialogCloseButton';

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
  onClose: (deleted?: boolean) => void;
  specieName: SpeciesName;
}

export default function DeleteConfirmationModal(props: Props): JSX.Element {
  const classes = useStyles();
  const { onClose, open } = props;
  const session = useRecoilValue(sessionSelector);
  const resetSpecies = useResetRecoilState(speciesNamesSelector);

  const handleCancel = () => {
    onClose();
  };

  const handleOk = async () => {
    if (session && props.specieName.id) {
      await deleteSpeciesName(props.specieName.id, session);
      resetSpecies();
    }
    onClose(true);
  };

  return (
    <Dialog
      onClose={handleCancel}
      disableEscapeKeyDown
      open={open}
      maxWidth='sm'
      classes={{ paper: classes.paper }}
    >
      <DialogTitle>
        <Typography variant='h6'>Delete Species</Typography>
        <DialogCloseButton onClick={handleCancel} />
      </DialogTitle>
      <DialogContent>
        <Typography variant='body2'>
          Are you sure you want to delete this species? This action cannot be
          undone. Any plants with this species will now be categorized as
          “Other” for its species.
        </Typography>
      </DialogContent>
      <DialogActions>
        <Box width={'100%'} className={classes.actions}>
          <Box />
          <Box>
            <CancelButton onClick={handleCancel} />
            <Chip
              id='delete'
              className={classes.submit}
              label='Delete'
              clickable
              color='secondary'
              onClick={handleOk}
            />
          </Box>
        </Box>
      </DialogActions>
    </Dialog>
  );
}
