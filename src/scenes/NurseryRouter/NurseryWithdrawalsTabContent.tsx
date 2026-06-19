import React, { type JSX } from 'react';

import Card from 'src/components/common/Card';

import NurseryWithdrawalsTable from './NurseryWithdrawalsTable';

export default function NurseryWithdrawalsTabContent(): JSX.Element {
  return (
    <Card flushMobile radius={'8px'}>
      <NurseryWithdrawalsTable />
    </Card>
  );
}
