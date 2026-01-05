import React, { useMemo } from 'react';

import { TableColumnType } from '@terraware/web-components';

import Table from 'src/components/common/table';
import { useUser } from 'src/providers';
import strings from 'src/strings';
import { Batch, NurseryWithdrawal } from 'src/types/Batch';
import { Species } from 'src/types/Species';
import { Delivery } from 'src/types/Tracking';
import { batchToSpecies } from 'src/utils/batch';
import { useNumberFormatter } from 'src/utils/useNumberFormatter';

import WithdrawalRenderer from './WithdrawalRenderer';

type OutplantWithdrawalTableProps = {
  species: Species[];
  substratumNames: Record<number, string>;
  delivery?: Delivery;
  batches?: Batch[];
  withdrawal?: NurseryWithdrawal;
};

const columns = (): TableColumnType[] => [
  { key: 'batchNumber', name: strings.BATCH, type: 'string' },
  { key: 'name', name: strings.SPECIES, type: 'string' },
  { key: 'toSubstratum', name: strings.TO_SUBSTRATUM, type: 'string' },
  { key: 'total', name: strings.QUANTITY, type: 'number' },
];

export default function OutplantWithdrawalTable({
  species,
  substratumNames,
  delivery,
  batches,
  withdrawal,
}: OutplantWithdrawalTableProps): JSX.Element {
  const { user } = useUser();
  const numberFormatter = useNumberFormatter(user?.locale);

  type BatchesRow = {
    name?: string;
    total: number;
    batchNumber: string;
    batchId: number;
    speciesId: number;
    toSubstratum: string;
  };

  const rowData = useMemo(() => {
    if (batches) {
      const batchToSpeciesMap = batchToSpecies(batches);

      // get list of distinct species
      const speciesList =
        delivery?.plantings?.reduce<number[]>(
          (acc, pl) => (acc.includes(pl.speciesId) ? acc : [...acc, pl.speciesId]),
          []
        ) ?? [];
      const speciesSubstratumMap: Record<number, Record<number, number>> = {};
      const rows: { [p: string]: unknown }[] = [];
      for (const sp of speciesList) {
        // for each species add the number of plants in each substratum for delivery type plantings
        speciesSubstratumMap[sp] = {};
        delivery?.plantings
          ?.filter((pl) => pl.speciesId === sp && pl.type === 'Delivery')
          .forEach((pl) => {
            const substratum = pl.substratumId ?? -1;
            if (!speciesSubstratumMap[sp][substratum]) {
              speciesSubstratumMap[sp][substratum] = pl.numPlants;
              return;
            }
            speciesSubstratumMap[sp][substratum] += pl.numPlants;
          });

        for (const substratumKey of Object.keys(speciesSubstratumMap[sp])) {
          const substratum = Number(substratumKey);
          rows.push({
            species: species?.find((x) => x?.id === sp)?.scientificName ?? '',
            to_substratum: substratum > -1 ? substratumNames[substratum] ?? substratum?.toString() : '',
            quantity: numberFormatter.format(speciesSubstratumMap[sp][substratum]),
          });
        }
      }

      const batchesMap: BatchesRow[] = [];

      if (Object.keys(batchToSpeciesMap).length > 0) {
        withdrawal?.batchWithdrawals?.forEach((batch) => {
          const { batchId, activeGrowthQuantityWithdrawn, hardeningOffQuantityWithdrawn, readyQuantityWithdrawn } =
            batch;
          const { speciesId, batchNumber } = batchToSpeciesMap[batchId];
          const activeGrowth = activeGrowthQuantityWithdrawn || 0;
          const hardeningOff = hardeningOffQuantityWithdrawn || 0;
          const ready = readyQuantityWithdrawn || 0;
          const name = species.find((sp) => sp.id === speciesId)?.scientificName;
          const substratumMap = speciesSubstratumMap[speciesId];
          const substratumIds = Object.keys(substratumMap);
          batchesMap.push({
            name,
            total: activeGrowth + hardeningOff + ready,
            batchNumber,
            batchId,
            speciesId,
            toSubstratum: substratumIds.map((_subId) => substratumNames[Number(_subId)]).join(','),
          });
        });
      }

      return batchesMap;
    } else {
      return [];
    }
  }, [delivery, species, substratumNames, numberFormatter, batches, withdrawal?.batchWithdrawals]);

  return (
    <Table
      id='outplant-withdrawal-table'
      columns={columns}
      rows={rowData}
      orderBy={'name'}
      Renderer={WithdrawalRenderer}
    />
  );
}
