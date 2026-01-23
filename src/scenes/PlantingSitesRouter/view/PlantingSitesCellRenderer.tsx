import React, { type JSX } from 'react';

import Link from 'src/components/common/Link';
import CellRenderer, { TableRowType } from 'src/components/common/table/TableCellRenderer';
import { RendererProps } from 'src/components/common/table/types';
import { APP_PATHS } from 'src/constants';
import { useTimeZones } from 'src/providers';
import { getTimeZone, useDefaultTimeZone } from 'src/utils/useTimeZoneUtils';

export default function PlantingSitesCellRenderer(props: RendererProps<TableRowType>): JSX.Element {
  const { column, row, value, index } = props;
  const isDraft = row.isDraft;

  const textStyles = {
    fontSize: '16px',
    '& > p': {
      fontSize: '16px',
    },
  };

  const timeZones = useTimeZones();
  const defaultTimeZone = useDefaultTimeZone().get();

  const createLinkToPlantingSiteView = (iValue: React.ReactNode | unknown[]) => {
    const plantingSiteViewUrl = isDraft ? APP_PATHS.PLANTING_SITES_DRAFT_VIEW : APP_PATHS.PLANTING_SITES_VIEW;

    const to = plantingSiteViewUrl.replace(':plantingSiteId', row.id.toString());

    return (
      <Link fontSize='16px' to={to}>
        {iValue as React.ReactNode}
      </Link>
    );
  };

  if (column.key === 'name') {
    return (
      <CellRenderer
        index={index}
        column={column}
        value={createLinkToPlantingSiteView(value)}
        row={row}
        sx={textStyles}
        title={value as string}
      />
    );
  }

  if (column.key === 'timeZoneId') {
    const timeZoneId = row.timeZoneId;
    const timeZone = (timeZoneId ? getTimeZone(timeZones, timeZoneId) : undefined) ?? defaultTimeZone;
    return <CellRenderer index={index} column={column} value={timeZone.longName} row={row} sx={textStyles} />;
  }

  return <CellRenderer {...props} sx={textStyles} />;
}
