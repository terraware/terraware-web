import React, { type JSX } from 'react';

import { Box, Typography, useTheme } from '@mui/material';

import TextField from 'src/components/common/Textfield/Textfield';
import { useLocalization } from 'src/providers';

import { BatchInfo, BatchWithdrawQuantities } from './types';

export type SeedlingBatchBoxProps = {
  speciesName: string;
  batches: BatchInfo[];
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
  withdrawByBatch,
  setWithdrawByBatch,
}: SeedlingBatchBoxProps): JSX.Element => {
  const theme = useTheme();
  const { strings } = useLocalization();

  return (
    <Box sx={{ border: `1px solid ${theme.palette.TwClrBrdrTertiary}` }}>
      <Box padding={theme.spacing(1.5, 2)} sx={{ backgroundColor: theme.palette.TwClrBgSecondary }}>
        <Typography fontSize='16px' fontWeight={400}>
          {speciesName}
        </Typography>
      </Box>
      <Box
        display='grid'
        gridTemplateColumns='2fr 1fr 1fr'
        gap={theme.spacing(1)}
        padding={theme.spacing(1, 2)}
        sx={{ borderBottom: `1px solid ${theme.palette.TwClrBrdrTertiary}` }}
      >
        <Typography fontSize='14px' fontWeight={600}>
          {strings.SEEDLING_BATCH}
        </Typography>
        <Typography fontSize='14px' fontWeight={600} textAlign='right'>
          {strings.READY_TO_PLANT}
        </Typography>
        <Typography fontSize='14px' fontWeight={600} textAlign='right'>
          {strings.WITHDRAW}
        </Typography>
      </Box>
      {batches.map((batch) => {
        const value = withdrawByBatch[batch.batchId]?.readyQuantityWithdrawn ?? 0;
        const exceeds = value > batch.readyQuantity;
        return (
          <Box
            key={batch.batchId}
            display='grid'
            gridTemplateColumns='2fr 1fr 1fr'
            gap={theme.spacing(1)}
            alignItems='center'
            padding={theme.spacing(1, 2)}
          >
            <Typography fontSize='16px' color={theme.palette.TwClrTxtBrand}>
              {batch.batchNumber}
            </Typography>
            <Typography fontSize='16px' textAlign='right'>
              {batch.readyQuantity.toLocaleString()}
            </Typography>
            <Box>
              <TextField
                id={`withdraw-${batch.batchId}`}
                type='number'
                label=''
                value={value.toString()}
                onChange={(v) =>
                  setWithdrawByBatch((prev) => ({
                    ...prev,
                    [batch.batchId]: {
                      ...(prev[batch.batchId] ?? emptyQuantities()),
                      readyQuantityWithdrawn: Math.max(0, Number(v ?? 0)),
                    },
                  }))
                }
                min={0}
                max={batch.readyQuantity}
                errorText={
                  exceeds ? strings.formatString(strings.EXCEEDS_READY_TO_PLANT, batch.readyQuantity).toString() : ''
                }
              />
            </Box>
          </Box>
        );
      })}
    </Box>
  );
};

export default SeedlingBatchBox;
