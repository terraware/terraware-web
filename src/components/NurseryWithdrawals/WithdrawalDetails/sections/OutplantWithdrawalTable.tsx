import { useEffect, useMemo, useState } from 'react';
import { TableColumnType } from '@terraware/web-components';
import strings from 'src/strings';
import { Delivery } from 'src/types/Tracking';
import { Species } from 'src/types/Species';
import Table from 'src/components/common/table';
import { useUser } from 'src/providers';
import { useNumberFormatter } from 'src/utils/useNumber';
import { Batch, NurseryWithdrawal } from 'src/types/Batch';
import { batchToSpecies } from 'src/utils/batch';
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
  { key: 'total', name: strings.QUANTITY, type: 'string' },
];

export default function OutplantWithdrawalTable({
  species,
  subzoneNames,
  delivery,
  batches,
  withdrawal,
}: OutplantWithdrawalTableProps): JSX.Element {
  const { user } = useUser();
  const numberFormatter = useNumberFormatter();
  const numericFormatter = useMemo(() => numberFormatter(user?.locale), [numberFormatter, user?.locale]);
  const [rowData, setRowData] = useState<{ [p: string]: unknown }[]>([]);

  type BatchesRow = {
    name?: string;
    total: number;
    batchNumber: string;
    batchId: number;
    speciesId: number;
    toSubzone: string;
  };

  useEffect(() => {
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
            quantity: numericFormatter.format(speciesSubzoneMap[sp][subzone]),
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

      setRowData(batchesMap);
    }
  }, [delivery, species, subzoneNames, numericFormatter, batches, withdrawal?.batchWithdrawals]);

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
