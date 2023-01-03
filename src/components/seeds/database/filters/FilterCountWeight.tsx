import { ArrowForward } from '@mui/icons-material';
import { Grid } from '@mui/material';
import { makeStyles } from '@mui/styles';
import { Theme } from '@mui/material';
import React from 'react';
import { AndNodePayload, FieldNodePayload, OrNodePayload, SearchNodePayload } from 'src/api/search';
import Checkbox from 'src/components/common/Checkbox';
import Divisor from 'src/components/common/Divisor';
import Dropdown from 'src/components/common/Dropdown';
import TextField from 'src/components/common/TextField';
import strings from 'src/strings';
import { WEIGHT_UNITS } from 'src/units';

const useStyles = makeStyles((theme: Theme) => ({
  box: {
    width: '460px',
    padding: theme.spacing(1.75),
  },
  flexContainer: {
    alignItems: 'center',
    display: 'flex',
    justifyContent: 'center',
  },
}));

export type WEIGHT_QUANTITY_FIELDS = 'remainingQuantity' | 'totalQuantity' | 'withdrawalQuantity';
export const COUNT_WEIGHT_VALID_FIELDS: Record<WEIGHT_QUANTITY_FIELDS, string[]> = {
  remainingQuantity: ['remainingQuantity', 'remainingGrams', 'remainingUnits'],
  totalQuantity: ['totalQuantity', 'totalGrams', 'totalUnits'],
  withdrawalQuantity: ['withdrawalQuantity', 'withdrawalGrams', 'withdrawalUnits'],
};

interface Props {
  field: string;
  onChange: (filter: OrNodePayload) => void;
  payloads: SearchNodePayload[];
}

type Unit = 'Grams' | 'Milligrams' | 'Kilograms' | 'Pounds';

export default function FilterCountWeight(props: Props): JSX.Element {
  const fields = COUNT_WEIGHT_VALID_FIELDS[props.field as WEIGHT_QUANTITY_FIELDS];

  const classes = useStyles();
  const filter = React.useRef<OrNodePayload>();
  const [countMinValue, setCountMinValue] = React.useState<(string | null) | undefined>();
  const [countMaxValue, setCountMaxValue] = React.useState<(string | null) | undefined>();
  const [weightMinValue, setWeightMinValue] = React.useState<(string | null) | undefined>();
  const [weightMaxValue, setWeightMaxValue] = React.useState<(string | null) | undefined>();
  const [seedCount, setSeedCount] = React.useState(false);
  const [seedWeight, setSeedWeight] = React.useState(false);
  const [emptyFields, setEmptyFields] = React.useState(false);
  const [weightUnit, setWeightUnit] = React.useState(WEIGHT_UNITS[0].value as Unit);

  React.useEffect(() => {
    const quantity = props.payloads.find((p) => p.operation === 'and')?.children[1].values;

    const grams = props.payloads.find((p) => p.field === fields[1] && p.type === 'Range')?.values;
    const newEmptyFields = props.payloads.find((p) => p.type === 'Exact')?.values;
    if (quantity) {
      setSeedCount(true);
      setCountMinValue(quantity[0]);
      setCountMaxValue(quantity[1]);
    }
    if (grams) {
      setSeedWeight(true);
      setWeightMinValue(grams[0]?.split(' ')[0]);
      setWeightMaxValue(grams[1]?.split(' ')[0]);
      setWeightUnit(grams[0]?.split(' ')[1] ?? WEIGHT_UNITS[0].value);
    }
    if (newEmptyFields) {
      setEmptyFields(true);
    }
  }, [fields, props.payloads]);

  React.useEffect(() => {
    return () => {
      if (filter.current) {
        props.onChange(filter.current);
      }
    };
  }, [props]);

  const onChange = (id?: string, value?: unknown) => {
    let updatedCountMinValue = countMinValue;
    let updatedCountMaxValue = countMaxValue;
    let updatedWeightMinValue = weightMinValue;
    let updatedWeightMaxValue = weightMaxValue;
    let updatedWeightUnit = weightUnit;
    let updatedSeedCount = seedCount;
    let updatedSeedWeight = seedWeight;
    let updatedEmptyFields = emptyFields;

    if (id === 'countMinValue') {
      setCountMinValue(value as string);
      updatedCountMinValue = value as string;
    } else if (id === 'countMaxValue') {
      setCountMaxValue(value as string);
      updatedCountMaxValue = value as string;
    } else if (id === 'weightMinValue') {
      setWeightMinValue(value as string);
      updatedWeightMinValue = value as string;
    } else if (id === 'weightMaxValue') {
      setWeightMaxValue(value as string);
      updatedWeightMaxValue = value as string;
    } else if (id === 'processingUnit') {
      setWeightUnit(value as Unit);
      updatedWeightUnit = value as Unit;
    } else if (id === 'seedCount') {
      setSeedCount(value as boolean);
      updatedSeedCount = value as boolean;
    } else if (id === 'seedWeight') {
      setSeedWeight(value as boolean);
      updatedSeedWeight = value as boolean;
    } else if (id === 'emptyFields') {
      setEmptyFields(value as boolean);
      updatedEmptyFields = value as boolean;
    }

    const children: (FieldNodePayload | AndNodePayload)[] = [];

    if (updatedSeedCount && (updatedCountMinValue || updatedCountMaxValue)) {
      children.push({
        operation: 'and',
        children: [
          {
            operation: 'field',
            field: fields[2],
            values: ['Seeds'],
          },
          {
            operation: 'field',
            field: fields[0],
            type: 'Range',
            values: [updatedCountMinValue || null, updatedCountMaxValue || null],
          },
        ],
      });
    }
    if (updatedSeedWeight && (updatedWeightMinValue || updatedWeightMaxValue)) {
      children.push({
        operation: 'field',
        field: fields[1],
        type: 'Range',
        values: [
          updatedWeightMinValue ? `${updatedWeightMinValue} ${updatedWeightUnit}` : null,
          updatedWeightMaxValue ? `${updatedWeightMaxValue} ${updatedWeightUnit}` : null,
        ],
      });
    }
    if (updatedEmptyFields) {
      children.push({
        operation: 'field',
        field: fields[0],
        type: 'Exact',
        values: [null],
      });
    }

    filter.current = {
      operation: 'or',
      children,
    };
  };

  return (
    <div className={classes.box}>
      <Grid container spacing={4}>
        <Grid item xs={12}>
          <Checkbox
            id='seedCount'
            name='Seed Count'
            label='Seed Count'
            value={seedCount}
            onChange={(value) => onChange('seedCount', value)}
          />
        </Grid>
        <Grid item xs={5}>
          <TextField
            id='countMinValue'
            value={countMinValue}
            onChange={(value) => onChange('countMinValue', value)}
            label='Min'
          />
        </Grid>
        <Grid item xs={1} className={classes.flexContainer}>
          <ArrowForward />
        </Grid>
        <Grid item xs={5}>
          <TextField
            id='countMaxValue'
            value={countMaxValue}
            onChange={(value) => onChange('countMaxValue', value)}
            label='Max'
          />
        </Grid>
        <Grid item xs={5}>
          <TextField
            id='seeds'
            disabled={true}
            value='seeds'
            onChange={(value) => onChange('seeds', value)}
            label='Units'
          />
        </Grid>
        <Grid item xs={12}>
          <Divisor mt={0} />
        </Grid>
        <Grid item xs={12}>
          <Checkbox
            id='seedWeight'
            name='Seed Weight'
            label='Seed Weight'
            value={seedWeight}
            onChange={(value) => onChange('seedWeight', value)}
          />
        </Grid>
        <Grid item xs={5}>
          <TextField
            id='weightMinValue'
            value={weightMinValue}
            onChange={(value) => onChange('weightMinValue', value)}
            label='Min'
          />
        </Grid>
        <Grid item xs={1} className={classes.flexContainer}>
          <ArrowForward />
        </Grid>
        <Grid item xs={5}>
          <TextField
            id='weightMaxValue'
            value={weightMaxValue}
            onChange={(value) => onChange('weightMaxValue', value)}
            label='Max'
          />
        </Grid>
        <Grid item xs={5}>
          <Dropdown
            id='processingUnit'
            label={strings.UNITS}
            selected={weightUnit}
            values={WEIGHT_UNITS}
            onChange={(value) => onChange('processingUnit', value)}
          />
        </Grid>
        <Grid item xs={12}>
          <Divisor mt={0} />
        </Grid>
        <Grid item xs={12}>
          <Checkbox
            id='emptyFields'
            name='Empty Fields'
            label='Include empty fields'
            value={emptyFields}
            onChange={(value) => onChange('emptyFields', value)}
          />
        </Grid>
      </Grid>
    </div>
  );
}
