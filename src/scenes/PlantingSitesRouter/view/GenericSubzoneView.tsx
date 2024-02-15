import { useMemo, useState } from 'react';
import { makeStyles } from '@mui/styles';
import { Box } from '@mui/material';
import { useHistory, useParams } from 'react-router-dom';
import { RootState } from 'src/redux/rootReducer';
import { TableColumnType } from '@terraware/web-components';
import getDateDisplayValue from '@terraware/web-components/utils/date';
import strings from 'src/strings';
import { APP_PATHS } from 'src/constants';
import { MinimalPlantingSite } from 'src/types/Tracking';
import { ZoneAggregation } from 'src/types/Observations';
import { useDefaultTimeZone } from 'src/utils/useTimeZoneUtils';
import { useAppSelector } from 'src/redux/store';
import CellRenderer, { TableRowType } from 'src/components/common/table/TableCellRenderer';
import { RendererProps } from 'src/components/common/table/types';
import Card from 'src/components/common/Card';
import Table from 'src/components/common/table';
import Search, { SearchProps } from 'src/components/common/SearchFiltersWrapper';
import { Page, Crumb } from 'src/components/BreadCrumbs';

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

export type Props = {
  siteSelector: (state: RootState, plantingSiteId: number) => MinimalPlantingSite | undefined;
  siteViewPrefix: string;
  siteViewUrl: string;
  subzoneSelector: (
    state: RootState,
    plantingSiteId: number,
    zoneId: number,
    subzoneId: number,
    query: string
  ) => ZoneAggregation | undefined;
  zoneViewUrl: string;
};

export default function PlantingSiteZoneView({
  siteSelector,
  siteViewPrefix,
  siteViewUrl,
  subzoneSelector,
  zoneViewUrl,
}: Props): JSX.Element {
  const [search, setSearch] = useState<string>('');
  const classes = useStyles();
  const history = useHistory();
  const defaultTimeZone = useDefaultTimeZone();

  const { plantingSiteId, zoneId, subzoneId } = useParams<{
    plantingSiteId: string;
    zoneId: string;
    subzoneId: string;
  }>();

  const plantingSite = useAppSelector((state) => siteSelector(state, Number(plantingSiteId)));
  const plantingZone = useAppSelector((state) =>
    subzoneSelector(state, Number(plantingSiteId), Number(zoneId), Number(subzoneId), '')
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
    history.push(APP_PATHS.PLANTING_SITES);
  }

  if (!plantingZone) {
    history.push(siteViewUrl.replace(':plantingSiteId', plantingSiteId));
  }

  if (!plantingZone?.plantingSubzones.length) {
    history.push(zoneViewUrl.replace(':plantingSiteId', plantingSiteId).replace(':zoneId', zoneId));
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
      {
        name: plantingZone?.name ?? '',
        to: `/zone/${zoneId}`,
      },
    ],
    [plantingSite?.name, plantingSiteId, plantingZone?.name, siteViewPrefix, zoneId]
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
