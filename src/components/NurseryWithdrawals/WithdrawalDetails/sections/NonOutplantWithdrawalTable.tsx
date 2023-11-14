import { useEffect, useMemo, useState } from 'react';
import { TableColumnType } from '@terraware/web-components';
import strings from 'src/strings';
import { Batch, NurseryWithdrawal } from 'src/types/Batch';
import { Species } from 'src/types/Species';
import Table from 'src/components/common/table';
import { useUser } from 'src/providers';
import { useNumberFormatter } from 'src/utils/useNumber';
import WithdrawalRenderer from './WithdrawalRenderer';

type SpeciesWithdrawal = {
  name?: string;
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
    const batchToSpecies =
      batches?.reduce<{ [key: string]: { speciesId: number; batchNumber: string } }>(
        (acc, batch) => ({
          ...acc,
          [batch.id.toString()]: { speciesId: batch.speciesId, batchNumber: batch.batchNumber },
        }),
        {}
      ) ?? {};

    const speciesBatchMap: SpeciesBatchMap = {};
    if (Object.keys(batchToSpecies).length > 0) {
      withdrawal?.batchWithdrawals?.forEach((batch) => {
        const { batchId, notReadyQuantityWithdrawn, readyQuantityWithdrawn } = batch;
        const { speciesId, batchNumber } = batchToSpecies[batchId];
        const notReady = notReadyQuantityWithdrawn || 0;
        const ready = readyQuantityWithdrawn || 0;
        const name = species.find((sp) => sp.id === speciesId)?.scientificName;
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
      });
    }

    setRowData(
      Object.values(speciesBatchMap).map((speciesInfo: any) => {
        const getFormattedValue = (key: string) => {
          const value = speciesInfo[key];
          return isNaN(value) ? value : numericFormatter.format(value);
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
