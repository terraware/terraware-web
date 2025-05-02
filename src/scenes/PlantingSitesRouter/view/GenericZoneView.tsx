import React, { useMemo, useState } from 'react';
import { useParams } from 'react-router';

import { Box } from '@mui/material';
import { TableColumnType } from '@terraware/web-components';

import { Crumb } from 'src/components/BreadCrumbs';
import Page from 'src/components/Page';
import Card from 'src/components/common/Card';
import Link from 'src/components/common/Link';
import Search, { SearchProps } from 'src/components/common/SearchFiltersWrapper';
import Table from 'src/components/common/table';
import CellRenderer, { TableRowType } from 'src/components/common/table/TableCellRenderer';
import { RendererProps } from 'src/components/common/table/types';
import { APP_PATHS } from 'src/constants';
import { useSyncNavigate } from 'src/hooks/useSyncNavigate';
import { RootState } from 'src/redux/rootReducer';
import { useAppSelector } from 'src/redux/store';
import strings from 'src/strings';
import { ZoneAggregation } from 'src/types/Observations';
import { MinimalPlantingSite } from 'src/types/Tracking';

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
    key: 'monitoringPlots',
    name: strings.MONITORING_PLOTS,
    type: 'number',
  },
];

export type Props = {
  siteSelector: (state: RootState, plantingSiteId: number) => MinimalPlantingSite | undefined;
  siteViewPrefix: string;
  siteViewUrl: string;
  subzoneViewUrl: string;
  zoneSelector: (
    state: RootState,
    plantingSiteId: number,
    zoneId: number,
    query: string
  ) => ZoneAggregation | undefined;
};

export default function GenericZoneView({
  siteSelector,
  siteViewPrefix,
  siteViewUrl,
  subzoneViewUrl,
  zoneSelector,
}: Props): JSX.Element {
  const [search, setSearch] = useState<string>('');
  const navigate = useSyncNavigate();
  const { plantingSiteId, zoneId } = useParams<{ plantingSiteId: string; zoneId: string }>();

  const plantingSite = useAppSelector((state) => siteSelector(state, Number(plantingSiteId)));
  const plantingZone = useAppSelector((state) =>
    zoneSelector(state, Number(plantingSiteId), Number(zoneId), search.trim())
  );

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
    navigate(siteViewUrl.replace(':plantingSiteId', plantingSiteId));
  }

  const crumbs: Crumb[] = useMemo(
    () => [
      {
        name: strings.PLANTING_SITES,
        to: APP_PATHS.PLANTING_SITES,
      },
      {
        name: plantingSite?.name ?? '',
        to: `${siteViewPrefix}/${plantingSiteId}`,
      },
    ],
    [plantingSite?.name, plantingSiteId, siteViewPrefix]
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
            Renderer={DetailsRenderer(Number(plantingSiteId), Number(zoneId), subzoneViewUrl)}
          />
        </Box>
      </Card>
    </Page>
  );
}

const DetailsRenderer =
  (plantingSiteId: number, zoneId: number, subzoneViewUrl: string) =>
  // eslint-disable-next-line react/display-name
  (props: RendererProps<TableRowType>): JSX.Element => {
    const { column, row, value } = props;

    const textStyles = {
      fontSize: '16px',
      '& > p': {
        fontSize: '16px',
      },
    };

    const createLinkToSubzone = () => {
      if (row.monitoringPlots.length === 0) {
        // don't link if there are no monitoring plots to show in the details view
        return row.fullName;
      }
      const url = subzoneViewUrl
        .replace(':plantingSiteId', plantingSiteId.toString())
        .replace(':zoneId', zoneId.toString())
        .replace(':subzoneId', row.id.toString());
      return (
        <Link fontSize='16px' to={url}>
          {row.fullName as React.ReactNode}
        </Link>
      );
    };

    if (column.key === 'fullName') {
      return <CellRenderer {...props} value={createLinkToSubzone()} sx={textStyles} />;
    }

    if (column.key === 'monitoringPlots') {
      const numMonitoringPlots = row.monitoringPlots.length;
      return <CellRenderer {...props} value={numMonitoringPlots > 0 ? numMonitoringPlots : ''} sx={textStyles} />;
    }

    if (column.key === 'areaHa') {
      return <CellRenderer {...props} value={value || ''} sx={textStyles} />;
    }

    return <CellRenderer {...props} />;
  };
