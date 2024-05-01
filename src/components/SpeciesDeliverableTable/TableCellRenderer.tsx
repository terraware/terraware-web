import React from 'react';

import DeliverableStatusBadge from 'src/components/DeliverableView/DeliverableStatusBadge';
import Link from 'src/components/common/Link';
import CellRenderer, { TableRowType } from 'src/components/common/table/TableCellRenderer';
import { RendererProps } from 'src/components/common/table/types';
import { useLocalization } from 'src/providers';
import { DeliverableStatusType } from 'src/types/Deliverables';

export default function SpeciesDeliverableCellRenderer(props: RendererProps<TableRowType>): JSX.Element {
  const { activeLocale } = useLocalization();
  const { column, index, row, value } = props;

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
    return <CellRenderer column={column} index={index} row={row} value={createLinkToSpecies(value)} />;
  }

  if (column.key === 'status') {
    return (
      <CellRenderer
        column={column}
        index={index}
        row={row}
        value={activeLocale ? <DeliverableStatusBadge status={value as DeliverableStatusType} /> : ''}
      />
    );
  }

  return <CellRenderer {...props} />;
}
