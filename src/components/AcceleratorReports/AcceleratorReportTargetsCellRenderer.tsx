import React, { type JSX, useCallback, useMemo } from 'react';

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

  const onRowClickCallback = useCallback(() => {
    onRowClick?.();
  }, [onRowClick]);

  if (column.key === 'name' && onRowClick) {
    return (
      <CellRenderer
        column={column}
        value={
          isAllowedUpdateReportsTargets ? (
            <Link fontSize='16px' onClick={onRowClickCallback}>
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
