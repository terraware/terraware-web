import React, { type JSX } from 'react';

import Page, { PrimaryButtonType } from 'src/components/Page';
import TableWithSearchFilters, { TableWithSearchFiltersProps } from 'src/components/TableWithSearchFilters';

export type PageListViewProps = {
  afterTableContent?: JSX.Element;
  leftComponent?: JSX.Element;
  title: string;
  primaryButton?: PrimaryButtonType;
  tableWithSearchProps: TableWithSearchFiltersProps;
};

const PageListView = ({
  afterTableContent,
  leftComponent,
  primaryButton,
  tableWithSearchProps,
  title,
}: PageListViewProps): JSX.Element => {
  return (
    <Page title={title} primaryButton={primaryButton} leftComponent={leftComponent}>
      <TableWithSearchFilters {...tableWithSearchProps} />
      {afterTableContent}
    </Page>
  );
};

export default PageListView;
