import React, { type JSX } from 'react';

import { Box, Typography, useTheme } from '@mui/material';

import Link from 'src/components/common/Link';
import TextField from 'src/components/common/Textfield/Textfield';
import { APP_PATHS } from 'src/constants';
import { useLocalization } from 'src/providers';

import { BatchInfo, BatchWithdrawQuantities } from './types';

export type SeedlingBatchBoxProps = {
  speciesName: string;
  batches: BatchInfo[];
  isPlanting: boolean;
  withdrawByBatch: Record<number, BatchWithdrawQuantities>;
  setWithdrawByBatch: (
    updater: (prev: Record<number, BatchWithdrawQuantities>) => Record<number, BatchWithdrawQuantities>
  ) => void;
};

const emptyQuantities = (): BatchWithdrawQuantities => ({
  readyQuantityWithdrawn: 0,
  hardeningOffQuantityWithdrawn: 0,
  activeGrowthQuantityWithdrawn: 0,
  germinatingQuantityWithdrawn: 0,
});

const SeedlingBatchBox = ({
  speciesName,
  batches,
  isPlanting,
  withdrawByBatch,
  setWithdrawByBatch,
}: SeedlingBatchBoxProps): JSX.Element => {
  const theme = useTheme();
  const { strings } = useLocalization();
  const tableColumns = isPlanting ? 'minmax(180px, 2fr) minmax(120px, 1fr) 112px' : '110px repeat(4, 154px)';
  const tableGap = isPlanting ? theme.spacing(4) : theme.spacing(1);
  const tableSx = {
    boxSizing: 'border-box' as const,
    ...(isPlanting ? {} : { minWidth: '726px' }),
  };
  const withdrawInputSx = { justifySelf: 'end', width: '100px' };
  const phaseInputSx = { width: '90px', flexShrink: 0 };
  const phaseHeaderSx = { justifySelf: 'end', width: '134px' };

  const phaseColumns: {
    key: keyof BatchWithdrawQuantities;
    label: string;
    available: (batch: BatchInfo) => number;
  }[] = [
    {
      key: 'germinatingQuantityWithdrawn',
      label: strings.GERMINATION_ESTABLISHMENT,
      available: (batch) => batch.germinatingQuantity,
    },
    {
      key: 'activeGrowthQuantityWithdrawn',
      label: strings.ACTIVE_GROWTH,
      available: (batch) => batch.activeGrowthQuantity,
    },
    {
      key: 'hardeningOffQuantityWithdrawn',
      label: strings.HARDENING_OFF,
      available: (batch) => batch.hardeningOffQuantity,
    },
    {
      key: 'readyQuantityWithdrawn',
      label: strings.READY_TO_PLANT,
      available: (batch) => batch.readyQuantity,
    },
  ];

  const updateQuantity = (batchId: number, field: keyof BatchWithdrawQuantities, rawValue: unknown) => {
    const numericValue = Number(rawValue ?? 0);
    const value = Number.isFinite(numericValue) ? Math.max(0, numericValue) : 0;
    setWithdrawByBatch((prev) => ({
      ...prev,
      [batchId]: {
        ...(prev[batchId] ?? emptyQuantities()),
        [field]: value,
      },
    }));
  };

  const phaseHeaderLabel = (column: (typeof phaseColumns)[number]) =>
    column.key === 'germinatingQuantityWithdrawn' ? column.label.replace('/', '/\n') : column.label;

  return (
    <Box sx={{ border: `1px solid ${theme.palette.TwClrBrdrTertiary}`, overflowX: 'auto' }}>
      <Box
        padding={theme.spacing(1.5, 2)}
        sx={{
          ...tableSx,
          backgroundColor: theme.palette.TwClrBgSecondary,
          borderBottom: `1px solid ${theme.palette.TwClrBrdrTertiary}`,
        }}
      >
        <Typography fontSize='16px' fontWeight={400} textAlign='left'>
          {speciesName}
        </Typography>
      </Box>
      <Box
        display='grid'
        gridTemplateColumns={tableColumns}
        gap={tableGap}
        padding={theme.spacing(1, 2)}
        sx={{
          ...tableSx,
          backgroundColor: theme.palette.TwClrBgSecondary,
        }}
      >
        {isPlanting ? (
          <>
            <Typography fontSize='14px' fontWeight={600} textAlign='left'>
              {strings.SEEDLING_BATCH}
            </Typography>
            <Typography fontSize='14px' fontWeight={600} textAlign='right'>
              {strings.READY_TO_PLANT}
            </Typography>
            <Typography fontSize='14px' fontWeight={600} textAlign='right'>
              {strings.WITHDRAW}
            </Typography>
          </>
        ) : (
          <>
            <Typography fontSize='14px' fontWeight={600} textAlign='left'>
              {strings.BATCH}
            </Typography>
            {phaseColumns.map((column) => (
              <Typography
                key={column.key}
                fontSize='14px'
                fontWeight={600}
                lineHeight={1.2}
                textAlign='left'
                whiteSpace='pre-line'
                sx={phaseHeaderSx}
              >
                {phaseHeaderLabel(column)}
              </Typography>
            ))}
          </>
        )}
      </Box>
      {batches.map((batch) => {
        const value = withdrawByBatch[batch.batchId]?.readyQuantityWithdrawn ?? 0;
        const exceeds = value > batch.readyQuantity;
        return (
          <Box
            key={batch.batchId}
            display='grid'
            gridTemplateColumns={tableColumns}
            gap={tableGap}
            alignItems='center'
            padding={theme.spacing(1, 2)}
            sx={tableSx}
          >
            <Link
              fontSize='16px'
              to={`${APP_PATHS.INVENTORY_ITEM_FOR_SPECIES.replace(':speciesId', batch.speciesId.toString())}?batch=${batch.batchNumber}`}
              target='_blank'
              style={{ justifySelf: 'start', whiteSpace: 'nowrap' }}
            >
              {batch.batchNumber}
            </Link>
            {isPlanting ? (
              <>
                <Typography fontSize='16px' textAlign='right'>
                  {batch.readyQuantity.toLocaleString()}
                </Typography>
                <Box sx={withdrawInputSx}>
                  <TextField
                    id={`withdraw-${batch.batchId}`}
                    type='number'
                    label=''
                    sx={{ width: '100%' }}
                    value={value.toString()}
                    onChange={(v) => updateQuantity(batch.batchId, 'readyQuantityWithdrawn', v)}
                    min={0}
                    max={batch.readyQuantity}
                    errorText={
                      exceeds
                        ? strings.formatString(strings.EXCEEDS_READY_TO_PLANT, batch.readyQuantity).toString()
                        : ''
                    }
                  />
                </Box>
              </>
            ) : (
              <>
                {phaseColumns.map((column) => {
                  const available = column.available(batch);
                  const phaseValue = withdrawByBatch[batch.batchId]?.[column.key] ?? 0;
                  const phaseExceeds = phaseValue > available;
                  return (
                    <Box
                      key={column.key}
                      display='flex'
                      alignItems='center'
                      justifyContent='flex-end'
                      gap={theme.spacing(1)}
                    >
                      <Box sx={phaseInputSx}>
                        <TextField
                          id={`withdraw-${batch.batchId}-${column.key}`}
                          type='number'
                          label=''
                          sx={{ width: '100%' }}
                          value={phaseValue.toString()}
                          onChange={(v) => updateQuantity(batch.batchId, column.key, v)}
                          min={0}
                          max={available}
                          errorText={
                            phaseExceeds ? strings.formatString(strings.EXCEEDS_AVAILABLE_X, available).toString() : ''
                          }
                        />
                      </Box>
                      <Typography fontSize='16px' textAlign='left' sx={{ minWidth: '36px' }}>
                        /{available.toLocaleString()}
                      </Typography>
                    </Box>
                  );
                })}
              </>
            )}
          </Box>
        );
      })}
    </Box>
  );
};

export default SeedlingBatchBox;
