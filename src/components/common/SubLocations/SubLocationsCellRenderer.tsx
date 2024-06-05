import React from 'react';

import Link from 'src/components/common/Link';
import CellRenderer, { TableRowType } from 'src/components/common/table/TableCellRenderer';
import { RendererProps } from 'src/components/common/table/types';
import { NumericFormatter } from 'src/types/Number';

export type SubLocationsCellRendererProps = {
  facilityId?: number;
  numericFormatter: NumericFormatter;
  editMode: boolean;
  renderLink?: (facilityId: number, subLocationName: string) => string;
};

export default function SubLocationsCellRenderer({
  facilityId,
  numericFormatter,
  editMode,
  renderLink,
}: SubLocationsCellRendererProps) {
  // eslint-disable-next-line react/display-name
  return (props: RendererProps<TableRowType>): JSX.Element => {
    const { column, value, row, onRowClick } = props;

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const rowClick = (event?: React.SyntheticEvent) => {
      if (editMode && !!onRowClick) {
        onRowClick();
      }
    };

    const createLinkToData = (locationName: string, data: string) => {
      if (!renderLink || !facilityId) {
        return data;
      }
      return (
        <Link fontSize='16px' to={renderLink(facilityId, locationName)}>
          {data}
        </Link>
      );
    };

    const createLinkToName = (locationName: string) => {
      return (
        <Link fontSize='16px' onClick={rowClick}>
          {locationName}
        </Link>
      );
    };

    if (column.key === 'activeAccessions' || column.key === 'activeBatches') {
      const activeDataStr = numericFormatter.format(value as number);
      const data = editMode ? activeDataStr : createLinkToData(row.name, activeDataStr);

      return <CellRenderer {...props} value={data} />;
    }

    if (column.key === 'name') {
      const locationName = row.name as string;

      return <CellRenderer {...props} value={editMode ? createLinkToName(locationName) : locationName} />;
    }

    return <CellRenderer {...props} value={value} />;
  };
}
