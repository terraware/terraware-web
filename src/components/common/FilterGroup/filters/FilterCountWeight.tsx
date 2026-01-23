import React, { type JSX } from 'react';

import { Box, Grid, useTheme } from '@mui/material';

import Checkbox from 'src/components/common/Checkbox';
import Divisor from 'src/components/common/Divisor';
import Dropdown from 'src/components/common/Dropdown';
import TextField from 'src/components/common/TextField';
import strings from 'src/strings';
import { AndNodePayload, FieldNodePayload, OrNodePayload, SearchNodePayload } from 'src/types/Search';
import { weightUnits } from 'src/units';

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
  const defaultWeightUnit = 'Grams' as Unit;

  const theme = useTheme();
  const filter = React.useRef<OrNodePayload>(undefined);
  const [countMinValue, setCountMinValue] = React.useState<(string | null) | undefined>();
  const [countMaxValue, setCountMaxValue] = React.useState<(string | null) | undefined>();
  const [weightMinValue, setWeightMinValue] = React.useState<(string | null) | undefined>();
  const [weightMaxValue, setWeightMaxValue] = React.useState<(string | null) | undefined>();
  const [seedCount, setSeedCount] = React.useState(false);
  const [seedWeight, setSeedWeight] = React.useState(false);
  const [emptyFields, setEmptyFields] = React.useState(false);
  const [weightUnit, setWeightUnit] = React.useState(defaultWeightUnit);

  React.useEffect(() => {
    const quantity = props.payloads.find((p) => p.operation === 'and')?.children[1].values;

    const grams = props.payloads.find((p) => p.field === fields[1] && p.type === 'Range')?.values;
    const newEmptyFields = props.payloads.find((p) => p.type === 'Exact')?.values;

    if (quantity) {
      setSeedCount(Boolean(quantity));
    }
    setCountMinValue((quantity && quantity[0]) || null);
    setCountMaxValue((quantity && quantity[1]) || null);

    if (grams) {
      setSeedWeight(Boolean(grams));
    }
    setWeightMinValue((grams && grams[0]?.split(' ')[0]) || null);
    setWeightMaxValue((grams && grams[1]?.split(' ')[0]) || null);
    setWeightUnit((grams && grams[0]?.split(' ')[1]) ?? defaultWeightUnit);

    setEmptyFields(Boolean(newEmptyFields));
  }, [fields, props.payloads]);

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
    props.onChange(filter.current);
  };

  return (
    <Box
      sx={{
        width: '100%',
        padding: theme.spacing(1.75),
      }}
    >
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Checkbox
            id='seedCount'
            name='Seed Count'
            label={strings.SEED_COUNT}
            value={seedCount}
            onChange={(value) => onChange('seedCount', value)}
          />
        </Grid>
        <Grid item xs={6}>
          <TextField id='countMinValue' value={countMinValue} onChange={onChange} label={strings.MIN} />
        </Grid>
        <Grid item xs={6}>
          <TextField id='countMaxValue' value={countMaxValue} onChange={onChange} label={strings.MAX} />
        </Grid>
        <Grid item xs={6}>
          <TextField id='seeds' disabled={true} value={strings.SEEDS} onChange={onChange} label={strings.UNITS} />
        </Grid>
        <Grid item xs={12}>
          <Divisor mt={0} />
        </Grid>
        <Grid item xs={12}>
          <Checkbox
            id='seedWeight'
            name='Seed Weight'
            label={strings.SEED_WEIGHT}
            value={seedWeight}
            onChange={(value) => onChange('seedWeight', value)}
          />
        </Grid>
        <Grid item xs={6}>
          <TextField id='weightMinValue' value={weightMinValue} onChange={onChange} label={strings.MIN} />
        </Grid>
        <Grid item xs={6}>
          <TextField id='weightMaxValue' value={weightMaxValue} onChange={onChange} label={strings.MAX} />
        </Grid>
        <Grid item xs={6}>
          <Dropdown
            id='processingUnit'
            label={strings.UNITS}
            selected={weightUnit}
            values={weightUnits()}
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
            label={strings.INCLUDE_EMPTY_FIELDS}
            value={emptyFields}
            onChange={(value) => onChange('emptyFields', value)}
          />
        </Grid>
      </Grid>
    </Box>
  );
}
