import React, { type JSX } from 'react';

import { Box, Typography, useTheme } from '@mui/material';

import TextField from 'src/components/common/Textfield/Textfield';
import { useLocalization } from 'src/providers';
import { BatchForWithdraw } from 'src/queries/search/batchesForWithdraw';
import { PlantingDateRequestSubstratumSpecies } from 'src/queries/search/plantingDateRequests';

const batchGridTemplateColumns = '2fr 1fr 1fr 1fr';
const withdrawColumnSx = { gridColumn: 4 };
const withdrawInputSx = { gridColumn: 4, justifySelf: 'end', width: '100px' };

export type RequestSpeciesBoxProps = {
  species: PlantingDateRequestSubstratumSpecies;
  substratumId: number;
  batches: BatchForWithdraw[];
  withdrawByBatchSubstratum: Record<string, number>;
  totalByBatch: Map<number, number>;
  setWithdrawByBatchSubstratum: (updater: (prev: Record<string, number>) => Record<string, number>) => void;
  cellKey: (batchId: number, substratumId: number) => string;
};

const RequestSpeciesBox = ({
  species,
  substratumId,
  batches,
  withdrawByBatchSubstratum,
  totalByBatch,
  setWithdrawByBatchSubstratum,
  cellKey,
}: RequestSpeciesBoxProps): JSX.Element => {
  const theme = useTheme();
  const { strings } = useLocalization();

  return (
    <Box sx={{ border: `1px solid ${theme.palette.TwClrBrdrTertiary}` }}>
      <Box
        padding={theme.spacing(1.5, 2)}
        sx={{
          backgroundColor: theme.palette.TwClrBgSecondary,
          borderBottom: `1px solid ${theme.palette.TwClrBrdrTertiary}`,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Typography fontSize='16px' fontWeight={400} textAlign='left'>
          {species.scientificName}
          {species.commonName ? ` (${species.commonName})` : ''}
        </Typography>
        <Typography fontSize='14px' fontWeight={600}>
          {species.quantity.toLocaleString()} {strings.REQUESTED}
        </Typography>
      </Box>
      <Box
        display='grid'
        gridTemplateColumns={batchGridTemplateColumns}
        gap={theme.spacing(1)}
        padding={theme.spacing(1, 2)}
        sx={{
          backgroundColor: theme.palette.TwClrBgSecondary,
        }}
      >
        <Typography fontSize='14px' fontWeight={600} textAlign='left'>
          {strings.SEEDLING_BATCH}
        </Typography>
        <Typography fontSize='14px' fontWeight={600} textAlign='right'>
          {strings.READY_TO_PLANT}
        </Typography>
        <Typography fontSize='14px' fontWeight={600} textAlign='right' sx={withdrawColumnSx}>
          {strings.WITHDRAW}
        </Typography>
      </Box>
      {batches.length === 0 ? (
        <Box padding={theme.spacing(2)}>
          <Typography fontSize='14px' color={theme.palette.TwClrTxtSecondary}>
            -
          </Typography>
        </Box>
      ) : (
        batches.map((batch) => {
          const key = cellKey(batch.batchId, substratumId);
          const value = withdrawByBatchSubstratum[key] ?? 0;
          const batchTotal = totalByBatch.get(batch.batchId) ?? 0;
          const exceeds = batchTotal > batch.readyQuantity;
          return (
            <Box
              key={batch.batchId}
              display='grid'
              gridTemplateColumns={batchGridTemplateColumns}
              gap={theme.spacing(1)}
              alignItems='center'
              padding={theme.spacing(1, 2)}
            >
              <Typography fontSize='16px' textAlign='left'>
                {batch.batchNumber}
              </Typography>
              <Typography fontSize='16px' textAlign='right'>
                {batch.readyQuantity.toLocaleString()}
              </Typography>
              <Box sx={withdrawInputSx}>
                <TextField
                  id={`withdraw-${batch.batchId}-${substratumId}`}
                  type='number'
                  label=''
                  value={value.toString()}
                  onChange={(v) =>
                    setWithdrawByBatchSubstratum((prev) => ({
                      ...prev,
                      [key]: Math.max(0, Number(v ?? 0)),
                    }))
                  }
                  min={0}
                  max={batch.readyQuantity}
                  errorText={
                    exceeds
                      ? strings.formatString(strings.EXCEEDS_READY_TO_PLANT, batchTotal, batch.readyQuantity).toString()
                      : ''
                  }
                />
              </Box>
            </Box>
          );
        })
      )}
    </Box>
  );
};

export default RequestSpeciesBox;
