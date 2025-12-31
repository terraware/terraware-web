import React from 'react';

import { Box } from '@mui/material';
import { TableColumnType } from '@terraware/web-components';

import Link from 'src/components/common/Link';
import Table from 'src/components/common/table';
import CellRenderer, { TableRowType } from 'src/components/common/table/TableCellRenderer';
import { RendererProps } from 'src/components/common/table/types';
import { APP_PATHS } from 'src/constants';
import strings from 'src/strings';
import { MinimalPlantingSite } from 'src/types/Tracking';
import { useDefaultTimeZone } from 'src/utils/useTimeZoneUtils';

/**
 * Planting site list view
 */

type DraftPlantingSiteDetailsTableProps = {
  plantingSite: MinimalPlantingSite;
};

const columns = (): TableColumnType[] => [
  {
    key: 'name',
    name: strings.ZONE,
    type: 'string',
  },
  {
    key: 'targetPlantingDensity',
    name: strings.TARGET_PLANTING_DENSITY,
    tooltipTitle: strings.TARGET_PLANTING_DENSITY_TOOLTIP,
    type: 'number',
  },
  {
    key: 'plantingSubzones',
    name: strings.SUBZONES,
    type: 'number',
  },
];

export default function DraftPlantingSiteDetailsTable({
  plantingSite,
}: DraftPlantingSiteDetailsTableProps): JSX.Element {
  const defaultTimeZone = useDefaultTimeZone();
  const timeZone = plantingSite.timeZone ?? defaultTimeZone.get().id;

  return (
    <Box>
      <Table
        id='draft-planting-site-details-table'
        columns={columns}
        rows={plantingSite.strata ?? []}
        orderBy='name'
        Renderer={DetailsRenderer(timeZone, plantingSite.id)}
      />
    </Box>
  );
}

const DetailsRenderer =
  (timeZone: string, plantingSiteId: number) =>
  // eslint-disable-next-line react/display-name
  (props: RendererProps<TableRowType>): JSX.Element => {
    const { column, row, value } = props;

    const textStyles = {
      fontSize: '16px',
      '& > p': {
        fontSize: '16px',
      },
    };

    const createLinkToZone = () => {
      const url = APP_PATHS.PLANTING_SITES_DRAFT_ZONE_VIEW.replace(
        ':plantingSiteId',
        plantingSiteId.toString()
      ).replace(':zoneId', row.id.toString());
      return (
        <Link fontSize='16px' to={url}>
          {(row.name || '--') as React.ReactNode}
        </Link>
      );
    };

    if (column.key === 'name') {
      return <CellRenderer {...props} value={createLinkToZone()} sx={textStyles} title={value as string} />;
    }

    if (column.key === 'plantingSubzones') {
      return <CellRenderer {...props} value={row.plantingSubzones.length} sx={textStyles} />;
    }

    return <CellRenderer {...props} />;
  };
