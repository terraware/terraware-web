import { useEffect, useMemo, useState } from 'react';
import { TableColumnType } from '@terraware/web-components';
import strings from 'src/strings';
import { Batch, NurseryWithdrawal } from 'src/types/Batch';
import { Species } from 'src/types/Species';
import Table from 'src/components/common/table';
import { useUser } from 'src/providers';
import { useNumberFormatter } from 'src/utils/useNumber';
import WithdrawalRenderer from './WithdrawalRenderer';
import { batchToSpecies } from 'src/utils/batch';

type SpeciesWithdrawal = {
  name?: string;
  germinating?: number;
  notReady: number;
  ready: number;
  total: number;
  batchNumber: string;
  batchId: number;
  speciesId: number;
};

type SpeciesBatchMap = { [key: string]: SpeciesWithdrawal };

type NonOutplantWithdrawalTableProps = {
  species: Species[];
  withdrawal?: NurseryWithdrawal;
  batches?: Batch[];
};

const columns = (): TableColumnType[] => [
  { key: 'batchNumber', name: strings.BATCH, type: 'string' },
  { key: 'name', name: strings.SPECIES, type: 'string' },
  { key: 'germinating', name: strings.GERMINATING, type: 'number' },
  { key: 'notReady', name: strings.NOT_READY, type: 'number' },
  { key: 'ready', name: strings.READY, type: 'number' },
  { key: 'total', name: strings.TOTAL, type: 'number' },
];

export default function NonOutplantWithdrawalTable({
  species,
  withdrawal,
  batches,
}: NonOutplantWithdrawalTableProps): JSX.Element {
  const { user } = useUser();
  const numberFormatter = useNumberFormatter();
  const numericFormatter = useMemo(() => numberFormatter(user?.locale), [numberFormatter, user?.locale]);
  const [rowData, setRowData] = useState<SpeciesWithdrawal[]>([]);

  useEffect(() => {
    // get map of batch id to species id - for correlation
    // the withdrawal details hold a batch id but no species id
    // the batches details has the species id
    if (batches) {
      const batchToSpeciesMap = batchToSpecies(batches);

      const batchesMap: SpeciesWithdrawal[] = [];

      if (Object.keys(batchToSpeciesMap).length > 0) {
        withdrawal?.batchWithdrawals?.forEach((batch) => {
          const { batchId, notReadyQuantityWithdrawn, readyQuantityWithdrawn } = batch;
          const { speciesId, batchNumber } = batchToSpeciesMap[batchId];
          const notReady = notReadyQuantityWithdrawn || 0;
          const ready = readyQuantityWithdrawn || 0;
          const name = species.find((sp) => sp.id === speciesId)?.scientificName;

          const { germinatingQuantityWithdrawn } = batch;
          const germinating = germinatingQuantityWithdrawn || 0;
          batchesMap.push({
            name,
            germinating,
            notReady,
            ready,
            total: notReady + ready + germinating,
            batchNumber,
            batchId,
            speciesId,
          });
        });
      }

      setRowData(batchesMap);
    }
  }, [species, batches, withdrawal, numericFormatter]);

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
