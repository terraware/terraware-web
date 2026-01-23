import React, { type JSX, useCallback, useEffect, useState } from 'react';

import { Box, Grid, useTheme } from '@mui/material';
import { Checkbox, Textfield } from '@terraware/web-components';

import strings from 'src/strings';
import { Accession, Withdrawal } from 'src/types/Accession';
import { convertUnits, unitAbbv } from 'src/units';

export interface WeightWithdrawalProps {
  accession: Accession;
  purpose: string | undefined;
  onWithdrawCtUpdate: (withdrawnQuantity: number, valid: boolean) => void;
}

export default function WeightWithdrawal(props: WeightWithdrawalProps): JSX.Element {
  const { accession, purpose, onWithdrawCtUpdate } = props;

  const [withdrawAllSelected, setWithdrawAllSelected] = useState(false);
  const theme = useTheme();
  const [estimatedWithdrawnCt, setEstimatedWithdrawnCt] = useState<number>(0);
  const [withdrawnQuantity, setWithdrawnQuantity] = useState<Withdrawal['withdrawnQuantity']>({
    quantity: 0,
    units: accession.remainingQuantity?.units || 'Grams',
  });
  const [withdrawnQtyError, setWithdrawnQtyError] = useState<string>('');

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

  const onSelectAll = (id: string, withdrawAll: boolean) => {
    if (withdrawAll) {
      if (
        accession.remainingQuantity?.units &&
        accession.remainingQuantity?.units === 'Seeds' &&
        accession.estimatedWeight?.quantity
      ) {
        onChangeWithdrawnQuantity(accession.estimatedWeight?.quantity);
      } else if (accession.remainingQuantity?.units && accession.remainingQuantity?.units !== 'Seeds') {
        onChangeWithdrawnQuantity(accession.remainingQuantity?.quantity);
      }
    } else {
      setWithdrawnQuantity(undefined);
    }

    setWithdrawAllSelected(withdrawAll);
  };

  const validateAmount = useCallback(
    (estimated: number, withdrawnQty: number, withdrawnUnits: string) => {
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
      if (
        accession.remainingQuantity?.units === withdrawnUnits &&
        accession.remainingQuantity.units === 'Seeds' &&
        Number(estimated) > accession.remainingQuantity?.quantity
      ) {
        setWithdrawnQtyError(strings.WITHDRAWN_QUANTITY_ERROR);
        return false;
      }
      if (
        accession.remainingQuantity?.units === withdrawnUnits &&
        accession.remainingQuantity.units !== 'Seeds' &&
        accession.remainingQuantity?.quantity &&
        withdrawnQty > accession.remainingQuantity?.quantity
      ) {
        setWithdrawnQtyError(strings.WITHDRAWN_QUANTITY_ERROR);
        return false;
      }
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

      setWithdrawnQtyError('');
      return true;
    },
    [accession, purpose]
  );

  const onChangeWithdrawnQuantity = useCallback(
    (value: number) => {
      let estimated = 0;
      let valid = false;

      if (
        value.toString() === accession.remainingQuantity?.quantity.toString() &&
        withdrawnQuantity?.units === accession.remainingQuantity?.units
      ) {
        setWithdrawAllSelected(true);
      } else {
        setWithdrawAllSelected(false);
      }

      if (accession.subsetCount && accession.subsetWeight) {
        if (
          accession.remainingQuantity?.units &&
          accession.remainingQuantity?.units === 'Seeds' &&
          accession.estimatedWeight?.units
        ) {
          estimated = Math.round(
            convertUnits(value, accession.estimatedWeight?.units, accession.subsetWeight.units) *
              (accession.subsetCount / accession.subsetWeight.quantity)
          );
        } else if (accession.remainingQuantity?.units) {
          estimated = Math.round(
            convertUnits(value, accession.remainingQuantity?.units, accession.subsetWeight.units) *
              (accession.subsetCount / accession.subsetWeight.quantity)
          );
        }
        setEstimatedWithdrawnCt(estimated);
      }

      setWithdrawnQuantity(
        value.toString().trim() === ''
          ? undefined
          : {
              quantity: value || 0,
              units: withdrawnQuantity?.units || accession.remainingQuantity?.units || 'Grams',
            }
      );

      setWithdrawnQtyError('');
      if (purpose === 'Nursery' || purpose === 'Viability Testing') {
        if (!accession.estimatedCount || !accession.subsetWeight?.quantity || !accession.subsetCount) {
          setWithdrawnQtyError(
            purpose === 'Nursery'
              ? strings.MISSING_SUBSET_WEIGHT_ERROR_NURSERY
              : strings.MISSING_SUBSET_WEIGHT_ERROR_VIABILITY_TEST
          );
        }
      }
      valid = validateAmount(
        estimated,
        value,
        withdrawnQuantity?.units || accession.remainingQuantity?.units || 'Grams'
      );
      onWithdrawCtUpdate(value || 0, valid);
    },
    [accession, onWithdrawCtUpdate, purpose, validateAmount, withdrawnQuantity?.units]
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
          <Box display='flex' alignItems={withdrawnQtyError ? 'center' : 'end'}>
            <Textfield
              label={strings
                .formatString(
                  strings.AMOUNT_REMAINING,
                  `${
                    accession.remainingQuantity?.units !== 'Seeds'
                      ? accession.remainingQuantity?.quantity
                      : accession.estimatedWeight?.quantity
                        ? accession.estimatedWeight?.quantity
                        : 'Unknown '
                  }${accession.estimatedWeight?.units ? unitAbbv()[accession.estimatedWeight?.units] : ''}`
                )
                .toString()}
              id='withdrawnQuantity'
              onChange={(value) => onChangeWithdrawnQuantity(Number(value))}
              type='number'
              value={withdrawnQuantity?.quantity.toString()}
              errorText={withdrawnQtyError}
              required={true}
            />
            <Box paddingLeft={1}>
              <Box>
                {accession.remainingQuantity?.units === 'Seeds'
                  ? accession.estimatedWeight?.units
                    ? unitAbbv()[accession.estimatedWeight?.units]
                    : ''
                  : accession.remainingQuantity?.units
                    ? unitAbbv()[accession.remainingQuantity?.units]
                    : ''}
              </Box>
            </Box>
          </Box>
          <Checkbox
            id='withdrawAll'
            name=''
            label={strings.WITHDRAW_ALL}
            onChange={(value) => onSelectAll('withdrawAll', value)}
            value={withdrawAllSelected}
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
