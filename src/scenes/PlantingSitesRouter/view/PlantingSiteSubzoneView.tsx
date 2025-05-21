import React, { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router';

import { Box } from '@mui/material';
import { TableColumnType } from '@terraware/web-components';
import getDateDisplayValue from '@terraware/web-components/utils/date';

import { Crumb } from 'src/components/BreadCrumbs';
import Page from 'src/components/Page';
import Card from 'src/components/common/Card';
import Search, { SearchProps } from 'src/components/common/SearchFiltersWrapper';
import Table from 'src/components/common/table';
import CellRenderer, { TableRowType } from 'src/components/common/table/TableCellRenderer';
import { RendererProps } from 'src/components/common/table/types';
import { APP_PATHS } from 'src/constants';
import { useSyncNavigate } from 'src/hooks/useSyncNavigate';
import { usePlantingSiteData } from 'src/providers/Tracking/PlantingSiteContext';
import strings from 'src/strings';
import { useDefaultTimeZone } from 'src/utils/useTimeZoneUtils';

const columns = (): TableColumnType[] => [
  {
    key: 'plotNumber',
    name: strings.MONITORING_PLOT,
    type: 'string',
  },
  {
    key: 'plotType',
    name: strings.PLOT_TYPE,
    type: 'string',
  },
  {
    key: 'latestObservationCompletedTime',
    name: strings.LAST_OBSERVED,
    type: 'string',
  },
];

export default function PlantingSiteSubzoneView(): JSX.Element {
  const [search, setSearch] = useState<string>('');
  const navigate = useSyncNavigate();
  const defaultTimeZone = useDefaultTimeZone();

  const params = useParams<{
    zoneId: string;
    subzoneId: string;
  }>();

  const zoneId = Number(params.zoneId);
  const subzoneId = Number(params.subzoneId);

  const { plantingSite, isLoading } = usePlantingSiteData();

  const timeZone = useMemo(() => {
    return plantingSite?.timeZone ?? defaultTimeZone.get().id;
  }, [defaultTimeZone, plantingSite]);

  const plantingZone = useMemo(() => {
    return plantingSite?.plantingZones?.find((zone) => zone.id === zoneId);
  }, [plantingSite, zoneId]);

  const plantingSubzone = useMemo(() => {
    return plantingZone?.plantingSubzones?.find((subzone) => subzone.id === subzoneId);
  }, [plantingSite, subzoneId]);

  const searchProps = useMemo<SearchProps>(
    () => ({
      search,
      onSearch: (value: string) => setSearch(value),
    }),
    [search]
  );

  useEffect(() => {
    if (isLoading) {
      return;
    }

    if (!plantingSite) {
      navigate(APP_PATHS.PLANTING_SITES);
    } else if (!plantingZone) {
      navigate(APP_PATHS.PLANTING_SITES_VIEW.replace(':plantingSiteId', plantingSite.id.toString()));
    } else if (!plantingSubzone) {
      navigate(
        APP_PATHS.PLANTING_SITES_ZONE_VIEW.replace(':plantingSiteId', plantingSite.id.toString()).replace(
          ':zoneId',
          plantingZone.id.toString()
        )
      );
    }
  }, [isLoading, plantingSite, plantingZone, plantingSubzone]);

  const crumbs: Crumb[] = useMemo(
    () => [
      {
        name: strings.PLANTING_SITES,
        to: APP_PATHS.PLANTING_SITES,
      },
      {
        name: plantingSite?.name ?? '',
        to: `/${plantingSite?.id}`,
      },
      {
        name: plantingZone?.name ?? '',
        to: `/zone/${plantingZone?.id}`,
      },
    ],
    [plantingSite, plantingZone]
  );

  return (
    <Page crumbs={crumbs} title={plantingSubzone?.fullName ?? ''}>
      <Card flushMobile style={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
        <Search {...searchProps} />
        <Box>
          <Table
            id='planting-site-subzone-details-table'
            columns={columns}
            rows={plantingSubzone?.monitoringPlots ?? []}
            orderBy='monitoringPlotNumber'
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
    const { column, row, value } = props;

    const textStyles = {
      fontSize: '16px',
      '& > p': {
        fontSize: '16px',
      },
    };

    // TODO: Make this into a link for the latest observation
    if (column.key === 'completedTime') {
      return (
        <CellRenderer {...props} value={value ? getDateDisplayValue(value as string, timeZone) : ''} sx={textStyles} />
      );
    }

    if (column.key === 'plotType') {
      return <CellRenderer {...props} value={row.isAdHoc ? strings.AD_HOC : strings.ASSIGNED} sx={textStyles} />;
    }

    if (column.key === 'latestObservationCompletedTime') {
      return (
        <CellRenderer {...props} value={value ? getDateDisplayValue(value as string, timeZone) : ''} sx={textStyles} />
      );
    }

    return <CellRenderer {...props} />;
  };
