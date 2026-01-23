import React, { type JSX, useEffect, useState } from 'react';

import { Box, Grid } from '@mui/material';
import { Checkbox, Textfield } from '@terraware/web-components';

import strings from 'src/strings';
import { Accession, Withdrawal } from 'src/types/Accession';

export interface CountWithdrawalProps {
  accession: Accession;
  onWithdrawCtUpdate: (withdrawnQuantity: number, valid: boolean) => void;
}

export default function CountWithdrawal(props: CountWithdrawalProps): JSX.Element {
  const { accession, onWithdrawCtUpdate } = props;

  const [withdrawAllSelected, setWithdrawAllSelected] = useState(false);
  const [withdrawnQuantity, setWithdrawnQuantity] = useState<Withdrawal['withdrawnQuantity']>({
    quantity: 0,
    units: 'Seeds',
  });
  const [withdrawnQtyError, setWithdrawnQtyError] = useState<string>('');

  useEffect(() => {
    setWithdrawnQtyError('');
    if (!accession.estimatedCount) {
      setWithdrawnQtyError(strings.MISSING_SUBSET_WEIGHT_ERROR_COUNT);
    }
  }, [accession.estimatedCount]);

  const onChangeWithdrawnQuantity = (value: number) => {
    let valid = false;

    if (
      value.toString() === accession.remainingQuantity?.quantity.toString() &&
      withdrawnQuantity?.units === accession.remainingQuantity?.units
    ) {
      setWithdrawAllSelected(true);
    } else {
      setWithdrawAllSelected(false);
    }

    setWithdrawnQuantity(
      value.toString().trim() === ''
        ? undefined
        : {
            quantity: value || 0,
            units: 'Seeds',
          }
    );

    setWithdrawnQtyError('');
    if (!accession.estimatedCount) {
      setWithdrawnQtyError(strings.MISSING_SUBSET_WEIGHT_ERROR_COUNT);
    }

    valid = validateAmount(value);
    onWithdrawCtUpdate(value || 0, valid);
  };

  const onSelectAll = (id: string, withdrawAll: boolean) => {
    if (withdrawAll) {
      if (
        accession.remainingQuantity?.units &&
        accession.remainingQuantity?.units !== 'Seeds' &&
        accession.estimatedCount
      ) {
        onChangeWithdrawnQuantity(accession.estimatedCount);
      } else if (accession.remainingQuantity?.units && accession.remainingQuantity?.units === 'Seeds') {
        onChangeWithdrawnQuantity(accession.remainingQuantity?.quantity);
      }
    } else {
      setWithdrawnQuantity(undefined);
    }

    setWithdrawAllSelected(withdrawAll);
  };

  const validateAmount = (withdrawnQty: number) => {
    if (withdrawnQty) {
      if (!accession.estimatedCount) {
        setWithdrawnQtyError(strings.MISSING_SUBSET_WEIGHT_ERROR_COUNT);
        return false;
      }
      if (isNaN(withdrawnQty)) {
        setWithdrawnQtyError(strings.INVALID_VALUE);
        return false;
      }
      if (Number(withdrawnQty) <= 0) {
        setWithdrawnQtyError(strings.INVALID_VALUE);
        return false;
      }
      if (accession.remainingQuantity?.units === 'Seeds') {
        if (withdrawnQty > accession.remainingQuantity?.quantity) {
          setWithdrawnQtyError(strings.WITHDRAWN_QUANTITY_ERROR);
          return false;
        }
      } else {
        if (withdrawnQty > accession.estimatedCount) {
          setWithdrawnQtyError(strings.WITHDRAWN_QUANTITY_ERROR);
          return false;
        }
      }

      setWithdrawnQtyError('');
      return true;
    } else {
      setWithdrawnQtyError(strings.REQUIRED_FIELD);
      return false;
    }
  };

  return (
    <Grid container direction='row' justifyContent='space-between'>
      <Grid item xs={12} paddingBottom={2}>
        <Box display='flex' alignItems={withdrawnQtyError ? 'center' : 'end'}>
          <Textfield
            label={strings
              .formatString(
                strings.AMOUNT_REMAINING,
                `${
                  accession.remainingQuantity?.units === 'Seeds'
                    ? accession.remainingQuantity?.quantity
                    : accession.estimatedCount
                      ? `${strings.APPROX_SYMBOL}${accession.estimatedCount}`
                      : 'Unknown '
                }${strings.CT}`
              )
              .toString()}
            id='withdrawnQuantity'
            onChange={(value) => onChangeWithdrawnQuantity(Number(value))}
            type='text'
            value={withdrawnQuantity?.quantity.toString()}
            errorText={withdrawnQtyError}
            required={true}
          />
          <Box paddingLeft={1}>
            <Box>{strings.CT}</Box>
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
    </Grid>
  );
}
