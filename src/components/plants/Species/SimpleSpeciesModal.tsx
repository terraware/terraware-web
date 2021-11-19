import { Box, Grid, Typography } from '@material-ui/core';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import React from 'react';
import { useResetRecoilState } from 'recoil';
import { postSpecies, updateSpecies } from 'src/api/seeds/species';
import { Species } from 'src/api/types/species';
import speciesSelector from 'src/state/selectors/species';
import strings from 'src/strings';
import useForm from 'src/utils/useForm';
import Button from '../../common/button/Button';
import DialogCloseButton from '../../common/DialogCloseButton';
import TextField from '../../common/TextField';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
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
    spacing: {
      marginRight: theme.spacing(2),
    },
  })
);

export interface Props {
  open: boolean;
  onClose: (snackbarMessage?: string) => void;
  value?: Species;
}

function initSpecies(species?: Species): Species {
  return (
    species ?? {
      name: '',
      id: 0,
    }
  );
}
export default function SimpleSpeciesModal(props: Props): JSX.Element {
  const classes = useStyles();
  const { onClose, open } = props;
  const [record, setRecord, onChange] = useForm<Species>(initSpecies(props.value));
  const resetSpecies = useResetRecoilState(speciesSelector);

  React.useEffect(() => {
    if (props.open) {
      setRecord(initSpecies(props.value));
    }
  }, [props.open, props.value, setRecord]);

  const handleCancel = () => {
    setRecord(initSpecies(props.value));
    onClose();
  };

  const handleOk = async () => {
    let snackbarMessage = '';
    if (record.id === 0) {
      const newSpeciesData: Species = { name: record.name };
      const newSpecies = await postSpecies(newSpeciesData);
      if (newSpecies.id) {
        snackbarMessage = strings.SNACKBAR_MSG_NEW_SPECIES_ADDED;
      }
    } else {
      await updateSpecies(record);
      snackbarMessage = strings.SNACKBAR_MSG_CHANGES_SAVED;
    }
    resetSpecies();
    onClose(snackbarMessage);
  };

  return (
    <Dialog onClose={handleCancel} disableEscapeKeyDown open={open} maxWidth='md' classes={{ paper: classes.paper }}>
      <DialogTitle>
        <Typography variant='h6'>{props.value ? strings.EDIT_SPECIES : strings.ADD_SPECIES}</Typography>
        <DialogCloseButton onClick={handleCancel} />
      </DialogTitle>
      <DialogContent dividers>
        <Grid container spacing={4}>
          <Grid item xs={12}>
            <TextField
              id='name'
              value={record.name}
              onChange={onChange}
              label={strings.SPECIES_NAME}
              aria-label={strings.SPECIES_NAME}
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Box width={'100%'} className={classes.actions}>
          <Box />
          <Box>
            <Button
              onClick={handleCancel}
              id='cancel'
              label={strings.CANCEL}
              priority='secondary'
              type='passive'
              className={classes.spacing}
            />
            <Button onClick={handleOk} id='save-species' label={props.value ? strings.SAVE : strings.ADD} />
          </Box>
        </Box>
      </DialogActions>
    </Dialog>
  );
}
