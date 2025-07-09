import React, { useCallback, useEffect, useState } from 'react';

import { Box, useTheme } from '@mui/material';
import { TableColumnType } from '@terraware/web-components';
import sanitize from 'sanitize-filename';

import Table from 'src/components/common/table';
import { APP_PATHS } from 'src/constants';
import useAbandonObservation from 'src/hooks/observations/useAbandonObservation';
import { useOrgTracking } from 'src/hooks/useOrgTracking';
import { useSyncNavigate } from 'src/hooks/useSyncNavigate';
import { useLocalization, useOrganization } from 'src/providers';
import { useSpeciesData } from 'src/providers/Species/SpeciesContext';
import AdHocObservationsRenderer from 'src/scenes/ObservationsRouter/adhoc/AdHocObservationsRenderer';
import exportObservationResults from 'src/scenes/ObservationsRouter/details/exportObservationResults';
import { ObservationsService } from 'src/services';
import strings from 'src/strings';
import { Observation } from 'src/types/Observations';
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
  reload: () => void;
  selectedPlotSelection?: string;
  timeZone: string;
};

export default function OrgObservationsListView({
  reload,
  selectedPlotSelection,
  timeZone,
}: OrgObservationsListViewProps): JSX.Element {
  const { selectedOrganization } = useOrganization();
  const { activeLocale } = useLocalization();
  const theme = useTheme();
  const navigate = useSyncNavigate();
  const scheduleObservationsEnabled = isAdmin(selectedOrganization);
  const [endObservationModalOpened, setEndObservationModalOpened] = useState(false);
  const [selectedObservation, setSelectedObservation] = useState<any>();
  const snackbar = useSnackbar();
  const { species } = useSpeciesData();
  const { observations, observationResults, adHocObservationResults, reload: reloadOrgTracking } = useOrgTracking();
  const { abandon, abandonResult } = useAbandonObservation();

  useEffect(() => {
    if (abandonResult?.status === 'success' && selectedObservation?.completedTime) {
      snackbar.toastSuccess(
        strings.formatString(
          strings.OBSERVATION_ENDED_MESSAGE,
          getShortDate(selectedObservation.observationDate, activeLocale),
          strings.OBSERVATION_ENDED
        )
      );
      setSelectedObservation(undefined);
      reload();
      reloadOrgTracking();
    }
    if (abandonResult?.status === 'error') {
      snackbar.toastError();
      setSelectedObservation(undefined);
    }
  }, [abandonResult?.status, activeLocale, reload, reloadOrgTracking, selectedObservation, snackbar]);

  const columns = useCallback((): TableColumnType[] => {
    if (!activeLocale) {
      return [];
    }

    return [...defaultColumns(), ...(scheduleObservationsEnabled ? scheduleObservationsColumn() : [])];
  }, [activeLocale, scheduleObservationsEnabled]);

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

  const onExportObservationResults = useCallback(
    (observationId: number) => {
      const observation = (observations ?? []).find((item) => item.id === observationId);
      const result = (observationResults ?? []).find((item) => item.observationId === observationId);
      if (result && observation) {
        void exportObservationResults({ observation, result, species, timeZone });
      }
    },
    [observationResults, observations, species, timeZone]
  );

  const goToRescheduleObservation = useCallback(
    (observationId: number) => {
      navigate(APP_PATHS.RESCHEDULE_OBSERVATION.replace(':observationId', observationId.toString()));
    },
    [navigate]
  );

  const endObservation = (observation: Observation) => {
    setEndObservationModalOpened(true);
    setSelectedObservation(observation);
  };

  const onCloseModal = useCallback(() => {
    setEndObservationModalOpened(false);
    setSelectedObservation(undefined);
  }, []);

  const onEndObservation = useCallback(() => {
    if (selectedObservation) {
      abandon(selectedObservation.id);
    }
  }, [abandon, selectedObservation]);

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
          rows={observationResults || []}
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
