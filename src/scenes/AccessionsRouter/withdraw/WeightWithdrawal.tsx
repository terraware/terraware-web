import React, { type JSX, useCallback, useEffect, useMemo, useState } from 'react';

import { Box, Grid, Typography, useTheme } from '@mui/material';
import { Checkbox, Textfield } from '@terraware/web-components';

import WeightUnitsSelector from 'src/components/WeightUnitsSelector';
import strings from 'src/strings';
import { Accession } from 'src/types/Accession';
import { UnitType, convertUnits, convertWeightToSeedCount, unitAbbv } from 'src/units';

export interface WeightWithdrawalProps {
  accession: Accession;
  purpose: string | undefined;
  units: UnitType;
  onUnitsUpdate: (units: UnitType) => void;
  onWithdrawCtUpdate: (withdrawnQuantity: number, valid: boolean) => void;
}

export default function WeightWithdrawal(props: WeightWithdrawalProps): JSX.Element {
  const { accession, purpose, units, onUnitsUpdate, onWithdrawCtUpdate } = props;

  const [withdrawAllSelected, setWithdrawAllSelected] = useState(false);
  const theme = useTheme();
  const [estimatedWithdrawnCt, setEstimatedWithdrawnCt] = useState<number>(0);
  const [withdrawnQuantity, setWithdrawnQuantity] = useState<number | undefined>(0);
  const [withdrawnQtyError, setWithdrawnQtyError] = useState<string>('');

  const remainingWeight = useMemo(
    () => (accession.remainingQuantity?.units === 'Seeds' ? accession.estimatedWeight : accession.remainingQuantity),
    [accession.estimatedWeight, accession.remainingQuantity]
  );

  const remainingCount = useMemo(() => {
    if (accession.remainingQuantity?.units === 'Seeds') {
      return accession.remainingQuantity.quantity;
    }
    if (!remainingWeight || !accession.subsetCount || !accession.subsetWeight?.quantity) {
      return undefined;
    }
    return convertWeightToSeedCount(
      remainingWeight.quantity,
      remainingWeight.units,
      accession.subsetWeight,
      accession.subsetCount
    );
  }, [accession.remainingQuantity, accession.subsetCount, accession.subsetWeight, remainingWeight]);

  useEffect(() => {
    setWithdrawnQtyError('');
    if (purpose === 'Nursery' || purpose === 'Viability Testing') {
      if (!accession.subsetCount || !accession.subsetWeight?.quantity) {
        setWithdrawnQtyError(
          purpose === 'Nursery'
            ? strings.MISSING_SUBSET_WEIGHT_ERROR_NURSERY
            : strings.MISSING_SUBSET_WEIGHT_ERROR_VIABILITY_TEST
        );
      }
    }
  }, [purpose, accession.subsetCount, accession.subsetWeight?.quantity]);

  const validateAmount = useCallback(
    (estimated: number, withdrawnQty: number | undefined, withdrawnUnits: UnitType) => {
      if (
        purpose === 'Nursery' &&
        (!accession.estimatedCount || !accession.subsetWeight?.quantity || !accession.subsetCount)
      ) {
        setWithdrawnQtyError(strings.MISSING_SUBSET_WEIGHT_ERROR_NURSERY);
        return false;
      }
      if (
        purpose === 'Viability Testing' &&
        (!accession.estimatedCount || !accession.subsetWeight?.quantity || !accession.subsetCount)
      ) {
        setWithdrawnQtyError(strings.MISSING_SUBSET_WEIGHT_ERROR_VIABILITY_TEST);
        return false;
      }
      if (!estimated) {
        setWithdrawnQtyError(strings.WITHDRAWAL_COUNT_GREATER_THAN_ZERO_ERROR);
        return false;
      }
      if (!withdrawnQty) {
        setWithdrawnQtyError(strings.REQUIRED_FIELD);
        return false;
      }
      if (isNaN(withdrawnQty) || Number(withdrawnQty) <= 0) {
        setWithdrawnQtyError(strings.INVALID_VALUE);
        return false;
      }
      if (remainingCount !== undefined && estimated > remainingCount) {
        setWithdrawnQtyError(strings.WITHDRAWN_QUANTITY_ERROR);
        return false;
      }
      if (remainingWeight && remainingWeight.units !== 'Seeds') {
        const withdrawnWeight = convertUnits(withdrawnQty, withdrawnUnits, remainingWeight.units);
        if (withdrawnWeight > remainingWeight.quantity * (1 + 1e-6)) {
          setWithdrawnQtyError(strings.WITHDRAWN_QUANTITY_ERROR);
          return false;
        }
      }
      setWithdrawnQtyError('');
      return true;
    },
    [accession, purpose, remainingCount, remainingWeight]
  );

  const onChangeAmount = useCallback(
    (value: number | undefined, withdrawnUnits: UnitType) => {
      const estimated = convertWeightToSeedCount(
        value || 0,
        withdrawnUnits,
        accession.subsetWeight,
        accession.subsetCount
      );
      setEstimatedWithdrawnCt(estimated);

      setWithdrawAllSelected(
        !!remainingWeight &&
          remainingWeight.units === withdrawnUnits &&
          value?.toString() === remainingWeight.quantity.toString()
      );

      setWithdrawnQuantity(value);

      const valid = validateAmount(estimated, value, withdrawnUnits);
      onWithdrawCtUpdate(value || 0, valid);
    },
    [accession.subsetCount, accession.subsetWeight, onWithdrawCtUpdate, remainingWeight, validateAmount]
  );

  const onChangeWithdrawnQuantity = useCallback(
    (value: unknown) => {
      const stringValue = value?.toString().trim();
      onChangeAmount(stringValue ? Number(stringValue) : undefined, units);
    },
    [onChangeAmount, units]
  );

  const onChangeUnits = useCallback(
    (newValue: string) => {
      const newUnits = newValue as UnitType;
      onUnitsUpdate(newUnits);
      onChangeAmount(withdrawnQuantity, newUnits);
    },
    [onChangeAmount, onUnitsUpdate, withdrawnQuantity]
  );

  const withdrawAllWeight = useMemo(
    () => (remainingWeight?.quantity && remainingWeight.units !== 'Seeds' ? remainingWeight : undefined),
    [remainingWeight]
  );

  const onSelectAll = useCallback(
    (withdrawAll: boolean) => {
      if (withdrawAll) {
        if (!withdrawAllWeight) {
          return;
        }
        onUnitsUpdate(withdrawAllWeight.units);
        onChangeAmount(withdrawAllWeight.quantity, withdrawAllWeight.units);
      } else {
        onChangeAmount(undefined, units);
      }

      setWithdrawAllSelected(withdrawAll);
    },
    [onChangeAmount, onUnitsUpdate, units, withdrawAllWeight]
  );

  const remainingLabel = useMemo(
    () =>
      strings
        .formatString(
          strings.AMOUNT_REMAINING,
          remainingWeight?.quantity !== undefined
            ? `${remainingWeight.quantity}${unitAbbv()[remainingWeight.units]}`
            : strings.UNKNOWN
        )
        .toString(),
    [remainingWeight]
  );

  return (
    <Grid container direction='row'>
      {accession.subsetWeight?.quantity && accession.subsetCount ? (
        <Grid container item xs={12}>
          <Grid item xs={6} sx={{ marginTop: theme.spacing(2), marginBottom: theme.spacing(2) }}>
            <Textfield
              label={strings.SUBSET_WEIGHT}
              id='subsetWeight'
              type='number'
              value={`${accession.subsetWeight?.quantity} ${accession.subsetWeight?.units}`}
              display={true}
              tooltipTitle={strings.SUBSET_WEIGHT_REQUIRED}
            />
          </Grid>
          <Grid item xs={6} sx={{ marginTop: theme.spacing(2), marginBottom: theme.spacing(2) }}>
            <Textfield
              label={strings.SUBSET_COUNT}
              id='subsetCount'
              type='number'
              value={accession.subsetCount}
              display={true}
            />
          </Grid>
        </Grid>
      ) : null}
      <Grid container direction='row' justifyContent='space-between'>
        <Grid item xs={accession.subsetWeight?.quantity && accession.subsetCount ? 6 : 12} paddingBottom={2}>
          <Typography
            component='label'
            htmlFor='withdrawnQuantity'
            color={theme.palette.TwClrTxtSecondary}
            display='block'
            fontSize='14px'
            lineHeight='20px'
            marginBottom='4px'
          >
            {`${remainingLabel} *`}
          </Typography>
          <Box display='flex' alignItems='flex-start'>
            <Box flexGrow={1}>
              <Textfield
                label=''
                id='withdrawnQuantity'
                onChange={onChangeWithdrawnQuantity}
                type='number'
                value={withdrawnQuantity?.toString()}
                errorText={withdrawnQtyError}
                required={true}
              />
            </Box>
            <Box flexShrink={0} paddingLeft={1} paddingTop='4px' width='88px'>
              <WeightUnitsSelector id='withdrawnQuantityUnits' onChange={onChangeUnits} selectedValue={units} />
            </Box>
          </Box>
          <Checkbox
            id='withdrawAll'
            name=''
            label={strings.WITHDRAW_ALL}
            onChange={onSelectAll}
            value={withdrawAllSelected}
            disabled={!withdrawAllWeight}
          />
        </Grid>
        {accession.subsetWeight?.quantity && accession.subsetCount ? (
          <Grid item xs={5}>
            <Textfield
              label={strings.AMOUNT_EST_COUNT}
              id='amountEstCount'
              type='text'
              value={`${strings.APPROX_SYMBOL}${estimatedWithdrawnCt}${strings.CT}`}
              display={true}
            />
          </Grid>
        ) : null}
      </Grid>
    </Grid>
  );
}
