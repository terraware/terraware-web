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
  const tableColumns = 'minmax(180px, 2fr) minmax(120px, 1fr) 112px';
  const withdrawInputSx = { justifySelf: 'end', width: '100px' };

  return (
    <Box sx={{ border: `1px solid ${theme.palette.TwClrBrdrTertiary}`, borderRadius: '8px' }}>
      <Box padding={theme.spacing(1.5, 2)} sx={{ backgroundColor: theme.palette.TwClrBgSecondary }}>
        <Typography fontSize='16px' fontWeight={400} textAlign='left'>
          {speciesName}
        </Typography>
      </Box>
      <Box
        display='grid'
        gridTemplateColumns={tableColumns}
        gap={theme.spacing(4)}
        padding={theme.spacing(1, 2)}
        sx={{ borderBottom: `1px solid ${theme.palette.TwClrBrdrTertiary}` }}
      >
        <Typography fontSize='14px' fontWeight={600} textAlign='left'>
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
            gridTemplateColumns={tableColumns}
            gap={theme.spacing(4)}
            alignItems='center'
            padding={theme.spacing(1, 2)}
          >
            <Typography fontSize='16px' color={theme.palette.TwClrTxtBrand} textAlign='left'>
              {batch.batchNumber}
            </Typography>
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
