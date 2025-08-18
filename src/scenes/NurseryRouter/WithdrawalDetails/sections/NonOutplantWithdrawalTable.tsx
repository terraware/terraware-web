import React, { useMemo } from 'react';

import { TableColumnType } from '@terraware/web-components';

import Table from 'src/components/common/table';
import isEnabled from 'src/features';
import { useLocalization } from 'src/providers';
import { Batch, NurseryWithdrawal } from 'src/types/Batch';
import { Species } from 'src/types/Species';
import { batchToSpecies } from 'src/utils/batch';

import WithdrawalRenderer from './WithdrawalRenderer';

type SpeciesWithdrawal = {
  name?: string;
  germinating?: number;
  hardeningOff?: number;
  activeGrowth: number;
  ready: number;
  total: number;
  batchNumber: string;
  batchId: number;
  speciesId: number;
};

type NonOutplantWithdrawalTableProps = {
  species: Species[];
  withdrawal?: NurseryWithdrawal;
  batches?: Batch[];
};

export default function NonOutplantWithdrawalTable({
  species,
  withdrawal,
  batches,
}: NonOutplantWithdrawalTableProps): JSX.Element {
  const { strings } = useLocalization();
  const isUpdatedNurseryGrowthPhasesEnabled = isEnabled('Updated Nursery Growth Phases');

  const columns = useMemo(
    (): TableColumnType[] => [
      { key: 'batchNumber', name: strings.BATCH, type: 'string' },
      { key: 'name', name: strings.SPECIES, type: 'string' },
      { key: 'germinating', name: strings.GERMINATING, type: 'number' },
      { key: 'activeGrowth', name: strings.NOT_READY, type: 'number' },
      ...(isUpdatedNurseryGrowthPhasesEnabled
        ? [
            {
              key: 'hardeningOffQuantity',
              name: strings.HARDENING_OFF,
              type: 'number' as const,
            },
          ]
        : []),
      { key: 'ready', name: strings.READY, type: 'number' },
      { key: 'total', name: strings.TOTAL, type: 'number' },
    ],
    [isUpdatedNurseryGrowthPhasesEnabled, strings]
  );

  const rowData = useMemo(() => {
    // get map of batch id to species id - for correlation
    // the withdrawal details hold a batch id but no species id
    // the batches details has the species id
    if (batches) {
      const batchToSpeciesMap = batchToSpecies(batches);

      const batchesMap: SpeciesWithdrawal[] = [];

      if (Object.keys(batchToSpeciesMap).length > 0) {
        withdrawal?.batchWithdrawals?.forEach((batch) => {
          const { batchId, activeGrowthQuantityWithdrawn, hardeningOffQuantityWithdrawn, readyQuantityWithdrawn } =
            batch;
          const { speciesId, batchNumber } = batchToSpeciesMap[batchId];
          const activeGrowth = activeGrowthQuantityWithdrawn || 0;
          const hardeningOff = hardeningOffQuantityWithdrawn || 0;
          const ready = readyQuantityWithdrawn || 0;
          const name = species.find((sp) => sp.id === speciesId)?.scientificName;

          const { germinatingQuantityWithdrawn } = batch;
          const germinating = germinatingQuantityWithdrawn || 0;
          batchesMap.push({
            name,
            germinating,
            hardeningOff,
            activeGrowth,
            ready,
            total: activeGrowth + hardeningOff + ready + germinating,
            batchNumber,
            batchId,
            speciesId,
          });
        });
      }

      return batchesMap;
    } else {
      return [];
    }
  }, [species, batches, withdrawal]);

  return (
    <Table
      id='non-outplant-withdrawal-table'
      columns={columns}
      rows={rowData}
      orderBy={'name'}
      Renderer={WithdrawalRenderer}
    />
  );
}
