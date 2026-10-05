import React, { useCallback, useEffect, useMemo, useState } from 'react';

import { Box, CircularProgress, Typography, useTheme } from '@mui/material';
import MuxPlayer from '@mux/mux-player-react';
import { DialogBox, ViewPhotosDialog } from '@terraware/web-components';

import EventLogView from 'src/components/common/EventLog';
import Link from 'src/components/common/Link';
import { API_PATHS } from 'src/constants';
import { useGetOneObservationResults } from 'src/hooks/observations';
import { useOrganizationSpecies } from 'src/hooks/useOrganizationSpecies';
import { useLocalization, useOrganization } from 'src/providers';
import {
  EventLogEntryPayload,
  MonitoringSpeciesSubjectPayload,
  ObservationPlotMediaSubjectPayload,
} from 'src/queries/generated/events';
import { useGetObservationMediaStreamQuery } from 'src/queries/generated/observations';
import { ListObservationEventsArgs, useLazyListObservationEventsQuery } from 'src/queries/observations/observations';

import { getMonitoringSpeciesKey, summarizeMonitoringSpeciesEvents } from './monitoringSpeciesEvents';

type EventLogProps = {
  observationId: number;
  plotId: number;
  isBiomass?: boolean;
};
const EventLog = ({ observationId, plotId, isBiomass }: EventLogProps) => {
  const { selectedOrganization } = useOrganization();
  const { strings } = useLocalization();
  const { species } = useOrganizationSpecies();
  const [openedMedia, setOpenedMedia] = useState<ObservationPlotMediaSubjectPayload>();
  const closeViewer = useCallback(() => setOpenedMedia(undefined), []);

  useEffect(() => {
    if (openedMedia?.mediaKind !== 'Video') {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        closeViewer();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [closeViewer, openedMedia?.mediaKind]);

  const { data: observationResultsResponse } = useGetOneObservationResults({ observationId });
  const [list, { data: events, isLoading }] = useLazyListObservationEventsQuery();
  const deletedVideoIds = useMemo(
    () =>
      new Set(
        (events ?? []).flatMap((event) =>
          event.action.type === 'Deleted' &&
          event.subject.type === 'ObservationPlotMedia' &&
          event.subject.mediaKind === 'Video'
            ? [event.subject.fileId]
            : []
        )
      ),
    [events]
  );

  const isOpenedVideoDeleted = openedMedia?.mediaKind === 'Video' && deletedVideoIds.has(openedMedia.fileId);

  const {
    currentData: mediaStream,
    error: mediaStreamError,
    isFetching: isStreamLoading,
  } = useGetObservationMediaStreamQuery(
    {
      observationId: openedMedia?.observationId ?? observationId,
      plotId: openedMedia?.monitoringPlotId ?? plotId,
      fileId: openedMedia?.fileId ?? -1,
    },
    { skip: openedMedia?.mediaKind !== 'Video' || isOpenedVideoDeleted, refetchOnMountOrArgChange: true }
  );
  const photoUrl =
    openedMedia?.mediaKind === 'Photo'
      ? API_PATHS.OBSERVATION_PLOT_PHOTO.replace('{observationId}', openedMedia.observationId.toString())
          .replace('{monitoringPlotId}', openedMedia.monitoringPlotId.toString())
          .replace('{fileId}', openedMedia.fileId.toString())
      : undefined;

  const MangroveFields = useMemo(
    () => ['pH', 'salinity (ppt)', 'tide', 'tide measurement time', 'water depth (cm)'],
    []
  );

  const theme = useTheme();
  const getSpeciesName = useCallback(
    (speciesId?: number) => {
      if (speciesId) {
        const found = species.find((sp) => sp.id.toString() === speciesId.toString());
        return found?.scientificName || '';
      }
    },
    [species]
  );

  useEffect(() => {
    const listEventLogPayload: ListObservationEventsArgs = {
      monitoringPlotId: plotId,
      observationId,
      isBiomass: !!isBiomass,
      organizationId: selectedOrganization?.id || -1,
    };

    if (selectedOrganization) {
      void list(listEventLogPayload);
    }
  }, [isBiomass, list, observationId, plotId, selectedOrganization]);

  const resolveSpeciesName = useCallback(
    // A row with neither a name nor an id is the plot's unknown species, which is how the plant
    // count table labels it too. `shortText` is just the word "Species", so it is no help here.
    (subject: MonitoringSpeciesSubjectPayload) =>
      subject.scientificName || getSpeciesName(subject.speciesId) || strings.UNKNOWN,
    [getSpeciesName, strings.UNKNOWN]
  );

  // Replaying the log needs a starting point, so the plot's species are read as they stand now.
  const monitoringPlot = useMemo(() => {
    const results = observationResultsResponse?.observation;
    return results?.isAdHoc
      ? results.adHocPlot
      : results?.strata
          .flatMap((stratum) => stratum.substrata)
          ?.flatMap((substratum) => substratum?.monitoringPlots)
          .find((plot) => plot.monitoringPlotId === plotId);
  }, [observationResultsResponse?.observation, plotId]);

  const currentSpeciesTotals = useMemo(() => {
    const totals = new Map<string, number>();
    [...(monitoringPlot?.species ?? []), ...(monitoringPlot?.unknownSpecies ? [monitoringPlot.unknownSpecies] : [])]
      // A species the plot no longer records is simply absent, which counts as zero.
      .forEach((plotSpecies) =>
        totals.set(
          getMonitoringSpeciesKey(plotSpecies.speciesId, plotSpecies.speciesName),
          (plotSpecies.totalExisting ?? 0) + (plotSpecies.totalLive ?? 0) + (plotSpecies.totalDead ?? 0)
        )
      );
    return totals;
  }, [monitoringPlot]);

  const { summaries: speciesSummaries, redundant: redundantSpeciesEntries } = useMemo(
    () => summarizeMonitoringSpeciesEvents(events, resolveSpeciesName, currentSpeciesTotals),
    [currentSpeciesTotals, events, resolveSpeciesName]
  );

  const filterEvent = useCallback(
    (event: EventLogEntryPayload) =>
      !(
        event.action.type === 'FieldUpdated' &&
        MangroveFields.includes(event.action.fieldName) &&
        !event.action.changedTo
      ) &&
      !(
        event.action.type === 'Created' &&
        (event.subject.type !== 'ObservationPlotMedia' || event.subject.isOriginal)
      ) &&
      // The other count entries of an add, remove or species change are covered by its one message.
      !redundantSpeciesEntries.has(event),
    [MangroveFields, redundantSpeciesEntries]
  );

  const renderSpeciesSummary = useCallback(
    (event: EventLogEntryPayload) => {
      const summary = speciesSummaries.get(event);
      if (!summary) {
        return undefined;
      }
      // The API names each count in lower case ("live count"), so only the first letter is raised,
      // which keeps names that are more than one word readable in every language.
      const counts = summary.counts
        .map(({ label, value }) =>
          strings.formatString(strings.EVENT_SPECIES_COUNT, label.charAt(0).toUpperCase() + label.slice(1), value)
        )
        .join(strings.LIST_SEPARATOR);

      if (summary.kind === 'changed') {
        return strings.formatString(strings.EVENT_SPECIES_CHANGED, summary.speciesName, summary.toSpeciesName, counts);
      }
      return strings.formatString(
        summary.kind === 'added' ? strings.EVENT_SPECIES_ADDED : strings.EVENT_SPECIES_REMOVED,
        summary.speciesName,
        counts
      );
    },
    [speciesSummaries, strings]
  );

  const renderEventDescription = useCallback(
    (event: EventLogEntryPayload) => (
      <Box>
        {event.action.type === 'FieldUpdated' && (
          <Box>
            {renderSpeciesSummary(event) ??
              (event.subject.type === 'BiomassSpecies' ||
              event.subject.type === 'BiomassQuadratSpecies' ||
              event.subject.type === 'MonitoringSpecies'
                ? strings.formatString(
                    strings.SPECIES_VALUE_CHANGED_FROM_TO,
                    <Typography display='inline' textTransform='capitalize'>
                      {event.subject.scientificName || getSpeciesName(event.subject.speciesId)}
                    </Typography>,
                    <Typography display='inline' textTransform='capitalize'>
                      {event.action.fieldName}
                    </Typography>,
                    <Typography display='inline' color={theme.palette.TwClrTxtWarning} fontWeight={600}>
                      {event.action.changedFrom?.toString() || strings.NONE}
                    </Typography>,
                    <Typography display='inline' color={theme.palette.TwClrTxtSuccess} fontWeight={600}>
                      {event.action.changedTo?.toString() || strings.NONE}
                    </Typography>
                  )
                : strings.formatString(
                    strings.VALUE_CHANGED_FROM_TO,
                    <Typography display='inline' textTransform='capitalize'>
                      {event.subject.type === 'ObservationPlotMedia'
                        ? `${event.subject.fileId} ${event.subject.mediaKind} ${event.action.fieldName}`
                        : event.action.fieldName}
                    </Typography>,
                    <Typography display='inline' color={theme.palette.TwClrTxtWarning} fontWeight={600}>
                      {event.action.changedFrom?.toString() || strings.NONE}
                    </Typography>,
                    <Typography display='inline' color={theme.palette.TwClrTxtSuccess} fontWeight={600}>
                      {event.action.changedTo?.toString() || strings.NONE}
                    </Typography>
                  ))}
          </Box>
        )}
        {event.action.type === 'Created' && (
          <Box>
            {event.subject.type === 'ObservationPlotMedia' ? (
              <Link
                fontSize='16px'
                onClick={() => {
                  if (event.subject.type === 'ObservationPlotMedia') {
                    setOpenedMedia(event.subject);
                  }
                }}
              >
                {strings.formatString(strings.EVENT_ADDED, event.subject.fullText)}
              </Link>
            ) : (
              strings.formatString(strings.EVENT_CREATED, event.subject.fullText)
            )}
          </Box>
        )}
        {event.action.type === 'Deleted' && (
          <Box>{strings.formatString(strings.EVENT_DELETED, event.subject.fullText)}</Box>
        )}
      </Box>
    ),
    [getSpeciesName, renderSpeciesSummary, strings, theme.palette.TwClrTxtSuccess, theme.palette.TwClrTxtWarning]
  );

  return (
    <>
      {photoUrl && (
        <ViewPhotosDialog
          initialSelectedSlide={0}
          onClose={closeViewer}
          open
          photos={[{ url: photoUrl }]}
          title={strings.PHOTOS}
        />
      )}
      {openedMedia?.mediaKind === 'Video' && (
        <DialogBox open onClose={closeViewer} title={openedMedia.fullText} size='large' scrolled>
          <Box display='flex' alignItems='center' justifyContent='center' sx={{ aspectRatio: '16 / 9' }}>
            {isOpenedVideoDeleted ? (
              <Typography>{strings.VIDEO_HAS_BEEN_DELETED}</Typography>
            ) : isStreamLoading ? (
              <CircularProgress />
            ) : mediaStreamError ? (
              <Typography>
                {'status' in mediaStreamError && mediaStreamError.status === 412
                  ? strings.VIDEO_PROCESSING
                  : strings.GENERIC_ERROR}
              </Typography>
            ) : mediaStream ? (
              <MuxPlayer
                key={openedMedia.fileId}
                accentColor={theme.palette.TwClrBgBrand}
                autoPlay
                metadata={{ video_title: `Media video (File ID: ${openedMedia.fileId})` }}
                playbackId={mediaStream.playbackId}
                playbackToken={mediaStream.playbackToken}
                style={{ aspectRatio: 16 / 9, width: '100%' }}
              />
            ) : (
              <CircularProgress />
            )}
          </Box>
        </DialogBox>
      )}
      <EventLogView
        events={events}
        filterEvent={filterEvent}
        isLoading={isLoading}
        renderEventDescription={renderEventDescription}
      />
    </>
  );
};

export default EventLog;
