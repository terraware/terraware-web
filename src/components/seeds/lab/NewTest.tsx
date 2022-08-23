import {
  Box,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  InputAdornment,
  Link,
  Theme,
  Typography,
} from '@mui/material';
import React from 'react';
import { ViabilityTest } from 'src/api/types/tests';
import strings from 'src/strings';
import preventDefault from 'src/utils/preventDefaultEvent';
import useForm from 'src/utils/useForm';
import DatePicker from '../../common/DatePicker';
import DialogCloseButton from '../../common/DialogCloseButton';
import Divisor from '../../common/Divisor';
import Dropdown from '../../common/Dropdown';
import TextArea from '../../common/TextArea';
import TextField from '../../common/TextField';
import { FieldError } from '../newAccession';
import { WEIGHT_UNITS } from '../nursery/NewTest';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { makeStyles } from '@mui/styles';
import useDeviceInfo from 'src/utils/useDeviceInfo';
import Button from 'src/components/common/button/Button';

const useStyles = makeStyles((theme: Theme) => ({
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
}));

export interface Props {
  value?: ViabilityTest;
  open: boolean;
  onClose: (value?: ViabilityTest) => void;
  onDelete: (value: ViabilityTest) => void;
  allowTestInGrams: boolean;
  seedsAvailable: number;
}

function initTest(test?: ViabilityTest): ViabilityTest {
  return (
    test ?? {
      testType: 'Lab',
      selected: false,
    }
  );
}

export default function NewTestDialog(props: Props): JSX.Element {
  const classes = useStyles();
  const { onClose, open, onDelete } = props;
  const [record, setRecord, onChange] = useForm<ViabilityTest>(initTest(props.value));
  const [seedsRemaining, setSeedsRemaining] = React.useState(0);
  const [unit, setUnit] = React.useState('');
  const [errors, setErrors] = React.useState<FieldError[]>([]);
  const { isMobile } = useDeviceInfo();

  const typeOptions = props.allowTestInGrams ? WEIGHT_UNITS : [{ label: strings.S_SEED_COUNT, value: 'Seeds' }];

  React.useEffect(() => {
    setErrors([]);
    setUnit(props.allowTestInGrams ? 'weight' : 'count');
    if (!props.allowTestInGrams) {
      setSeedsRemaining(props.value?.remainingQuantity?.quantity || props.seedsAvailable);
    } else {
      setSeedsRemaining(props.value?.remainingQuantity?.quantity || 0);
    }
    if (props.open) {
      setRecord(initTest(props.value));
    }
  }, [props.allowTestInGrams, props.open, props.seedsAvailable, props.value, setRecord]);

  const handleCancel = () => {
    setRecord(initTest(props.value));
    onClose();
  };

  const handleOk = () => {
    onClose(record);
  };

  const onQuantityChange = (id: string, _value: unknown) => {
    const value = _value ? parseInt(_value as string, 10) : undefined;
    setRecord((previousRecord: ViabilityTest): ViabilityTest => {
      return {
        ...previousRecord,
        seedsSown: value,
      };
    });
    if (!props.allowTestInGrams && value) {
      setSeedsRemaining(props.seedsAvailable - value);
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

    setRecord(newRecord);
    if (id === 'quantity') {
      onSeedsRemainingChange('seedsRemaining', _value);
    }
  };

  const onSeedsRemainingChange = (id: string, value: unknown) => {
    const newErrors = [...errors];
    const errorIndex = newErrors.findIndex((error) => error.id === id);
    if (!value) {
      if (errorIndex < 0) {
        newErrors.push({
          id,
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
    const error = errors.find((_error) => _error.id === id);

    return error ? error.msg : '';
  };

  const onSubmitHandler = () => {
    if (unit === 'weight' && !seedsRemaining) {
      onSeedsRemainingChange('seedsRemaining', '');
    } else {
      handleOk();
    }
  };

  const gridSize = () => {
    if (isMobile) {
      return 12;
    }
    return 6;
  };

  return (
    <Dialog onClose={handleCancel} disableEscapeKeyDown open={open} maxWidth='sm'>
      <DialogTitle>
        <Typography variant='body1'>{strings.NEW_TEST}</Typography>
        <DialogCloseButton onClick={handleCancel} />
      </DialogTitle>
      <DialogContent dividers>
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <Grid container spacing={4}>
            <Grid item xs={gridSize()}>
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
            <Grid item xs={gridSize()}>
              <Dropdown
                id='seedType'
                label='Seed type'
                selected={record?.seedType || ''}
                values={[
                  { label: strings.FRESH_SEEDS, value: 'Fresh' },
                  {
                    label: strings.STORED_SEEDS,
                    value: 'Stored',
                  },
                ]}
                onChange={onChange}
              />
            </Grid>
            <Grid item xs={gridSize()}>
              <Dropdown
                id='substrate'
                label='Substrate'
                selected={record?.substrate || ''}
                values={[
                  { label: strings.NURSERY_MEDIA, value: 'Nursery Media' },
                  {
                    label: strings.AGAR_PETRI_DISH,
                    value: 'Agar Petri Dish',
                  },
                  {
                    label: strings.PAPER_PETRI_DISH,
                    value: 'Paper Petri Dish',
                  },
                  {
                    label: strings.OTHER,
                    value: 'Other',
                  },
                ]}
                onChange={onChange}
              />
            </Grid>
            <Grid item xs={gridSize()}>
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
            <Grid item xs={gridSize()}>
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
              <Grid item xs={gridSize()}>
                <TextField
                  id='seedsRemaining'
                  value={seedsRemaining}
                  onChange={onChange}
                  label={strings.SEEDS_REMAINING}
                  disabled={true}
                  type='Number'
                />
              </Grid>
            )}
            {unit === 'weight' && (
              <Grid item xs={gridSize()}>
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
                        selected={record.remainingQuantity?.units || WEIGHT_UNITS[0].value}
                        values={typeOptions}
                        onChange={onRemainingChange}
                      />
                    </InputAdornment>
                  }
                  required={true}
                  helperText={getErrorText('seedsRemaining') || strings.REQUIRED_FIELD}
                  error={getErrorText('seedsRemaining') ? true : false}
                />
              </Grid>
            )}
          </Grid>
          <Divisor />
          <Grid container spacing={4}>
            <Grid item xs={12}>
              <TextArea id='notes' value={record?.notes} onChange={onChange} label={strings.NOTES} />
            </Grid>
            <Grid item xs={gridSize()}>
              <TextField
                id='staffResponsible'
                value={record?.staffResponsible}
                onChange={onChange}
                label={strings.GERMINATION_TESTED_BY}
              />
            </Grid>
          </Grid>
        </LocalizationProvider>
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
            <Button
              label={strings.CANCEL}
              priority='secondary'
              type='passive'
              onClick={handleCancel}
              key='button-1'
              id='cancel'
            />
            <Chip
              id='saveTest'
              className={classes.submit}
              label={props.value ? strings.SAVE_CHANGES : strings.CREATE_TEST}
              clickable
              color='primary'
              disabled={errors.length > 0 || seedsRemaining < 0}
              onClick={onSubmitHandler}
            />
          </Box>
        </Box>
      </DialogActions>
    </Dialog>
  );
}
