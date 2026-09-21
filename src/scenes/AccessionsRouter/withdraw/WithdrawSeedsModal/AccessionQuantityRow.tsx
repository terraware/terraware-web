import React, { type JSX, useCallback, useMemo } from 'react';

import { Box, TableCell, TableRow, Typography, useTheme } from '@mui/material';
import { Icon, Textfield } from '@terraware/web-components';

import WeightUnitsSelector from 'src/components/WeightUnitsSelector';
import Link from 'src/components/common/Link';
import { APP_PATHS } from 'src/constants';
import { useLocalization } from 'src/providers/hooks';
import { UnitType, unitAbbv } from 'src/units';

import { AccessionWithdrawInfo, WithdrawPurpose, WithdrawQuantity } from './types';
import { estimatedSeedCount, remainingCountOf, remainingWeightOf, validateRow } from './withdrawCalc';

type AccessionQuantityRowProps = {
  accession: AccessionWithdrawInfo;
  purpose: WithdrawPurpose;
  withdrawByWeight: boolean;
  quantity?: WithdrawQuantity;
  onChange: (quantity: WithdrawQuantity) => void;
};

const defaultUnitsFor = (accession: AccessionWithdrawInfo): UnitType => {
  const remainingWeight = remainingWeightOf(accession);
  return remainingWeight && remainingWeight.units !== 'Seeds' ? remainingWeight.units : 'Grams';
};

const AccessionQuantityRow = ({
  accession,
  purpose,
  withdrawByWeight,
  quantity,
  onChange,
}: AccessionQuantityRowProps): JSX.Element => {
  const theme = useTheme();
  const { strings } = useLocalization();

  const units = quantity?.units ?? defaultUnitsFor(accession);
  const value = quantity?.value;

  const remainingLabel = useMemo(() => {
    if (withdrawByWeight) {
      const remainingWeight = remainingWeightOf(accession);
      return remainingWeight?.quantity !== undefined
        ? `${remainingWeight.quantity}${unitAbbv()[remainingWeight.units]}`
        : strings.UNKNOWN;
    }
    if (accession.remainingQuantity?.units === 'Seeds') {
      return `${accession.remainingQuantity.quantity}`;
    }
    const remainingCount = remainingCountOf(accession);
    return remainingCount !== undefined ? `${strings.APPROX_SYMBOL}${remainingCount}${strings.CT}` : strings.UNKNOWN;
  }, [accession, strings, withdrawByWeight]);

  const estimatedCount = useMemo(
    () => estimatedSeedCount(accession, withdrawByWeight, value, units),
    [accession, units, value, withdrawByWeight]
  );

  const error = value !== undefined ? validateRow(accession, purpose, withdrawByWeight, value, units) : '';

  const hasSubsetData = !!accession.subsetWeight?.quantity && !!accession.subsetCount;

  const onChangeValue = useCallback(
    (next: unknown) => {
      const stringValue = next?.toString().trim();
      onChange({ value: stringValue === '' || stringValue === undefined ? undefined : Number(stringValue), units });
    },
    [onChange, units]
  );

  const onChangeUnits = useCallback((next: string) => onChange({ value, units: next as UnitType }), [onChange, value]);

  return (
    <TableRow>
      <TableCell>
        <Link
          fontSize='14px'
          target='_blank'
          to={APP_PATHS.ACCESSIONS2_ITEM.replace(':accessionId', String(accession.id))}
        >
          {accession.accessionNumber}
        </Link>
      </TableCell>
      <TableCell>
        <Typography fontSize='14px'>{remainingLabel}</Typography>
      </TableCell>
      <TableCell>
        <Box display='flex' flexDirection='column'>
          <Box display='flex' alignItems='flex-start' gap={1}>
            <Box width='96px'>
              <Textfield
                label=''
                id={`withdraw-${accession.id}`}
                type='number'
                value={value?.toString() ?? ''}
                onChange={onChangeValue}
                errorText={error || undefined}
                sx={{ '.textfield-label-container': { display: 'none !important' } }}
              />
            </Box>
            {withdrawByWeight && (
              <Box flexShrink={0} width='88px' paddingTop='4px'>
                <WeightUnitsSelector
                  id={`withdraw-units-${accession.id}`}
                  onChange={onChangeUnits}
                  selectedValue={units}
                />
              </Box>
            )}
          </Box>
          {error && (
            <Box display='flex' alignItems='flex-start' gap={0.5} marginTop={0.5} width='192px'>
              <Icon
                name='error'
                size='small'
                fillColor={theme.palette.TwClrIcnDanger}
                style={{ flexShrink: 0, marginTop: '2px' }}
              />
              <Typography fontSize='14px' lineHeight='20px' color={theme.palette.TwClrTxtDanger}>
                {error}
              </Typography>
            </Box>
          )}
        </Box>
      </TableCell>
      {withdrawByWeight && (
        <>
          <TableCell>
            <Typography fontSize='14px'>{`${strings.APPROX_SYMBOL}${estimatedCount}${strings.CT}`}</Typography>
          </TableCell>
          <TableCell>
            {hasSubsetData && (
              <Box
                sx={{
                  backgroundColor: theme.palette.TwClrBgSecondary,
                  borderRadius: '4px',
                  padding: theme.spacing(0.5, 1),
                  display: 'inline-block',
                }}
              >
                <Typography fontSize='14px'>
                  {`${accession.subsetWeight?.quantity} ${unitAbbv()[accession.subsetWeight?.units as UnitType]} ${strings.TO} ${accession.subsetCount} ${strings.CT}`}
                </Typography>
              </Box>
            )}
          </TableCell>
        </>
      )}
    </TableRow>
  );
};

export default AccessionQuantityRow;
