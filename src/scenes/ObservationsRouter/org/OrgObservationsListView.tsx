import React, { useCallback, useEffect, useMemo, useState } from 'react';

import { Box, useTheme } from '@mui/material';
import { TableColumnType } from '@terraware/web-components';
import sanitize from 'sanitize-filename';

import Table from 'src/components/common/table';
import { APP_PATHS } from 'src/constants';
import { useSyncNavigate } from 'src/hooks/useSyncNavigate';
import { useLocalization, useOrganization } from 'src/providers';
import { requestAbandonObservation } from 'src/redux/features/observations/observationsAsyncThunks';
import {
  selectAbandonObservation,
  selectPlantingSiteObservations,
} from 'src/redux/features/observations/observationsSelectors';
import { useAppDispatch, useAppSelector } from 'src/redux/store';
import AdHocObservationsRenderer from 'src/scenes/ObservationsRouter/adhoc/AdHocObservationsRenderer';
import exportObservationResults from 'src/scenes/ObservationsRouter/details/exportObservationResults';
import { ObservationsService } from 'src/services';
import strings from 'src/strings';
import {
  AdHocObservationResults,
  Observation,
  ObservationResults,
  ObservationStratumResults,
} from 'src/types/Observations';
import { getShortDate } from 'src/utils/dateFormatter';
import { isAdmin } from 'src/utils/organization';
import useSnackbar from 'src/utils/useSnackbar';

import EndObservationModal from './EndObservationModal';
import OrgObservationsRenderer from './OrgObservationsRenderer';

const scheduleObservationsColumn = (): TableColumnType[] => [
  {
    key: 'actionsMenu',
    name: '',
    type: 'string',
  },
];

export type OrgObservationsListViewProps = {
  plantingSiteId: number;
  observationsResults?: ObservationResults[];
  adHocObservationResults?: AdHocObservationResults[];
  reload: () => void;
  selectedPlotSelection?: string;
  timeZone: string;
};

export default function OrgObservationsListView({
  observationsResults,
  adHocObservationResults,
  plantingSiteId,
  reload,
  selectedPlotSelection,
  timeZone,
}: OrgObservationsListViewProps): JSX.Element {
  const { selectedOrganization } = useOrganization();
  const { activeLocale } = useLocalization();
  const [results, setResults] = useState<any>([]);
  const theme = useTheme();
  const navigate = useSyncNavigate();
  const scheduleObservationsEnabled = isAdmin(selectedOrganization);
  const [endObservationModalOpened, setEndObservationModalOpened] = useState(false);
  const [selectedObservation, setSelectedObservation] = useState<any>();
  const dispatch = useAppDispatch();
  const [requestId, setRequestId] = useState('');
  const abandonObservationResponse = useAppSelector((state) => selectAbandonObservation(state, requestId));
  const snackbar = useSnackbar();

  const defaultColumns = useMemo(
    () =>
      [
        {
          key: 'observationDate',
          name: strings.DATE,
          type: 'string',
        },
        {
          key: 'state',
          name: strings.STATUS,
          type: 'string',
        },
        {
          key: 'plantingSiteName',
          name: strings.PLANTING_SITE,
          type: 'string',
        },
        {
          key: 'plantingZones',
          name: strings.ZONES,
          type: 'string',
        },
        {
          key: 'totalLive',
          name: strings.LIVE_PLANTS,
          tooltipTitle: strings.TOOLTIP_LIVE_PLANTS,
          type: 'number',
        },
        {
          key: 'totalPlants',
          name: strings.TOTAL_PLANTS,
          tooltipTitle: strings.TOOLTIP_TOTAL_PLANTS,
          type: 'number',
        },
        {
          key: 'totalSpecies',
          name: strings.SPECIES,
          type: 'number',
        },
        {
          key: 'plantingDensity',
          name: strings.PLANT_DENSITY,
          type: 'number',
        },
        {
          key: 'survivalRate',
          name: strings.SURVIVAL_RATE,
          tooltipTitle: strings.SURVIVAL_RATE_COLUMN_TOOLTIP,
          type: 'number',
        },
        {
          key: 'completedDate',
          name: strings.DATE_OBSERVED,
          type: 'date',
          tooltipTitle: strings.DATE_OBSERVED_TOOLTIP,
        },
      ] as TableColumnType[],
    []
  );

  useEffect(() => {
    if (abandonObservationResponse?.status === 'success' && selectedObservation) {
      snackbar.toastSuccess(
        strings.formatString(
          strings.OBSERVATION_ENDED_MESSAGE,
          getShortDate(selectedObservation.observationDate, activeLocale),
          strings.OBSERVATION_ENDED
        )
      );
      setSelectedObservation(undefined);
      reload();
    }
    if (abandonObservationResponse?.status === 'error') {
      snackbar.toastError();
      setSelectedObservation(undefined);
    }
  }, [abandonObservationResponse, activeLocale, reload, selectedObservation, snackbar]);

  const observations: Observation[] | undefined = useAppSelector((state) =>
    selectPlantingSiteObservations(state, plantingSiteId)
  );

  const columns = useCallback((): TableColumnType[] => {
    if (!activeLocale) {
      return [];
    }

    return [...defaultColumns, ...(scheduleObservationsEnabled ? scheduleObservationsColumn() : [])];
  }, [activeLocale, defaultColumns, scheduleObservationsEnabled]);

  const adHocColumns = useCallback((): TableColumnType[] => {
    if (!activeLocale) {
      return [];
    }
    return [
      {
        key: 'plotNumber',
        name: strings.PLOT,
        type: 'string',
      },
      {
        key: 'plantingSiteName',
        name: strings.PLANTING_SITE,
        type: 'string',
      },
      {
        key: 'observationDate',
        name: strings.DATE,
        type: 'string',
      },
      {
        key: 'totalLive',
        name: strings.LIVE_PLANTS,
        tooltipTitle: strings.TOOLTIP_LIVE_PLANTS_ADHOC,
        type: 'number',
      },
      {
        key: 'totalPlants',
        name: strings.TOTAL_PLANTS,
        tooltipTitle: strings.TOOLTIP_TOTAL_PLANTS_ADHOC,
        type: 'number',
      },
      {
        key: 'totalSpecies',
        name: strings.SPECIES,
        type: 'number',
      },
    ];
  }, [activeLocale]);

  const exportObservation = useCallback(
    async (observationId: number, gpxOrCsv: 'gpx' | 'csv') => {
      const observation = (observations ?? []).find((item) => item.id === observationId);

      if (observation !== undefined) {
        const content =
          gpxOrCsv === 'csv'
            ? await ObservationsService.exportCsv(observation.id)
            : await ObservationsService.exportGpx(observation.id);

        if (content !== null) {
          const sanitizedSiteName = sanitize(observation.plantingSiteName);
          const fileName = `${sanitizedSiteName}-${observation.startDate}.${gpxOrCsv}`;

          const mimeType = gpxOrCsv === 'csv' ? 'text/csv' : 'application/gpx+xml';
          const encodedUri = `data:${mimeType};charset=utf-8,` + encodeURIComponent(content);

          const link = document.createElement('a');
          link.setAttribute('href', encodedUri);
          link.setAttribute('download', fileName);
          link.click();
        }
      }
    },
    [observations]
  );

  const onExportObservationResults = useCallback(
    (observationId: number) => {
      const observation = (observationsResults ?? []).find((item) => item.observationId === observationId);
      if (observation !== undefined) {
        void exportObservationResults({ observationResults: observation });
      }
    },
    [observationsResults]
  );

  const goToRescheduleObservation = useCallback(
    (observationId: number) => {
      navigate(APP_PATHS.RESCHEDULE_OBSERVATION.replace(':observationId', observationId.toString()));
    },
    [navigate]
  );

  const endDates = useMemo<Record<number, string>>(
    () =>
      (observations ?? []).reduce(
        (acc, observation) => {
          acc[observation.id] = observation.endDate;
          return acc;
        },
        {} as Record<number, string>
      ),
    [observations]
  );

  useEffect(() => {
    setResults(
      (observationsResults ?? []).map((observation: ObservationResults) => {
        return {
          ...observation,
          plantingZones: observation.strata.map((zone: ObservationStratumResults) => zone.stratumName).join('\r'),
          endDate: endDates[observation.observationId] ?? '',
          observationDate: observation.completedDate || observation.startDate,
        };
      })
    );
  }, [endDates, observationsResults]);

  const endObservation = (observation: Observation) => {
    setEndObservationModalOpened(true);
    setSelectedObservation(observation);
  };

  const onCloseModal = useCallback(() => {
    setEndObservationModalOpened(false);
    setSelectedObservation(undefined);
  }, [setEndObservationModalOpened, setSelectedObservation]);

  const onEndObservation = useCallback(() => {
    if (selectedObservation) {
      const request = dispatch(requestAbandonObservation({ observationId: selectedObservation.observationId }));
      setRequestId(request.requestId);
      setEndObservationModalOpened(false);
    }
  }, [dispatch, selectedObservation, setEndObservationModalOpened, setRequestId]);

  return (
    <Box>
      {endObservationModalOpened && selectedObservation && (
        <EndObservationModal observation={selectedObservation} onClose={onCloseModal} onSave={onEndObservation} />
      )}
      {selectedPlotSelection === 'adHoc' && (
        <Table
          id='org-ad-hoc-observations-table'
          columns={adHocColumns}
          rows={adHocObservationResults || []}
          orderBy='observationDate'
          Renderer={AdHocObservationsRenderer(timeZone)}
        />
      )}
      {(!selectedPlotSelection || selectedPlotSelection === 'assigned') && (
        <Table
          id='org-observations-table'
          columns={columns}
          rows={results}
          orderBy='observationDate'
          Renderer={OrgObservationsRenderer(
            theme,
            activeLocale,
            goToRescheduleObservation,
            (observationId: number) => void exportObservation(observationId, 'csv'),
            (observationId: number) => void exportObservation(observationId, 'gpx'),
            (observationId: number) => onExportObservationResults(observationId),
            (observation: any) => {
              endObservation(observation);
            }
          )}
        />
      )}
    </Box>
  );
}
