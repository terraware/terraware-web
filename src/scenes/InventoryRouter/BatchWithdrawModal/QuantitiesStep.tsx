import React, { type JSX, useMemo } from 'react';

import { Box, useTheme } from '@mui/material';

import { SpeciesTargetForSubstratum } from 'src/queries/search/speciesTargetsForSubstratum';
import { NurseryWithdrawalRequestPurposes } from 'src/types/Batch';

import SeedlingBatchBox from './SeedlingBatchBox';
import SpeciesTargetsTable from './SpeciesTargetsTable';
import { BatchInfo, BatchWithdrawDraft, BatchWithdrawQuantities } from './types';

export type QuantitiesStepProps = {
  batches: BatchInfo[];
  draft: BatchWithdrawDraft;
  speciesTargets?: SpeciesTargetForSubstratum[];
  setWithdrawByBatch: (
    updater: (prev: Record<number, BatchWithdrawQuantities>) => Record<number, BatchWithdrawQuantities>
  ) => void;
};

const QuantitiesStep = ({ batches, draft, speciesTargets, setWithdrawByBatch }: QuantitiesStepProps): JSX.Element => {
  const theme = useTheme();
  const shouldShowSpeciesTargets =
    draft.purpose === NurseryWithdrawalRequestPurposes.OUTPLANT &&
    draft.plantingSeasonId !== undefined &&
    draft.stratumId !== undefined &&
    draft.substratumId !== undefined;

  // Group batches by species so we can render one box per species, sorted by
  // scientific name for stable order.
  const batchesBySpecies = useMemo(() => {
    const map = new Map<number, { speciesName: string; batches: BatchInfo[] }>();
    batches.forEach((b) => {
      const existing = map.get(b.speciesId);
      const speciesName = b.scientificName + (b.commonName ? ` (${b.commonName})` : '');
      if (existing) {
        existing.batches.push(b);
      } else {
        map.set(b.speciesId, { speciesName, batches: [b] });
      }
    });
    return [...map.values()].sort((a, b) => a.speciesName.localeCompare(b.speciesName));
  }, [batches]);

  return (
    <Box display='flex' flexDirection='column' gap={theme.spacing(3)}>
      {shouldShowSpeciesTargets && speciesTargets && speciesTargets.length > 0 && (
        <SpeciesTargetsTable rows={speciesTargets} />
      )}
      {batchesBySpecies.map((group) => (
        <SeedlingBatchBox
          key={group.speciesName}
          speciesName={group.speciesName}
          batches={group.batches}
          isPlanting={draft.purpose === NurseryWithdrawalRequestPurposes.OUTPLANT}
          withdrawByBatch={draft.withdrawByBatch}
          setWithdrawByBatch={setWithdrawByBatch}
        />
      ))}
    </Box>
  );
};

export default QuantitiesStep;
