import MomentUtils from '@date-io/moment';
import {
  Box,
  Chip,
  DialogTitle,
  Grid,
  InputAdornment,
  Link,
  Typography,
} from '@material-ui/core';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import { MuiPickersUtilsProvider } from '@material-ui/pickers';
import React from 'react';
import { Germination, GerminationTest } from '../../api/types/tests';
import strings from '../../strings';
import preventDefault from '../../utils/preventDefaultEvent';
import useForm from '../../utils/useForm';
import CancelButton from '../common/CancelButton';
import DatePicker from '../common/DatePicker';
import DialogCloseButton from '../common/DialogCloseButton';
import Divisor from '../common/Divisor';
import Dropdown from '../common/Dropdown';
import TextArea from '../common/TextArea';
import TextField from '../common/TextField';
import { FieldError } from '../newAccession';

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
    },
    adornment: {
      marginRight: theme.spacing(1),
    },
  })
);

export interface Props {
  value?: GerminationTest;
  open: boolean;
  onClose: (value?: GerminationTest) => void;
  onDelete: (value: GerminationTest) => void;
  allowTestInGrams: boolean;
  seedsAvailable: number;
}

function initTest(test?: GerminationTest): GerminationTest {
  return (
    test ?? {
      testType: 'Nursery',
    }
  );
}

export default function NewTestDialog(props: Props): JSX.Element {
  const classes = useStyles();
  const { onClose, open, onDelete } = props;

  const [record, setRecord, onChange] = useForm<GerminationTest>(
    initTest(props.value)
  );
  const [seedsRemaining, setSeedsRemaining] = React.useState(0);
  const [viability, setSeedsViability] = React.useState('');
  const [unit, setUnit] = React.useState('');

  React.useEffect(() => {
    setRecord(initTest(props.value));
    if (
      record.germinations &&
      record.germinations[0].seedsGerminated &&
      record.seedsSown
    ) {
      setSeedsViability(
        (
          (record.germinations[0].seedsGerminated / record.seedsSown) *
          100
        ).toFixed(1)
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.open]);

  const handleCancel = () => {
    setRecord(initTest(props.value));
    onClose();
  };

  const handleOk = () => {
    onClose(record);
  };

  const [recordingDate, setRecordingDate] = React.useState<string>();
  const [seedsGerminated, setSeedsGerminated] = React.useState<number>();
  const [errors, setErrors] = React.useState<FieldError[]>([]);

  const typeOptions = props.allowTestInGrams
    ? WEIGHT_UNITS
    : [{ label: strings.S_SEED_COUNT, value: 'Seeds' }];

  React.useEffect(() => {
    setErrors([]);
    setUnit(props.allowTestInGrams ? 'weight' : 'count');
    if (!props.allowTestInGrams) {
      setSeedsRemaining(
        props.value?.remainingQuantity?.quantity || props.seedsAvailable
      );
    } else {
      setSeedsRemaining(props.value?.remainingQuantity?.quantity || 0);
    }
    setRecordingDate(
      props.value && props.value.germinations
        ? props.value.germinations[0].recordingDate
        : undefined
    );
    setSeedsGerminated(
      props.value && props.value.germinations
        ? props.value.germinations[0].seedsGerminated
        : undefined
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.open]);

  const onQuantityChange = (id: string, _value: unknown) => {
    const value = _value ? parseInt(_value as string) : undefined;
    setRecord({
      ...record,
      seedsSown: value,
    });
    if (value) {
      if (!props.allowTestInGrams) {
        setSeedsRemaining(props.seedsAvailable - value);
      }
      if (seedsGerminated) {
        setSeedsViability(((seedsGerminated / value) * 100).toFixed(1));
      }
    }
  };

  const onChangeGerminations = (id: string, value: unknown) => {
    let newRecordingDate = recordingDate;
    let newSeedsGerminated = seedsGerminated;

    if (id === 'recordingDate') {
      newRecordingDate = value as string;
      setRecordingDate(newRecordingDate);
    } else if (id === 'seedsGerminated') {
      newSeedsGerminated = value as number;
      setSeedsGerminated(newSeedsGerminated);
      if (record.seedsSown && record.seedsSown > 0) {
        setSeedsViability(
          ((newSeedsGerminated / record.seedsSown) * 100).toFixed(1)
        );
      } else {
        setSeedsViability('');
      }
    }

    if (newRecordingDate && newSeedsGerminated) {
      const germination: Germination = {
        recordingDate: newRecordingDate,
        seedsGerminated: newSeedsGerminated,
      };
      setRecord({ ...record, germinations: [germination] });
    } else {
      setRecord({ ...record, germinations: undefined });
    }
  };

  const onSeedsRemainingChange = (id: string, value: unknown) => {
    const newErrors = [...errors];
    const errorIndex = newErrors.findIndex((error) => error.id === id);
    if (!value) {
      if (errorIndex < 0) {
        newErrors.push({
          id: id,
          msg: strings.REQUIRED_FIELD,
        });
      }
    } else {
      if (errorIndex >= 0) {
        newErrors.splice(errorIndex, 1);
      }
    }
    setErrors(newErrors);
    setSeedsRemaining(value as number);
  };

  const getErrorText = (id: string) => {
    const error = errors.find((error) => error.id === id);
    return error ? error.msg : '';
  };

  const onSubmitHandler = () => {
    if (unit === 'weight' && !seedsRemaining) {
      onSeedsRemainingChange('seedsRemaining', '');
    } else {
      handleOk();
    }
  };

  const onRemainingChange = (id: string, _value: unknown) => {
    const newRemainingQuantity = {
      units: record.remainingQuantity?.units || WEIGHT_UNITS[0].value,
      quantity: record.remainingQuantity?.quantity || 0,
      [id]: _value,
    };

    const newRecord = {
      ...record,
      remainingQuantity: newRemainingQuantity,
    };

    if (id === 'quantity') {
      onSeedsRemainingChange('seedsRemaining', _value);
    }
    setRecord(newRecord);
  };

  return (
    <Dialog
      onClose={handleCancel}
      disableEscapeKeyDown
      open={open}
      maxWidth='sm'
    >
      <DialogTitle>
        <Typography variant='h6'>{strings.NEW_TEST}</Typography>
        <DialogCloseButton onClick={handleCancel} />
      </DialogTitle>
      <DialogContent dividers>
        <MuiPickersUtilsProvider utils={MomentUtils}>
          <Grid container spacing={4}>
            <Grid item xs={6}>
              <DatePicker
                id='startDate'
                value={record?.startDate}
                onChange={onChange}
                label={strings.START_DATE}
                aria-label='Start date'
              />
              <Typography component='p' variant='caption'>
                {strings.SCHEDULE_DATE_INFO}
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <Dropdown
                id='seedType'
                label={strings.SEED_TYPE}
                selected={record?.seedType || ''}
                values={[
                  { label: 'Fresh Seeds', value: 'Fresh' },
                  {
                    label: 'Stored Seeds',
                    value: 'Stored',
                  },
                ]}
                onChange={onChange}
              />
            </Grid>
            <Grid item xs={6}>
              <Dropdown
                id='substrate'
                label={strings.SUBSTRATE}
                selected={record?.substrate || ''}
                values={[
                  { label: 'Nursery Media', value: 'Nursery Media' },
                  {
                    label: 'Agar Petri Dish',
                    value: 'Agar Petri Dish',
                  },
                  { label: 'Paper Petri Dish', value: 'Paper Petri Dish' },
                  {
                    label: 'Other',
                    value: 'Other',
                  },
                ]}
                onChange={onChange}
              />
            </Grid>
            <Grid item xs={6}>
              <Dropdown
                id='treatment'
                label='Treatment'
                selected={record?.treatment || ''}
                values={[
                  { label: strings.SOAK, value: 'Soak' },
                  {
                    label: strings.SCARIFY,
                    value: 'Scarify',
                  },
                  {
                    label: strings.GA3,
                    value: 'GA3',
                  },
                  {
                    label: strings.STRATIFICATION,
                    value: 'Stratification',
                  },
                  {
                    label: strings.OTHER,
                    value: 'Other',
                  },
                ]}
                onChange={onChange}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                id='seedsSown'
                value={record?.seedsSown}
                onChange={(id, value) => {
                  onQuantityChange(id, value);
                }}
                label={strings.SEEDS_SOWN}
                type='Number'
                endAdornment={
                  <InputAdornment position='end' className={classes.adornment}>
                    {strings.SEED_COUNT.toLowerCase()}
                  </InputAdornment>
                }
              />
            </Grid>
            {unit === 'count' && (
              <Grid item xs={6}>
                <TextField
                  id='seedsRemaining'
                  value={seedsRemaining}
                  onChange={onSeedsRemainingChange}
                  label={strings.SEEDS_REMAINING}
                  disabled={true}
                  type='Number'
                />
              </Grid>
            )}
            {unit === 'weight' && (
              <Grid item xs={6}>
                <TextField
                  id='quantity'
                  value={record.remainingQuantity?.quantity}
                  onChange={onRemainingChange}
                  label={strings.SEEDS_REMAINING}
                  type='Number'
                  endAdornment={
                    <InputAdornment position='end'>
                      <Dropdown
                        id='units'
                        label=''
                        selected={
                          record.remainingQuantity?.units ||
                          WEIGHT_UNITS[0].value
                        }
                        values={typeOptions}
                        onChange={onRemainingChange}
                      />
                    </InputAdornment>
                  }
                  required={true}
                  helperText={
                    getErrorText('seedsRemaining') || strings.REQUIRED_FIELD
                  }
                  error={getErrorText('seedsRemaining') ? true : false}
                />
              </Grid>
            )}
            <Grid item xs={6}>
              <TextField
                id='seedsGerminated'
                value={seedsGerminated}
                onChange={onChangeGerminations}
                label={strings.SEEDS_GERMINATED}
                type='Number'
                endAdornment={
                  <InputAdornment position='end' className={classes.adornment}>
                    {strings.SEED_COUNT.toLowerCase()}
                  </InputAdornment>
                }
              />
            </Grid>
            <Grid item xs={6}>
              <DatePicker
                id='recordingDate'
                value={recordingDate}
                onChange={onChangeGerminations}
                label={strings.RECORDING_DATE}
                aria-label='Recording date'
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                id='viability'
                value={viability}
                onChange={onChange}
                label={strings.PERCENTAGE_VIABILITY}
                disabled={true}
                type='Number'
              />
              <Typography component='p' variant='caption'>
                {strings.AUTOCALCULATED}
              </Typography>
            </Grid>
          </Grid>
          <Divisor />
          <Grid container spacing={4}>
            <Grid item xs={12}>
              <TextArea
                id='notes'
                value={record?.notes}
                onChange={onChange}
                label={strings.NOTES}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                id='staffResponsible'
                value={record?.staffResponsible}
                onChange={onChange}
                label={strings.GERMINATION_TESTED_BY}
              />
            </Grid>
          </Grid>
        </MuiPickersUtilsProvider>
      </DialogContent>
      <DialogActions>
        <Box width={record?.id && '100%'} className={classes.actions}>
          {record?.id && (
            <Link
              id='deleteTest'
              color='secondary'
              href='#'
              onClick={(event: React.SyntheticEvent) => {
                preventDefault(event);
                onDelete(record);
              }}
            >
              <Typography component='p' variant='body2'>
                {strings.DELETE}
              </Typography>
            </Link>
          )}
          <Box>
            <CancelButton onClick={handleCancel} />
            <Chip
              id='saveTest'
              className={classes.submit}
              label={props.value ? strings.SAVE_CHANGES : strings.CREATE_TEST}
              clickable
              color='primary'
              disabled={errors.length > 0}
              onClick={onSubmitHandler}
            />
          </Box>
        </Box>
      </DialogActions>
    </Dialog>
  );
}

export interface Unit {
  label: string;
  value: 'Grams' | 'Milligrams' | 'Kilograms' | 'Pounds' | 'Seeds' | 'Ounces';
}

export const WEIGHT_UNITS: Unit[] = [
  { label: strings.G_GRAMS, value: 'Grams' },
  { label: strings.MG_MILLIGRAMS, value: 'Milligrams' },
  { label: strings.KG_KILOGRAMS, value: 'Kilograms' },
  { label: strings.LB_POUNDS, value: 'Pounds' },
  { label: strings.OZ_OUNCES, value: 'Ounces' },
];
