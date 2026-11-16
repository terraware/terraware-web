import React, { type JSX, useMemo } from 'react';

import { TableColumnType } from '@terraware/web-components';

import Table from 'src/components/common/table';
import { useLocalization } from 'src/providers';
import { SearchSeedWithdrawalPayload } from 'src/queries/search/seedWithdrawals';
import { seedWithdrawalQuantity } from 'src/scenes/SeedsWithdrawals/exportSeedWithdrawals';

import WithdrawalAccessionsRenderer from './WithdrawalAccessionsRenderer';

type WithdrawalAccessionsTableProps = {
  withdrawals: SearchSeedWithdrawalPayload[];
};

const WithdrawalAccessionsTable = ({ withdrawals }: WithdrawalAccessionsTableProps): JSX.Element => {
  const { strings } = useLocalization();

  const columns = useMemo(
    (): TableColumnType[] => [
      { key: 'accessionNumber', name: strings.ACCESSION, type: 'string' },
      { key: 'speciesName', name: strings.SPECIES, type: 'string' },
      { key: 'quantity', name: strings.QUANTITY_WITHDRAWN, type: 'string', alignment: 'right' },
    ],
    [strings]
  );

  const rows = useMemo(
    () =>
      withdrawals.map((withdrawal) => ({
        id: withdrawal.id,
        accessionId: withdrawal.accessionId,
        accessionNumber: withdrawal.accessionNumber,
        quantity: seedWithdrawalQuantity(withdrawal),
        speciesName: withdrawal.speciesName,
      })),
    [withdrawals]
  );

  return (
    <Table
      id='seeds-withdrawal-accessions-table'
      columns={columns}
      rows={rows}
      orderBy='speciesName'
      Renderer={WithdrawalAccessionsRenderer}
    />
  );
};

export default WithdrawalAccessionsTable;
