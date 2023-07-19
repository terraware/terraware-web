import { useEffect, useState } from 'react';
import { makeStyles } from '@mui/styles';
import { Box, CircularProgress } from '@mui/material';
import { TableColumnType } from '@terraware/web-components';
import strings from 'src/strings';
import { APP_PATHS } from 'src/constants';
import { useAppSelector } from 'src/redux/store';
import { searchPlantingProgress } from 'src/redux/features/plantings/plantingsSelectors';
import CellRenderer, { TableRowType } from 'src/components/common/table/TableCellRenderer';
import { RendererProps } from 'src/components/common/table/types';
import Table from 'src/components/common/table';
import Link from 'src/components/common/Link';

const useStyles = makeStyles(() => ({
  text: {
    fontSize: '14px',
    '& > p': {
      fontSize: '14px',
    },
  },
}));

const columnsWithoutZones = (): TableColumnType[] => [
  {
    key: 'siteName',
    name: strings.PLANTING_SITE,
    type: 'string',
  },
  {
    key: 'totalSeedlingsSent',
    name: strings.TOTAL_SEEDLINGS_SENT,
    type: 'number',
  },
];

const columnsWithZones = (): TableColumnType[] => [
  {
    key: 'subzoneName',
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
    key: 'siteName',
    name: strings.PLANTING_SITE,
    type: 'string',
  },
  {
    key: 'zoneName',
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
    key: 'totalSeedlingsSent',
    name: strings.TOTAL_SEEDLINGS_SENT,
    type: 'number',
  },
];

export type PlantingProgressListProps = {
  search: string;
  plantingCompleted?: boolean;
};

export default function PlantingProgressList({ search, plantingCompleted }: PlantingProgressListProps): JSX.Element {
  const [hasZones, setHasZones] = useState<boolean | undefined>();
  const classes = useStyles();
  const data = useAppSelector((state: any) => searchPlantingProgress(state, search.trim(), plantingCompleted));

  useEffect(() => {
    if (data && hasZones === undefined) {
      setHasZones(data.some((d) => d.subzoneName));
    }
  }, [data, hasZones]);

  if (!data || hasZones === undefined) {
    return <CircularProgress sx={{ margin: 'auto' }} />;
  }

  return (
    <Box>
      <Table
        id={hasZones ? 'plantings-progress-table-with-zones' : 'plantings-progress-table-without-zones'}
        columns={hasZones ? columnsWithZones : columnsWithoutZones}
        rows={data}
        orderBy={hasZones ? 'subzoneName' : 'siteName'}
        Renderer={DetailsRenderer(classes)}
      />
    </Box>
  );
}

const DetailsRenderer =
  (classes: any) =>
  (props: RendererProps<TableRowType>): JSX.Element => {
    const { column, row } = props;

    const createLinkToWithdrawals = () => {
      const filterParam = row.subzoneName
        ? `subzoneName=${encodeURIComponent(row.subzoneName)}`
        : `siteName=${encodeURIComponent(row.siteName)}`;
      const url = `${APP_PATHS.NURSERY_WITHDRAWALS}?tab=${strings.WITHDRAWAL_HISTORY}&${filterParam}`;
      return <Link to={url}>{row.totalSeedlingsSent as React.ReactNode}</Link>;
    };

    if (column.key === 'totalSeedlingsSent') {
      return <CellRenderer {...props} value={createLinkToWithdrawals()} className={classes.text} />;
    }

    return <CellRenderer {...props} className={classes.text} />;
  };
