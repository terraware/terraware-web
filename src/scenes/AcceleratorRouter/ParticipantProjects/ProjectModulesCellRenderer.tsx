import React, { useCallback } from 'react';

import { RendererProps, TableRowType } from '@terraware/web-components';

import Link from 'src/components/common/Link';
import CellRenderer from 'src/components/common/table/TableCellRenderer';
import { APP_PATHS } from 'src/constants';

export type ProjectModulesCellRendererProps = {
  editing?: boolean;
  onClickName?: (id: number) => void;
};

export default function ProjectModulesCellRenderer({ editing, onClickName }: ProjectModulesCellRendererProps) {
  // has to be defined separately so that useCallback works inside it
  const Renderer = (props: RendererProps<TableRowType>): JSX.Element => {
    const { column, row, value } = props;

    const onClickNameCallback = useCallback(() => onClickName?.(row.id), [row.id]);

    if (column.key === 'title' && editing) {
      return (
        <CellRenderer
          {...props}
          value={
            <Link
              fontSize='16px'
              fontWeight={400}
              target='_blank'
              onClick={onClickNameCallback}
              style={{ verticalAlign: 'baseline' }}
            >
              {value as string}
            </Link>
          }
        />
      );
    } else if (column.key === 'name' && !editing) {
      return (
        <CellRenderer
          {...props}
          value={
            <Link
              fontSize='16px'
              target='_blank'
              to={APP_PATHS.ACCELERATOR_MODULE_CONTENT.replace(':moduleId', row.id)}
            >
              {value as React.ReactNode}
            </Link>
          }
        />
      );
    }

    return <CellRenderer {...props} />;
  };

  return Renderer;
}
