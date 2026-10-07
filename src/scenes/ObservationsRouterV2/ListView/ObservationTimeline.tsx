import React, { type JSX, useCallback, useMemo } from 'react';

import { Box, useTheme } from '@mui/material';
import TimelineSliderV2, { TimelineSliderV2Mark } from '@terraware/web-components/components/TimelineSliderV2';

import { useLocalization } from 'src/providers';
import { getNumericDate } from 'src/utils/dateFormatter';

import { useObservationFilters } from '../ObservationFiltersProvider';
import ObservationsEmptyOverlay from '../ObservationsEmptyOverlay';
import { useSelectedObservation } from '../SelectedObservationProvider';
import useObservationsEmptyMessage from '../useObservationsEmptyMessage';
import { useTimelineObservations } from './useTimelineObservations';

export type ObservationTimelineProps = {
  plantingSiteId: number;
};

const ObservationTimeline = ({ plantingSiteId }: ObservationTimelineProps): JSX.Element | null => {
  const { activeLocale, strings } = useLocalization();
  const theme = useTheme();
  const { plotType } = useObservationFilters();
  const { selectAdHocPlot, selectObservation, selectedAdHocPlot, selectedObservationId } = useSelectedObservation();

  const { emptyState, observationDate, sortedObservations } = useTimelineObservations(plantingSiteId);
  const emptyMessage = useObservationsEmptyMessage(emptyState);

  const isAdHoc = plotType === 'adHoc';

  const marks = useMemo(
    (): TimelineSliderV2Mark[] =>
      sortedObservations.map((observation): TimelineSliderV2Mark => {
        const date = observationDate(observation);
        const label = getNumericDate(date, activeLocale) ?? date;
        const plotNumber = observation.adHocPlot?.monitoringPlotNumber;

        return {
          ariaLabel: isAdHoc && plotNumber !== undefined ? `${strings.PLOT} ${plotNumber}, ${label}` : label,
          color: (isAdHoc ? theme.palette.TwClrBaseOrange300 : theme.palette.TwClrBgBrand)?.toString() ?? '',
          id: `${observation.observationId}`,
          label: isAdHoc ? undefined : label,
          value: new Date(date).valueOf(),
        };
      }),
    [
      activeLocale,
      isAdHoc,
      observationDate,
      sortedObservations,
      strings.PLOT,
      theme.palette.TwClrBaseOrange300,
      theme.palette.TwClrBgBrand,
    ]
  );

  const selectedMarkId = useMemo(() => {
    if (isAdHoc) {
      return selectedAdHocPlot ? `${selectedAdHocPlot.observationId}` : undefined;
    }
    return selectedObservationId !== undefined ? `${selectedObservationId}` : undefined;
  }, [isAdHoc, selectedAdHocPlot, selectedObservationId]);

  const onSelect = useCallback(
    (markId: string) => {
      const observation = sortedObservations.find((candidate) => `${candidate.observationId}` === markId);
      if (!observation) {
        return;
      }

      const plot = observation.adHocPlot;
      if (isAdHoc && plot) {
        selectAdHocPlot({
          monitoringPlotId: plot.monitoringPlotId,
          observationId: observation.observationId,
          plantingSiteId: observation.plantingSiteId,
        });
      } else if (!isAdHoc) {
        selectObservation(observation.observationId);
      }
    },
    [isAdHoc, selectAdHocPlot, selectObservation, sortedObservations]
  );

  if (marks.length === 0 && emptyMessage === undefined) {
    return null;
  }

  const years = sortedObservations.map((observation) => observationDate(observation).substring(0, 4));

  return (
    <Box
      sx={{
        // The slider caps its rail at 500px; the header has room for the whole width.
        '& .timeline-v2-container': { maxWidth: 'none' },
        flex: 1,
        minWidth: '240px',
        position: 'relative',
      }}
    >
      <TimelineSliderV2
        labelEnd={years[years.length - 1]}
        labelStart={years[0]}
        marks={marks}
        onSelect={onSelect}
        selectedMarkId={selectedMarkId}
      />
      {emptyMessage && <ObservationsEmptyOverlay message={emptyMessage} variant='pill' />}
    </Box>
  );
};

export default ObservationTimeline;
