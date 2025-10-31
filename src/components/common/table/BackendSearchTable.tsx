import React, { useCallback, useEffect, useState } from 'react';

import { TableRowType } from '@terraware/web-components';

import { SearchNodePayload } from 'src/types/Search';

import Table, { OrderPreservedTablePropsFull } from './index';

export interface BackendTableProps
  extends Omit<
    OrderPreservedTablePropsFull<TableRowType>,
    'isPresorted' | 'reloadData' | 'onPageChange' | 'currentPage'
  > {
  requestResults: (pageNumber: number) => void;
  requestCount: () => void;
  // searchNodePayload is only used to know when to reload the data
  searchNodePayload: SearchNodePayload[];
}

export default function BackendSearchTable(props: BackendTableProps) {
  const { requestResults, requestCount, searchNodePayload } = props;
  const [currentPage, setCurrentPage] = useState<number>();

  const resetData = useCallback(
    (pageNumber?: number) => {
      const newPageNumber = pageNumber || 1;
      if (!pageNumber) {
        setCurrentPage(newPageNumber);
      }
      requestResults(newPageNumber);
    },
    [requestResults]
  );

  const onPageChange = useCallback(
    (newPage: number) => {
      setCurrentPage(newPage);
      void resetData(newPage);
    },
    [resetData]
  );

  const reload = useCallback(() => {
    void resetData();
  }, [resetData]);

  useEffect(() => {
    reload();
  }, [searchNodePayload, reload]);

  useEffect(() => requestCount(), [requestCount]);

  return (
    <Table {...props} isPresorted={true} reloadData={reload} onPageChange={onPageChange} currentPage={currentPage} />
  );
}
