import { useEffect, useState } from 'react';

import { Box, CircularProgress } from '@mui/material';
import { makeStyles } from '@mui/styles';
import { BusySpinner, TableColumnType } from '@terraware/web-components';
import { TopBarButton } from '@terraware/web-components/components/table';

import FormattedNumber from 'src/components/common/FormattedNumber';
import Link from 'src/components/common/Link';
import Table from 'src/components/common/table';
import CellRenderer, { TableRowType } from 'src/components/common/table/TableCellRenderer';
import { RendererProps } from 'src/components/common/table/types';
import { APP_PATHS } from 'src/constants';
import { requestUpdatePlantingsCompleted } from 'src/redux/features/plantings/plantingsAsyncThunks';
import { selectZonesHaveStatistics } from 'src/redux/features/plantings/plantingsSelectors';
import {
  searchPlantingProgress,
  selectUpdatePlantingsCompleted,
} from 'src/redux/features/plantings/plantingsSelectors';
import { useAppDispatch, useAppSelector } from 'src/redux/store';
import StatsWarningDialog from 'src/scenes/NurseryRouter/StatsWarningModal';
import strings from 'src/strings';
import { SearchNodePayload } from 'src/types/Search';
import useSnackbar from 'src/utils/useSnackbar';
import { useDefaultTimeZone } from 'src/utils/useTimeZoneUtils';

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
    key: 'projectName',
    name: strings.PROJECT,
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
    key: 'projectName',
    name: strings.PROJECT,
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
  filters: Record<string, SearchNodePayload>;
  search: string;
  reloadTracking: () => void;
};

export default function PlantingProgressList({
  filters,
  search,
  reloadTracking,
}: PlantingProgressListProps): JSX.Element {
  const [hasZones, setHasZones] = useState<boolean | undefined>();
  const classes = useStyles();
  const data = useAppSelector((state: any) => searchPlantingProgress(state, search.trim(), filters));
  const [selectedRows, setSelectedRows] = useState<any[]>([]);
  const dispatch = useAppDispatch();
  const defaultTimeZone = useDefaultTimeZone();
  const [requestId, setRequestId] = useState<string>('');
  const [selectedZoneIdsBySiteId, setSelectedZoneIdsBySiteId] = useState<Record<number, Set<number>>>();
  const updatePlantingResult = useAppSelector((state) => selectUpdatePlantingsCompleted(state, requestId));
  const subzonesStatisticsResult = useAppSelector((state) =>
    selectZonesHaveStatistics(state, selectedZoneIdsBySiteId, defaultTimeZone.get().id)
  );
  const snackbar = useSnackbar();
  const [showWarningModal, setShowWarningModal] = useState(false);
  const [markingAsComplete, setMarkingAsComplete] = useState(false);

  useEffect(() => {
    if (data && hasZones === undefined) {
      setHasZones(data.some((d) => d.subzoneName));
    }
  }, [data, hasZones]);

  useEffect(() => {
    if (selectedRows) {
      const zoneIds = selectedRows.reduce((selectedZoneIdsBySiteIdObj: Record<number, Set<number>>, row) => {
        const siteId = row.siteId;
        if (selectedZoneIdsBySiteIdObj[siteId]) {
          selectedZoneIdsBySiteIdObj[siteId].add(row.zoneId);
        } else {
          selectedZoneIdsBySiteIdObj[siteId] = new Set([row.zoneId]);
        }
        return selectedZoneIdsBySiteIdObj;
      }, {});
      setSelectedZoneIdsBySiteId(zoneIds);
    }
  }, [selectedRows]);

  useEffect(() => {
    if (updatePlantingResult?.status === 'success') {
      reloadTracking();
      setRequestId('');
      if (markingAsComplete) {
        snackbar.toastSuccess(strings.SUBZONE_PLANTING_COMPLETED_SUCCESS, strings.SAVED);
      } else {
        snackbar.toastSuccess(strings.SUBZONE_PLANTING_UNCOMPLETED_SUCCESS, strings.SAVED);
      }
    } else if (updatePlantingResult?.status === 'error') {
      snackbar.toastError(strings.GENERIC_ERROR);
      setRequestId('');
    }
  }, [updatePlantingResult, reloadTracking, snackbar, markingAsComplete]);

  if (!data || hasZones === undefined) {
    return <CircularProgress sx={{ margin: 'auto' }} />;
  }

  const onModalSubmit = () => {
    setShowWarningModal(false);
    setPlantingCompleted(false);
  };

  const validateUndoPlantingComplete = () => {
    if (subzonesStatisticsResult) {
      setShowWarningModal(true);
      return;
    }
    setPlantingCompleted(false);
  };

  const setPlantingCompleted = (complete: boolean) => {
    const subzoneIds = selectedRows.map((row) => row.subzoneId);
    const request = dispatch(
      requestUpdatePlantingsCompleted({ subzoneIds, planting: { plantingCompleted: complete } })
    );
    setMarkingAsComplete(complete);
    setRequestId(request.requestId);
  };

  const getTopBarButtons = () => {
    const topBarButtons: TopBarButton[] = [];

    if (selectedRows.length) {
      const areAllIncompleted = selectedRows.every((row) => row.plantingCompleted === false);
      const areAllCompleted = selectedRows.every((row) => row.plantingCompleted === true);

      topBarButtons.push({
        buttonType: 'passive',
        buttonText: strings.UNDO_PLANTING_COMPLETE,
        onButtonClick: () => validateUndoPlantingComplete(),
        disabled: !areAllCompleted,
      });

      topBarButtons.push({
        buttonType: 'passive',
        buttonText: strings.SET_PLANTING_COMPLETE,
        onButtonClick: () => setPlantingCompleted(true),
        disabled: !areAllIncompleted,
      });
    }
    return topBarButtons;
  };

  return (
    <Box>
      {showWarningModal && (
        <StatsWarningDialog
          open={showWarningModal}
          onClose={() => setShowWarningModal(false)}
          onSubmit={onModalSubmit}
        />
      )}
      <Box>{updatePlantingResult?.status === 'pending' && <BusySpinner withSkrim={true} />}</Box>
      <Table
        id={hasZones ? 'plantings-progress-table-with-zones' : 'plantings-progress-table-without-zones'}
        columns={hasZones ? columnsWithZones : columnsWithoutZones}
        rows={data}
        orderBy={hasZones ? 'subzoneName' : 'siteName'}
        Renderer={DetailsRenderer(classes)}
        selectedRows={selectedRows}
        setSelectedRows={setSelectedRows}
        showCheckbox={true}
        isClickable={() => false}
        showTopBar={true}
        topBarButtons={getTopBarButtons()}
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
        ? `subzoneName=${encodeURIComponent(row.subzoneName)}&siteName=${encodeURIComponent(row.siteName)}`
        : `siteName=${encodeURIComponent(row.siteName)}`;
      const url = `${APP_PATHS.NURSERY_WITHDRAWALS}?tab=withdrawal_history&${filterParam}`;
      return (
        <Link to={url}>
          <FormattedNumber value={row.totalSeedlingsSent} />
        </Link>
      );
    };

    if (column.key === 'totalSeedlingsSent') {
      return <CellRenderer {...props} value={createLinkToWithdrawals()} className={classes.text} />;
    }

    return <CellRenderer {...props} className={classes.text} />;
  };
