import React from 'react';

import Page, { PrimaryButtonType } from 'src/components/Page';
import TableWithSearchFilters, { TableWithSearchFiltersProps } from 'src/components/TableWithSearchFilters';

export type PageListViewProps = {
  // main title and primary button
  title: string;
  primaryButton?: PrimaryButtonType;

  // table
  tableWithSearchProps: TableWithSearchFiltersProps;

  // other
  afterTableContent?: JSX.Element;
};

const PageListView = ({
  afterTableContent,
  primaryButton,
  tableWithSearchProps,
  title,
}: PageListViewProps): JSX.Element => {
  return (
    <Page title={title} primaryButton={primaryButton}>
      <TableWithSearchFilters {...tableWithSearchProps} />
      {afterTableContent}
    </Page>
  );
};

export default PageListView;
