import React, { useCallback, useMemo } from 'react';

import TimelineSlider from '@terraware/web-components/components/TimelineSlider';
import { getDateDisplayValue } from '@terraware/web-components/utils';

import { useLocalization } from 'src/providers';
import { ObservationResultsPayload } from 'src/queries/generated/observations';
import { getQuarter } from 'src/utils/dateUtils';

type ObservationClusterMode = 'Month' | 'Quarter' | 'Year';

type ObservationTimelineProps = {
  adHocObservationResults: ObservationResultsPayload[];
  observationResults: ObservationResultsPayload[];
  setSelectedAdHocObservationResults: ObservationResultsPayload[];
  setSelectedObservationResults: ObservationResultsPayload[];
  timezone: string;
};

const ObservationTimeline = ({
  adHocObservationResults,
  observationResults,
  timezone,
}: ObservationTimelineProps): JSX.Element => {
  const { activeLocale } = useLocalization();

  const observationDates = useMemo(() => {
    return [...adHocObservationResults, ...observationResults].map((observation) => {
      const completedDate = observation.completedTime
        ? getDateDisplayValue(observation.completedTime, timezone)
        : undefined;

      return new Date(completedDate ?? observation.startDate);
    });
  }, [adHocObservationResults, observationResults, timezone]);

  const earliestDate = useMemo(() => {
    if (observationDates.length > 1) {
      return observationDates.reduce((candidate, date) => (candidate < date ? candidate : date));
    } else if (observationDates.length === 1) {
      return observationDates[0];
    } else {
      return undefined;
    }
  }, [observationDates]);

  const latestDate = useMemo(() => {
    if (observationDates.length > 1) {
      return observationDates.reduce((candidate, date) => (candidate > date ? candidate : date));
    } else if (observationDates.length === 1) {
      return observationDates[0];
    } else {
      return undefined;
    }
  }, [observationDates]);

  const clusterMode = useMemo((): ObservationClusterMode => {
    if (!earliestDate || !latestDate) {
      return 'Month';
    }

    const yearDiff = latestDate.getFullYear() - earliestDate.getFullYear();
    const monthDiff = latestDate.getMonth() - earliestDate.getMonth();

    const totaMonthlDiff = yearDiff * 12 - monthDiff;

    if (totaMonthlDiff <= 12) {
      return 'Month';
    } else if (totaMonthlDiff <= 48) {
      return 'Quarter';
    } else {
      return 'Year';
    }
  }, [earliestDate, latestDate]);

  const dateLabel = useCallback(
    (date: Date) => {
      if (clusterMode === 'Month') {
        const dateFormatter = new Intl.DateTimeFormat(activeLocale || 'en-US', {
          month: 'long',
          year: 'numeric',
          timeZone: timezone,
        });
        return dateFormatter.format(earliestDate);
      } else if (clusterMode === 'Quarter') {
        const year = date.getFullYear().toString();
        const quarter = getQuarter(date);
        return `Q${quarter} ${year}`;
      } else if (clusterMode === 'Year') {
        return date.getFullYear().toString();
      }
    },
    [activeLocale, clusterMode, earliestDate, timezone]
  );

  return (
    <TimelineSlider
      labelEnd={latestDate ? dateLabel(latestDate) : undefined}
      labelSelected={'selected'}
      labelStart={earliestDate ? dateLabel(earliestDate) : undefined}
      marks={[]}
    />
  );
};

export default ObservationTimeline;
