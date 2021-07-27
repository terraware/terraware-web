import { Box, Chip, Grid, Typography } from '@material-ui/core';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import React from 'react';
import { useRecoilValue, useResetRecoilState } from 'recoil';
import { postSpecies } from '../../api/species';
import { postSpeciesName, putSpeciesName } from '../../api/speciesNames';
import { SpeciesName } from '../../api/types/species';
import sessionSelector from '../../state/selectors/session';
import { speciesNamesSelector } from '../../state/selectors/speciesNamesBySpeciesId';
import strings from '../../strings';
import useForm from '../../utils/useForm';
import CancelButton from '../common/CancelButton';
import DialogCloseButton from '../common/DialogCloseButton';
import TextField from '../common/TextField';

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
    deleteSpecies: {
      backgroundColor: theme.palette.common.white,
      borderColor: theme.palette.secondary.main,
      color: theme.palette.secondary.main,
      borderWidth: 1,
    },
  })
);

export interface Props {
  open: boolean;
  onClose: (snackbarMessage?: string) => void;
  value?: SpeciesName;
  onDelete: () => void;
}

function initSpecies(species?: SpeciesName): SpeciesName {
  return (
    species ?? {
      name: '',
      species_id: 0,
    }
  );
}
export default function EditSpecieModal(props: Props): JSX.Element {
  const classes = useStyles();
  const { onClose, open, onDelete } = props;
  const [record, setRecord, onChange] = useForm<SpeciesName>(
    initSpecies(props.value)
  );
  const session = useRecoilValue(sessionSelector);
  const resetSpecies = useResetRecoilState(speciesNamesSelector);

  React.useEffect(() => {
    if (props.open) {
      setRecord(initSpecies(props.value));
    }
  }, [props.open, props.value, setRecord]);

  const handleCancel = () => {
    setRecord(initSpecies(props.value));
    onClose();
  };

  const handleDelete = () => {
    onDelete();
    onClose();
  };

  const handleOk = async () => {
    let snackbarMessage = '';
    if (session) {
      if (record.species_id === 0) {
        const specie = await postSpecies({}, session);
        if (specie.id) {
          record.species_id = specie.id;
          await postSpeciesName(record, session);
          snackbarMessage = strings.SNACKBAR_MSG_NEW_SPECIES_ADDED;
        }
      } else {
        await putSpeciesName(record, session);
        snackbarMessage = strings.SNACKBAR_MSG_CHANGES_SAVED;
      }
      resetSpecies();
    }
    onClose(snackbarMessage);
  };

  return (
    <Dialog
      onClose={handleCancel}
      disableEscapeKeyDown
      open={open}
      maxWidth='md'
      classes={{ paper: classes.paper }}
    >
      <DialogTitle>
        <Typography variant='h6'>
          {props.value ? strings.EDIT_SPECIES : strings.ADD_SPECIES}
        </Typography>
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
          <Box>
            {props.value && (
              <Chip
                id='delete-specie'
                className={classes.deleteSpecies}
                label={strings.DELETE}
                clickable
                onClick={handleDelete}
                variant='outlined'
              />
            )}
          </Box>
          <Box>
            <CancelButton onClick={handleCancel} />
            <Chip
              id='save-specie'
              className={classes.submit}
              label={props.value ? strings.SAVE : strings.ADD}
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
