import React, { useMemo, useState } from 'react';
import { useParams } from 'react-router';

import { Box } from '@mui/material';
import { TableColumnType } from '@terraware/web-components';
import { getDateDisplayValue } from '@terraware/web-components/utils';

import { Crumb } from 'src/components/BreadCrumbs';
import Page from 'src/components/Page';
import Card from 'src/components/common/Card';
import Search, { SearchProps } from 'src/components/common/SearchFiltersWrapper';
import Table from 'src/components/common/table';
import CellRenderer, { TableRowType } from 'src/components/common/table/TableCellRenderer';
import { RendererProps } from 'src/components/common/table/types';
import { APP_PATHS } from 'src/constants';
import { useSyncNavigate } from 'src/hooks/useSyncNavigate';
import strings from 'src/strings';
import { MinimalPlantingSite, MinimalPlantingZone } from 'src/types/Tracking';
import { useDefaultTimeZone } from 'src/utils/useTimeZoneUtils';

const columns = (): TableColumnType[] => [
  {
    key: 'fullName',
    name: strings.SUBZONE,
    type: 'string',
  },
  {
    key: 'plantingCompleted',
    name: strings.PLANTING_COMPLETE,
    tooltipTitle: strings.PLANTING_COMPLETE_TOOLTIP,
    type: 'boolean',
  },
  {
    key: 'areaHa',
    name: strings.AREA_HA,
    type: 'number',
  },
  {
    key: 'latestObservationCompletedTime',
    name: strings.LAST_OBSERVED,
    type: 'string',
  },
];

export type GenericStratumViewProps = {
  plantingSite: MinimalPlantingSite;
  plantingZone: MinimalPlantingZone;
};

export default function GenericStratumView({ plantingSite, plantingZone }: GenericStratumViewProps): JSX.Element {
  const [search, setSearch] = useState<string>('');
  const navigate = useSyncNavigate();
  const { plantingSiteId } = useParams<{ plantingSiteId: string }>();
  const defaultTimeZone = useDefaultTimeZone();
  const timeZone = plantingSite.timeZone ?? defaultTimeZone.get().id;

  const searchProps = useMemo<SearchProps>(
    () => ({
      search,
      onSearch: (value: string) => setSearch(value),
    }),
    [search]
  );

  if (!plantingSite) {
    navigate(APP_PATHS.PLANTING_SITES);
  }

  if (!plantingZone && plantingSiteId) {
    navigate(APP_PATHS.PLANTING_SITES_VIEW.replace(':plantingSiteId', plantingSiteId));
  }

  const crumbs: Crumb[] = useMemo(
    () => [
      {
        name: strings.PLANTING_SITES,
        to: APP_PATHS.PLANTING_SITES,
      },
      {
        name: plantingSite?.name ?? '',
        to: `/${plantingSiteId}`,
      },
    ],
    [plantingSite?.name, plantingSiteId]
  );

  return (
    <Page crumbs={crumbs} title={plantingZone?.name ?? ''}>
      <Card flushMobile style={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
        <Search {...searchProps} />
        <Box>
          <Table
            id='planting-site-zone-details-table'
            columns={columns}
            rows={plantingZone?.plantingSubzones ?? []}
            orderBy='fullName'
            Renderer={DetailsRenderer(timeZone)}
          />
        </Box>
      </Card>
    </Page>
  );
}

const DetailsRenderer =
  (timeZone: string) =>
  // eslint-disable-next-line react/display-name
  (props: RendererProps<TableRowType>): JSX.Element => {
    const { column, value } = props;

    const textStyles = {
      fontSize: '16px',
      '& > p': {
        fontSize: '16px',
      },
    };

    if (column.key === 'areaHa') {
      return <CellRenderer {...props} value={value || ''} sx={textStyles} />;
    }

    if (column.key === 'latestObservationCompletedTime') {
      return (
        <CellRenderer {...props} value={value ? getDateDisplayValue(value as string, timeZone) : ''} sx={textStyles} />
      );
    }

    return <CellRenderer {...props} />;
  };
