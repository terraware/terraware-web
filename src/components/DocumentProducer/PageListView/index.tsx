import React from 'react';

import { TableRowType } from '@terraware/web-components';

import PageContent from 'src/components/DocumentProducer/PageContent';
import { SearchProps } from 'src/components/DocumentProducer/Search';
import TableContent, { TableProps } from 'src/components/DocumentProducer/TableContent';
import Page, { PrimaryButtonType } from 'src/components/Page';

export type PageListViewProps<T> = {
  // main title and primary button
  title: string;
  primaryButton?: PrimaryButtonType;

  // Search
  searchProps?: SearchProps;

  // table
  tableProps: TableProps<T>;

  // other
  afterTableContent?: JSX.Element;
};

const PageListView = <T extends TableRowType>({
  title,
  primaryButton,
  searchProps,
  tableProps,
  afterTableContent,
}: PageListViewProps<T>): JSX.Element => {
  return (
    <Page title={title} primaryButton={primaryButton}>
      <PageContent>
        <TableContent searchProps={searchProps} tableProps={tableProps} />
      </PageContent>
      {afterTableContent}
    </Page>
  );
};

export default PageListView;
