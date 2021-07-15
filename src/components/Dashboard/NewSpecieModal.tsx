import {
  Box,
  Chip,
  FormControl,
  FormControlLabel,
  Grid,
  Radio,
  RadioGroup,
  Typography,
} from '@material-ui/core';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import React from 'react';
import { Species } from '../../api/types/species';
import strings from '../../strings';
import useForm from '../../utils/useForm';
import CancelButton from '../common/CancelButton';
import DialogCloseButton from '../common/DialogCloseButton';
import TextField from '../common/TextField';
import { SpecieMap } from './Map';

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
    container: {
      border: `1px solid ${theme.palette.grey[400]}`,
      borderRadius: '4px',
      display: 'block',
      padding: theme.spacing(1),
    },
  })
);

export interface Props {
  open: boolean;
  onClose: (specie?: Species) => void;
  value?: SpecieMap;
}

const initSpecies = (specie?: SpecieMap): Species => {
  return specie
    ? {
        scientific_name:
          specie.properties.NAME !== 'Other' ? specie.properties.NAME : '',
        id: specie.properties.SPECIE_ID,
      }
    : {
        scientific_name: '',
      };
};

export default function NewSpecieModal(props: Props): JSX.Element {
  const classes = useStyles();
  const { onClose, open } = props;
  const [record, setRecord, onChange] = useForm<Species>(
    initSpecies(props.value)
  );
  const [value, setValue] = React.useState('female');

  React.useEffect(() => {
    if (props.open) {
      setRecord(initSpecies(props.value));
    }
  }, [props.open, props.value, setRecord]);

  const handleCancel = () => {
    setRecord(initSpecies(props.value));
    onClose();
  };

  const handleOk = () => {
    onClose(record);
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setValue((event.target as HTMLInputElement).value);
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
          {props.value?.properties.NAME !== 'Other'
            ? 'Edit Species'
            : 'Add Species'}
        </Typography>
        <DialogCloseButton onClick={handleCancel} />
      </DialogTitle>
      <DialogContent dividers>
        <Grid container spacing={4}>
          <Grid item xs={12}>
            <TextField
              id='name'
              value={record.scientific_name}
              onChange={onChange}
              label={strings.SPECIES_NAME}
              aria-label='Species Name'
            />
          </Grid>
        </Grid>
        <Grid container spacing={4}>
          <Grid item xs={12}>
            <Typography component='p' variant='subtitle2'>
              OR
            </Typography>
          </Grid>
        </Grid>
        <Grid container spacing={4}>
          <Grid item xs={12}>
            <FormControl component='fieldset' className={classes.container}>
              <RadioGroup
                aria-label='gender'
                name='gender1'
                value={value}
                onChange={handleChange}
              >
                <FormControlLabel
                  value='female'
                  control={<Radio />}
                  label='Flower'
                />
                <FormControlLabel
                  value='male'
                  control={<Radio />}
                  label='Dododanea'
                />
                <FormControlLabel
                  value='other'
                  control={<Radio />}
                  label='Acacia'
                />
              </RadioGroup>
            </FormControl>
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
              label={props.value?.properties.NAME !== 'Other' ? 'Save' : 'Add'}
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
