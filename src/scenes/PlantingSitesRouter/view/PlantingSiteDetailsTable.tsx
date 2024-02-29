import { makeStyles } from '@mui/styles';
import { Box } from '@mui/material';
import { TableColumnType } from '@terraware/web-components';
import getDateDisplayValue from '@terraware/web-components/utils/date';
import strings from 'src/strings';
import { SubzoneAggregation, ZoneAggregation } from 'src/types/Observations';
import { MinimalPlantingSite } from 'src/types/Tracking';
import CellRenderer, { TableRowType } from 'src/components/common/table/TableCellRenderer';
import { RendererProps } from 'src/components/common/table/types';
import Link from 'src/components/common/Link';
import Table from 'src/components/common/table';
import { useDefaultTimeZone } from 'src/utils/useTimeZoneUtils';

/**
 * Planting site list view
 */

type PlantingSiteDetailsTableProps = {
  data: ZoneAggregation[];
  plantingSite: MinimalPlantingSite;
  zoneViewUrl: string;
};

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
    key: 'name',
    name: strings.ZONES,
    type: 'string',
  },
  {
    key: 'targetPlantingDensity',
    name: strings.TARGET_PLANTING_DENSITY,
    tooltipTitle: strings.TARGET_PLANTING_DENSITY_TOOLTIP,
    type: 'number',
  },
  {
    key: 'plantingCompleted',
    name: strings.PLANTING_COMPLETE,
    tooltipTitle: strings.PLANTING_COMPLETE_TOOLTIP,
    type: 'boolean',
  },
  {
    key: 'plantingSubzones',
    name: strings.SUBZONES,
    type: 'number',
  },
  {
    key: 'monitoringPlots',
    name: strings.MONITORING_PLOTS,
    type: 'number',
  },
  {
    key: 'completedTime',
    name: strings.LAST_OBSERVED,
    type: 'string',
  },
];

export default function PlantingSiteDetailsTable({
  data,
  plantingSite,
  zoneViewUrl,
}: PlantingSiteDetailsTableProps): JSX.Element {
  const classes = useStyles();
  const defaultTimeZone = useDefaultTimeZone();

  const timeZone = plantingSite.timeZone ?? defaultTimeZone.get().id;

  return (
    <Box>
      <Table
        id='planting-site-details-table'
        columns={columns}
        rows={data}
        orderBy='name'
        Renderer={DetailsRenderer(classes, timeZone, plantingSite.id, zoneViewUrl)}
      />
    </Box>
  );
}

const DetailsRenderer =
  (classes: any, timeZone: string, plantingSiteId: number, zoneViewUrl: string) =>
  (props: RendererProps<TableRowType>): JSX.Element => {
    const { column, row, value } = props;

    const createLinkToZone = () => {
      const url = zoneViewUrl
        .replace(':plantingSiteId', plantingSiteId.toString())
        .replace(':zoneId', row.id.toString());
      return <Link to={url}>{(row.name || '--') as React.ReactNode}</Link>;
    };

    if (column.key === 'name') {
      return <CellRenderer {...props} value={createLinkToZone()} className={classes.text} />;
    }

    if (column.key === 'completedTime') {
      return (
        <CellRenderer
          {...props}
          value={value ? getDateDisplayValue(value as string, timeZone) : ''}
          className={classes.text}
        />
      );
    }

    if (column.key === 'monitoringPlots') {
      const numMonitoringPlots = row.plantingSubzones.flatMap((sz: SubzoneAggregation) => sz.monitoringPlots).length;
      return (
        <CellRenderer {...props} value={numMonitoringPlots > 0 ? numMonitoringPlots : ''} className={classes.text} />
      );
    }

    if (column.key === 'plantingSubzones') {
      return <CellRenderer {...props} value={row.plantingSubzones.length} className={classes.text} />;
    }

    return <CellRenderer {...props} />;
  };
