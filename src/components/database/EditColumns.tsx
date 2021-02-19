import { Box, Chip, Grid, Typography } from '@material-ui/core';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import React from 'react';
import { SearchField } from '../../api/types/search';
import useForm from '../../utils/useForm';
import Checkbox from '../common/Checkbox';
import Divisor from '../common/Divisor';
import RadioButton from '../common/RadioButton';
import { COLUMNS, Preset, searchPresets } from './columns';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    submit: {
      marginLeft: theme.spacing(2),
      color: theme.palette.common.white,
    },
    cancel: {
      backgroundColor: theme.palette.grey[200],
    },
    actions: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingLeft: theme.spacing(2),
    },
    bold: {
      fontWeight: theme.typography.fontWeightBold,
    },
  })
);

export interface Props {
  open: boolean;
  onClose: (columns?: Record<SearchField, boolean>) => void;
  value: Record<SearchField, boolean>;
}

export default function NewWithdrawalDialog(props: Props): JSX.Element {
  const classes = useStyles();
  const { onClose, open } = props;
  const [preset, setPreset] = React.useState<Preset>(searchPresets[0]);

  const [record, setRecord, onChange] = useForm<Record<SearchField, boolean>>(
    props.value
  );
  React.useEffect(() => {
    setRecord(props.value);
    setPreset(searchPresets[0]);
  }, [props.value]);

  const handleCancel = () => {
    onClose();
  };

  const handleOk = () => {
    onClose(record);
  };

  const onSelectPreset = (updatedPreset: Preset) => {
    setPreset(updatedPreset);

    const updatedRecords = updatedPreset.fields.reduce((acum, field) => {
      acum[field] = true;
      return acum;
    }, {} as Record<SearchField, boolean>);

    setRecord(updatedRecords);
  };

  return (
    <Dialog
      disableBackdropClick
      disableEscapeKeyDown
      open={open}
      maxWidth='md'
      fullWidth={true}
    >
      <DialogTitle>
        <Typography component='p' variant='h6' className={classes.bold}>
          Edit columns
        </Typography>
        <Typography component='p'>
          Select columns you want to add. Deselect columns you want to remove.
        </Typography>
      </DialogTitle>

      <DialogContent>
        <Typography component='p'>Presets</Typography>
        <Grid container>
          <Grid item xs={4}>
            <Grid container>
              {searchPresets.map((p) => (
                <Grid key={p.name} item xs={12}>
                  <RadioButton
                    id={p.name}
                    name={p.name}
                    label={p.name}
                    value={p.name === preset.name}
                    onChange={() => onSelectPreset(p)}
                  />
                </Grid>
              ))}
            </Grid>
          </Grid>
        </Grid>

        {sections.map(({ name, options }) => (
          <React.Fragment key={name}>
            <Divisor />
            <Typography component='p'>{name}</Typography>
            <Grid container spacing={4}>
              {options.map((optionsColumn, index) => (
                <Grid key={index} item xs={4}>
                  <Grid container>
                    {optionsColumn.map(({ key, disabled, name }) => (
                      <Grid key={key} item xs={12}>
                        <Checkbox
                          disabled={disabled}
                          id={key}
                          name={key}
                          label={name}
                          value={record[key]}
                          onChange={(id, value) => onChange(key, value)}
                        />
                      </Grid>
                    ))}
                  </Grid>
                </Grid>
              ))}
            </Grid>
          </React.Fragment>
        ))}
      </DialogContent>

      <DialogActions>
        <Box className={classes.actions}>
          <Box>
            <Chip
              id='cancel'
              className={classes.cancel}
              label='Cancel'
              clickable
              onClick={handleCancel}
            />
            <Chip
              id='submit'
              className={classes.submit}
              label='Save changes'
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

interface Option {
  name: string;
  key: SearchField;
  disabled?: boolean;
}

interface Section {
  name: string;
  options: Option[][];
}

const sections: Section[] = [
  {
    name: 'General',
    options: [[{ ...COLUMNS[0], disabled: true }], [COLUMNS[1]], [COLUMNS[2]]],
  },
  {
    name: 'Seed Collection',
    options: [
      [COLUMNS[3], COLUMNS[4], COLUMNS[5], COLUMNS[6]],
      [COLUMNS[7], COLUMNS[8], COLUMNS[9]],
      [COLUMNS[10], COLUMNS[11], COLUMNS[12], COLUMNS[13]],
    ],
  },
  {
    name: 'Processing and Drying',
    options: [
      [COLUMNS[14], COLUMNS[15]],
      [COLUMNS[16], COLUMNS[17]],
      [COLUMNS[18], COLUMNS[19]],
    ],
  },
  {
    name: 'Storing',
    options: [
      [COLUMNS[20], COLUMNS[21]],
      [COLUMNS[22]],
      [COLUMNS[23], COLUMNS[24]],
    ],
  },
  {
    name: 'Withdrawal',
    options: [
      [COLUMNS[25], COLUMNS[26]],
      [COLUMNS[27], COLUMNS[28]],
      [COLUMNS[29], COLUMNS[30], COLUMNS[31]],
    ],
  },
  {
    name: 'Germination Testing',
    options: [
      [COLUMNS[32], COLUMNS[33], COLUMNS[34], COLUMNS[35], COLUMNS[36]],
      [COLUMNS[37], COLUMNS[38], COLUMNS[39], COLUMNS[40]],
      [COLUMNS[41], COLUMNS[42], COLUMNS[43], COLUMNS[44]],
    ],
  },
  {
    name: 'Viability',
    options: [[COLUMNS[45]], [COLUMNS[46]]],
  },
];
