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
  subzoneNames: Record<number, string>;
  delivery?: Delivery;
  batches?: Batch[];
  withdrawal?: NurseryWithdrawal;
};

const columns = (): TableColumnType[] => [
  { key: 'batchNumber', name: strings.BATCH, type: 'string' },
  { key: 'name', name: strings.SPECIES, type: 'string' },
  { key: 'toSubzone', name: strings.TO_SUBZONE, type: 'string' },
  { key: 'total', name: strings.QUANTITY, type: 'number' },
];

export default function OutplantWithdrawalTable({
  species,
  subzoneNames,
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
    toSubzone: string;
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
      const speciesSubzoneMap: Record<number, Record<number, number>> = {};
      const rows: { [p: string]: unknown }[] = [];
      for (const sp of speciesList) {
        // for each species add the number of plants in each subzone for delivery type plantings
        speciesSubzoneMap[sp] = {};
        delivery?.plantings
          ?.filter((pl) => pl.speciesId === sp && pl.type === 'Delivery')
          .forEach((pl) => {
            const subzone = pl.plantingSubzoneId ?? -1;
            if (!speciesSubzoneMap[sp][subzone]) {
              speciesSubzoneMap[sp][subzone] = pl.numPlants;
              return;
            }
            speciesSubzoneMap[sp][subzone] += pl.numPlants;
          });

        for (const subzoneKey of Object.keys(speciesSubzoneMap[sp])) {
          const subzone = Number(subzoneKey);
          rows.push({
            species: species?.find((x) => x?.id === sp)?.scientificName ?? '',
            to_subzone: subzone > -1 ? subzoneNames[subzone] ?? subzone?.toString() : '',
            quantity: numberFormatter.format(speciesSubzoneMap[sp][subzone]),
          });
        }
      }

      const batchesMap: BatchesRow[] = [];

      if (Object.keys(batchToSpeciesMap).length > 0) {
        withdrawal?.batchWithdrawals?.forEach((batch) => {
          const { batchId, notReadyQuantityWithdrawn, readyQuantityWithdrawn } = batch;
          const { speciesId, batchNumber } = batchToSpeciesMap[batchId];
          const notReady = notReadyQuantityWithdrawn || 0;
          const ready = readyQuantityWithdrawn || 0;
          const name = species.find((sp) => sp.id === speciesId)?.scientificName;
          const subzonemap = speciesSubzoneMap[speciesId];
          const subzoneIds = Object.keys(subzonemap);
          batchesMap.push({
            name,
            total: notReady + ready,
            batchNumber,
            batchId,
            speciesId,
            toSubzone: subzoneIds.map((szId) => subzoneNames[Number(szId)]).join(','),
          });
        });
      }

      return batchesMap;
    } else {
      return [];
    }
  }, [delivery, species, subzoneNames, numberFormatter, batches, withdrawal?.batchWithdrawals]);

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
