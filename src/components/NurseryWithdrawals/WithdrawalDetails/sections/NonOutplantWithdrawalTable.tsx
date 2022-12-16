import { Table, TableColumnType } from '@terraware/web-components';
import { useEffect, useState } from 'react';
import strings from 'src/strings';
import { Batch, NurseryWithdrawal } from 'src/api/types/batch';
import { Species } from 'src/types/Species';

const columns: TableColumnType[] = [
  { key: 'name', name: strings.SPECIES, type: 'string' },
  { key: 'notReady', name: strings.NOT_READY, type: 'number' },
  { key: 'ready', name: strings.READY, type: 'number' },
  { key: 'total', name: strings.TOTAL, type: 'number' },
];

type SpeciesWithdrawal = {
  name?: string;
  notReady: number;
  ready: number;
  total: number;
};

type SpeciesBatchMap = { [key: string]: SpeciesWithdrawal };

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
  const [rowData, setRowData] = useState<SpeciesWithdrawal[]>([]);

  useEffect(() => {
    // get map of batch id to species id - for correlation
    // the withdrawal details hold a batch id but no species id
    // the batches details has the species id
    const batchToSpecies =
      batches?.reduce<{ [key: string]: number }>(
        (acc, batch) => ({ ...acc, [batch.id.toString()]: batch.speciesId }),
        {}
      ) ?? {};

    const speciesBatchMap: SpeciesBatchMap = {};
    withdrawal?.batchWithdrawals?.forEach((batch) => {
      const { batchId, notReadyQuantityWithdrawn, readyQuantityWithdrawn } = batch;
      const speciesId = batchToSpecies[batchId];
      const notReady = notReadyQuantityWithdrawn || 0;
      const ready = readyQuantityWithdrawn || 0;
      const name = species.find((sp) => sp.id === speciesId)?.scientificName;
      if (!speciesBatchMap[speciesId]) {
        speciesBatchMap[speciesId] = { name, notReady, ready, total: notReady + ready };
      } else {
        speciesBatchMap[speciesId].total += notReady + ready;
      }
    });

    setRowData(Object.values(speciesBatchMap));
  }, [species, batches, withdrawal]);

  return <Table id='non-outplant-withdrawal-table' columns={columns} rows={rowData} orderBy={'name'} />;
}
