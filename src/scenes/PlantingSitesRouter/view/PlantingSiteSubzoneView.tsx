import React, { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { Box } from '@mui/material';
import { makeStyles } from '@mui/styles';
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
import { searchPlantingSiteMonitoringPlots } from 'src/redux/features/observations/plantingSiteDetailsSelectors';
import { selectPlantingSite } from 'src/redux/features/tracking/trackingSelectors';
import { useAppSelector } from 'src/redux/store';
import strings from 'src/strings';
import { useDefaultTimeZone } from 'src/utils/useTimeZoneUtils';

const useStyles = makeStyles(() => ({
  text: {
    fontSize: '14px',
    '& > p': {
      fontSize: '14px',
    },
  },
}));

const columns = (): TableColumnType[] => [
  {
    key: 'monitoringPlotName',
    name: strings.MONITORING_PLOT,
    type: 'string',
  },
  {
    key: 'isPermanent',
    name: strings.PLOT_TYPE,
    type: 'string',
  },
  {
    key: 'completedTime',
    name: strings.LAST_OBSERVED,
    type: 'string',
  },
];

export default function PlantingSiteZoneView(): JSX.Element {
  const [search, setSearch] = useState<string>('');
  const classes = useStyles();
  const navigate = useNavigate();
  const defaultTimeZone = useDefaultTimeZone();

  const { plantingSiteId, zoneId, subzoneId } = useParams<{
    plantingSiteId: string;
    zoneId: string;
    subzoneId: string;
  }>();

  const plantingSite = useAppSelector((state) => selectPlantingSite(state, Number(plantingSiteId)));
  const plantingZone = useAppSelector((state) =>
    searchPlantingSiteMonitoringPlots(state, Number(plantingSiteId), Number(zoneId), Number(subzoneId), search.trim())
  );

  const timeZone = plantingSite?.timeZone ?? defaultTimeZone.get().id;

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

  if (plantingSiteId && !plantingZone) {
    navigate(APP_PATHS.PLANTING_SITES_VIEW.replace(':plantingSiteId', plantingSiteId));
  }

  if (zoneId && plantingSiteId && !plantingZone?.plantingSubzones.length) {
    navigate(APP_PATHS.PLANTING_SITES_ZONE_VIEW.replace(':plantingSiteId', plantingSiteId).replace(':zoneId', zoneId));
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
      {
        name: plantingZone?.name ?? '',
        to: `/zone/${zoneId}`,
      },
    ],
    [plantingSiteId, zoneId, plantingSite?.name, plantingZone?.name]
  );

  return (
    <Page crumbs={crumbs} title={plantingZone?.plantingSubzones[0]?.fullName ?? ''}>
      <Card flushMobile style={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
        <Search {...searchProps} />
        <Box>
          <Table
            id='planting-site-subzone-details-table'
            columns={columns}
            rows={plantingZone?.plantingSubzones[0]?.monitoringPlots ?? []}
            orderBy='monitoringPlotName'
            Renderer={DetailsRenderer(classes, timeZone)}
          />
        </Box>
      </Card>
    </Page>
  );
}

const DetailsRenderer =
  (classes: any, timeZone: string) =>
  // eslint-disable-next-line react/display-name
  (props: RendererProps<TableRowType>): JSX.Element => {
    const { column, row, value } = props;

    if (column.key === 'completedTime') {
      return (
        <CellRenderer
          {...props}
          value={value ? getDateDisplayValue(value as string, timeZone) : ''}
          className={classes.text}
        />
      );
    }

    if (column.key === 'isPermanent') {
      return (
        <CellRenderer
          {...props}
          value={row.isPermanent ? strings.PERMANENT : strings.TEMPORARY}
          className={classes.text}
        />
      );
    }

    return <CellRenderer {...props} />;
  };
