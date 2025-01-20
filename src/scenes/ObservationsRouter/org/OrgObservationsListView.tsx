import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { Box, useTheme } from '@mui/material';
import { TableColumnType } from '@terraware/web-components';
import sanitize from 'sanitize-filename';

import Table from 'src/components/common/table';
import { APP_PATHS } from 'src/constants';
import { useLocalization, useOrganization } from 'src/providers';
import { requestAbandonObservation } from 'src/redux/features/observations/observationsAsyncThunks';
import {
  selectAbandonObservation,
  selectPlantingSiteObservations,
} from 'src/redux/features/observations/observationsSelectors';
import { useAppDispatch, useAppSelector } from 'src/redux/store';
import { ObservationsService } from 'src/services';
import strings from 'src/strings';
import {
  AdHocObservationResults,
  Observation,
  ObservationPlantingZoneResults,
  ObservationResults,
} from 'src/types/Observations';
import { getShortDate } from 'src/utils/dateFormatter';
import { isAdmin } from 'src/utils/organization';
import useSnackbar from 'src/utils/useSnackbar';

import EndObservationModal from './EndObservationModal';
import OrgObservationsRenderer from './OrgObservationsRenderer';

const defaultColumns = (): TableColumnType[] => [
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
    key: 'totalPlants',
    name: strings.PLANTS,
    type: 'number',
  },
  {
    key: 'totalSpecies',
    name: strings.SPECIES,
    type: 'number',
  },
  {
    key: 'plantingDensity',
    name: strings.PLANTING_DENSITY,
    type: 'number',
  },
  {
    key: 'mortalityRate',
    name: strings.MORTALITY_RATE,
    type: 'number',
  },
  {
    key: 'endDate',
    name: strings.END_DATE,
    type: 'date',
  },
];

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
  adHocObservationsResults?: AdHocObservationResults[];
  reload: () => void;
  selectedPlotSelection: string;
};

export default function OrgObservationsListView({
  observationsResults,
  adHocObservationsResults,
  plantingSiteId,
  reload,
  selectedPlotSelection,
}: OrgObservationsListViewProps): JSX.Element {
  const { selectedOrganization } = useOrganization();
  const { activeLocale } = useLocalization();
  const [results, setResults] = useState<any>([]);
  const theme = useTheme();
  const navigate = useNavigate();
  const scheduleObservationsEnabled = isAdmin(selectedOrganization);
  const [endObservationModalOpened, setEndObservationModalOpened] = useState(false);
  const [selectedObservation, setSelectedObservation] = useState<any>();
  const dispatch = useAppDispatch();
  const [requestId, setRequestId] = useState('');
  const abandonObservationResponse = useAppSelector((state) => selectAbandonObservation(state, requestId));
  const snackbar = useSnackbar();

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
  }, [abandonObservationResponse]);

  const observations: Observation[] | undefined = useAppSelector((state) =>
    selectPlantingSiteObservations(state, plantingSiteId)
  );

  const columns = useCallback((): TableColumnType[] => {
    if (!activeLocale) {
      return [];
    }

    return [...defaultColumns(), ...(scheduleObservationsEnabled ? scheduleObservationsColumn() : [])];
  }, [activeLocale, scheduleObservationsEnabled]);

  const adHocColumns = useCallback((): TableColumnType[] => {
    return [
      {
        key: 'plotName',
        name: strings.PLOT,
        type: 'string',
      },
      {
        key: 'plantingSiteName',
        name: strings.PLANTING_SITE,
        type: 'string',
      },
      {
        key: 'startDate',
        name: strings.DATE,
        type: 'date',
      },
      {
        key: 'totalPlants',
        name: strings.PLANTS,
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
          plantingZones: observation.plantingZones
            .map((zone: ObservationPlantingZoneResults) => zone.plantingZoneName)
            .join('\r'),
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

  const onCloseModal = () => {
    setEndObservationModalOpened(false);
    setSelectedObservation(undefined);
  };

  const onEndObservation = () => {
    if (selectedObservation) {
      const request = dispatch(requestAbandonObservation({ observationId: selectedObservation.observationId }));
      setRequestId(request.requestId);
      setEndObservationModalOpened(false);
    }
  };

  return (
    <Box>
      {endObservationModalOpened && selectedObservation && (
        <EndObservationModal observation={selectedObservation} onClose={onCloseModal} onSave={onEndObservation} />
      )}
      {selectedPlotSelection === 'adHoc' ? (
        <Table
          id='org-ad-hoc-observations-table'
          columns={adHocColumns}
          rows={adHocObservationsResults || []}
          orderBy='completedDate'
        />
      ) : (
        <Table
          id='org-observations-table'
          columns={columns}
          rows={results}
          orderBy='completedDate'
          Renderer={OrgObservationsRenderer(
            theme,
            activeLocale,
            goToRescheduleObservation,
            (observationId: number) => exportObservation(observationId, 'csv'),
            (observationId: number) => exportObservation(observationId, 'gpx'),
            (observation: any) => {
              endObservation(observation);
            }
          )}
        />
      )}
    </Box>
  );
}
