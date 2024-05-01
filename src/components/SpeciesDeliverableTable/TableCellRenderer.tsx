import React from 'react';

import DeliverableStatusBadge from 'src/components/DeliverableView/DeliverableStatusBadge';
import Link from 'src/components/common/Link';
import CellRenderer, { TableRowType } from 'src/components/common/table/TableCellRenderer';
import { RendererProps } from 'src/components/common/table/types';
import { useLocalization } from 'src/providers';
import { DeliverableStatusType } from 'src/types/Deliverables';

export default function SpeciesDeliverableCellRenderer(props: RendererProps<TableRowType>): JSX.Element {
  const { activeLocale } = useLocalization();
  const { column, row, value, index } = props;

  const createLinkToSpecies = (iValue: React.ReactNode | unknown[]) => {
    return (
      <Link
        onClick={() => {
          console.log('species deliverable click');
        }}
      >
        {iValue as React.ReactNode}
      </Link>
    );
  };

  if (column.key === 'speciesScientificName') {
    return <CellRenderer index={index} column={column} value={createLinkToSpecies(value)} row={row} />;
  }

  if (column.key === 'status') {
    return (
      <CellRenderer
        index={index}
        column={column}
        value={activeLocale ? <DeliverableStatusBadge status={value as DeliverableStatusType} /> : ''}
        row={row}
      />
    );
  }

  return <CellRenderer {...props} />;
}
