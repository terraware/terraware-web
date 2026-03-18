import React, { type JSX, useMemo } from 'react';

import { TableColumnType } from '@terraware/web-components';

import Table from 'src/components/common/table';
import { usePlantingSiteData } from 'src/providers/Tracking/PlantingSiteContext';
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
  stratumNames: Record<number, string>;
  delivery?: Delivery;
  batches?: Batch[];
  withdrawal?: NurseryWithdrawal;
};

const columns = (): TableColumnType[] => [
  { key: 'batchNumber', name: strings.BATCH, type: 'string' },
  { key: 'name', name: strings.SPECIES, type: 'string' },
  { key: 'toStratum', name: strings.TO_STRATUM, type: 'string' },
  { key: 'toSubstratum', name: strings.TO_SUBSTRATUM, type: 'string' },
  { key: 'total', name: strings.QUANTITY, type: 'number' },
];

export default function OutplantWithdrawalTable({
  species,
  stratumNames,
  substratumNames,
  delivery,
  batches,
  withdrawal,
}: OutplantWithdrawalTableProps): JSX.Element {
  const numberFormatter = useNumberFormatter();
  const { allPlantingSites } = usePlantingSiteData();

  type BatchesRow = {
    name?: string;
    total: number;
    batchNumber: string;
    batchId: number;
    speciesId: number;
    toStratum: string;
    toSubstratum: string;
  };

  const plantingSiteId = delivery?.plantingSiteId;
  const plantingSite = allPlantingSites?.find((site) => site.id === plantingSiteId);

  const substratumToStratumMap = useMemo(() => {
    const map: Record<number, number> = {};
    plantingSite?.strata?.forEach((stratum) => {
      stratum.substrata?.forEach((substratum) => {
        map[substratum.id] = stratum.id;
      });
    });
    return map;
  }, [plantingSite?.strata]);

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
      const speciesStratumMap: Record<number, Record<number, number>> = {};
      const rows: { [p: string]: unknown }[] = [];
      for (const sp of speciesList) {
        // for each species add the number of plants in each substratum for delivery type plantings
        speciesSubstratumMap[sp] = {};
        speciesStratumMap[sp] = {};
        delivery?.plantings
          ?.filter((pl) => pl.speciesId === sp && pl.type === 'Delivery')
          .forEach((pl) => {
            const substratumId = pl.substratumId ?? -1;
            const stratumId = substratumId !== -1 ? substratumToStratumMap[substratumId] : undefined;
            if (!speciesSubstratumMap[sp][substratumId]) {
              speciesSubstratumMap[sp][substratumId] = pl.numPlants;
            } else {
              speciesSubstratumMap[sp][substratumId] += pl.numPlants;
            }
            if (stratumId && !speciesStratumMap[sp][stratumId]) {
              speciesStratumMap[sp][stratumId] = pl.numPlants;
            } else if (stratumId) {
              speciesStratumMap[sp][stratumId] += pl.numPlants;
            }
          });

        for (const substratumKey of Object.keys(speciesSubstratumMap[sp])) {
          const substratumId = Number(substratumKey);
          rows.push({
            quantity: numberFormatter.format(speciesSubstratumMap[sp][substratumId]),
            species: species?.find((x) => x?.id === sp)?.scientificName ?? '',
            to_stratum: substratumId > -1 ? stratumNames[substratumToStratumMap[substratumId]] ?? '' : '',
            to_substratum: substratumId > -1 ? substratumNames[substratumId] ?? substratumId?.toString() : '',
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
          const total = activeGrowth + hardeningOff + ready;
          const name = species.find((sp) => sp.id === speciesId)?.scientificName;
          const substratumMap = speciesSubstratumMap[speciesId];
          const substratumIds = Object.keys(substratumMap);
          const toSubstratum = substratumIds.map((_subId) => substratumNames[Number(_subId)]).join(',');
          const stratumMap = speciesStratumMap[speciesId];
          const stratumIds = Object.keys(stratumMap);
          const toStratum = stratumIds.map((_id) => stratumNames[Number(_id)]).join(',');

          batchesMap.push({
            name,
            batchNumber,
            batchId,
            speciesId,
            toStratum,
            toSubstratum,
            total,
          });
        });
      }

      return batchesMap;
    } else {
      return [];
    }
  }, [
    batches,
    delivery?.plantings,
    numberFormatter,
    species,
    stratumNames,
    substratumNames,
    substratumToStratumMap,
    withdrawal?.batchWithdrawals,
  ]);

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
