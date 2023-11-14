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
import isEnabled from 'src/features';

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
  { key: 'notReady', name: strings.NOT_READY, type: 'number' },
  { key: 'ready', name: strings.READY, type: 'number' },
  { key: 'total', name: strings.TOTAL, type: 'number' },
];

const nurseryV2Columns = (): TableColumnType[] => [
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
  const nurseryV2 = isEnabled('Nursery Updates');
  const [rowData, setRowData] = useState<SpeciesWithdrawal[]>([]);

  useEffect(() => {
    // get map of batch id to species id - for correlation
    // the withdrawal details hold a batch id but no species id
    // the batches details has the species id
    if (batches) {
      const batchToSpeciesMap = batchToSpecies(batches);

      const speciesBatchMap: SpeciesBatchMap = {};
      const batchesMap: SpeciesWithdrawal[] = [];

      if (Object.keys(batchToSpeciesMap).length > 0) {
        withdrawal?.batchWithdrawals?.forEach((batch) => {
          const { batchId, notReadyQuantityWithdrawn, readyQuantityWithdrawn } = batch;
          const { speciesId, batchNumber } = batchToSpeciesMap[batchId];
          const notReady = notReadyQuantityWithdrawn || 0;
          const ready = readyQuantityWithdrawn || 0;
          const name = species.find((sp) => sp.id === speciesId)?.scientificName;
          if (nurseryV2) {
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
          } else {
            if (!speciesBatchMap[speciesId]) {
              speciesBatchMap[speciesId] = {
                name,
                notReady,
                ready,
                total: notReady + ready,
                batchNumber,
                batchId,
                speciesId,
              };
            } else {
              speciesBatchMap[speciesId].notReady += notReady;
              speciesBatchMap[speciesId].ready += ready;
              speciesBatchMap[speciesId].total += notReady + ready;
              speciesBatchMap[speciesId].batchNumber = batchNumber;
              speciesBatchMap[speciesId].batchId = batchId;
              speciesBatchMap[speciesId].speciesId = speciesId;
            }
          }
        });
      }

      if (nurseryV2) {
        setRowData(batchesMap);
      } else {
        setRowData(
          Object.values(speciesBatchMap).map((speciesInfo: any) => {
            const getFormattedValue = (key: string) => {
              const value = speciesInfo[key];
              return isNaN(value) ? '' : numericFormatter.format(value);
            };

            const notReady = getFormattedValue('notReady');
            const ready = getFormattedValue('ready');
            const total = getFormattedValue('total');

            return {
              ...speciesInfo,
              notReady,
              ready,
              total,
            };
          })
        );
      }
    }
  }, [species, batches, withdrawal, numericFormatter, nurseryV2]);

  return (
    <Table
      id='non-outplant-withdrawal-table'
      columns={nurseryV2 ? nurseryV2Columns : columns}
      rows={rowData}
      orderBy={'name'}
      Renderer={WithdrawalRenderer}
    />
  );
}
