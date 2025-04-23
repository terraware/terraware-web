import React, { useMemo } from 'react';

import Link from 'src/components/common/Link';
import CellRenderer, { TableRowType } from 'src/components/common/table/TableCellRenderer';
import { RendererProps } from 'src/components/common/table/types';
import { useOrganization, useUser } from 'src/providers';

export default function AcceleratorReportTargetsCellRenderer(props: RendererProps<TableRowType>): JSX.Element {
  const { column, row, value, index, onRowClick } = props;
  const { isAllowed } = useUser();
  const { selectedOrganization } = useOrganization();

  const isAllowedUpdateReportsTargets = useMemo(
    () => isAllowed('UPDATE_REPORTS_TARGETS', { organization: selectedOrganization }),
    [isAllowed, selectedOrganization]
  );

  if (column.key === 'name' && onRowClick) {
    return (
      <CellRenderer
        column={column}
        value={
          isAllowedUpdateReportsTargets ? (
            <Link fontSize='16px' onClick={() => onRowClick()}>
              {value as React.ReactNode}
            </Link>
          ) : (
            value
          )
        }
        row={row}
        index={index}
      />
    );
  }

  return <CellRenderer {...props} />;
}
