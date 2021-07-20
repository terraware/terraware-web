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
import speciesNamesSelector from '../../state/selectors/speciesNames';
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
  })
);

export interface Props {
  open: boolean;
  onClose: (speciesName?: SpeciesName, newSpecies?: boolean) => void;
  value?: SpeciesName;
}

export default function EditSpecieModal(props: Props): JSX.Element {
  function initSpecies(specie?: SpeciesName): SpeciesName {
    return (
      specie ?? {
        name: '',
        species_id: 0,
      }
    );
  }

  const classes = useStyles();
  const { onClose, open } = props;
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
    onClose();
  };

  const handleOk = async () => {
    if (session) {
      if (record.species_id === 0) {
        const specie = await postSpecies({}, session);
        if (specie.id) {
          record.species_id = specie.id;
          postSpeciesName(record, session);
        }
      } else {
        await putSpeciesName(record, session);
      }
      resetSpecies();
    }
    onClose();
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
          {props.value ? 'Edit Species' : 'Add Species'}
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
              id='saveSpecie'
              className={classes.submit}
              label={props.value ? 'Save' : 'Add'}
              clickable
              color='primary'
              onClick={handleOk}
            />
          </Box>
          <Box>
            <CancelButton label={strings.DELETE} onClick={handleDelete} />
          </Box>
        </Box>
      </DialogActions>
    </Dialog>
  );
}
