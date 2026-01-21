import React, { useCallback, useMemo } from 'react';

import TimelineSlider from '@terraware/web-components/components/TimelineSlider';
import { getDateDisplayValue } from '@terraware/web-components/utils';

import { useLocalization } from 'src/providers';
import { ObservationResultsPayload } from 'src/queries/generated/observations';
import { getShortDate } from 'src/utils/dateFormatter';

type ObservationClusterMode = 'Month' | 'Quarter' | 'Year';
type ObservationClusterKey = {
  key: string;
  label: string;
  value: number;
};

type ObservationTimelineProps = {
  adHocObservationResults: ObservationResultsPayload[];
  observationResults: ObservationResultsPayload[];
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

  const dateLabel = useCallback((date: Date) => {
    return date.getFullYear().toString();
  }, []);

  const getClusterKey = useCallback(
    (date: Date): ObservationClusterKey => {
      const y = date.getFullYear();
      const m = date.getMonth();

      switch (clusterMode) {
        case 'Month':
          return {
            key: `${y}-${m}`,
            label: new Intl.DateTimeFormat(activeLocale || 'en-US', {
              month: 'long',
              year: 'numeric',
              timeZone: 'UTC',
            }).format(date),
            value: new Date(y, m, 1).valueOf(),
          };
        case 'Quarter': {
          const quarterStartMonth = Math.floor(m / 3) * 3;
          const quarter = Math.floor(m / 3) + 1;
          return {
            key: `${y}-Q${quarter}`,
            label: `${y} Q${quarter}`,
            value: new Date(y, quarterStartMonth, 1).valueOf(),
          };
        }
        case 'Year':
          return {
            key: `${y}`,
            label: `${y}`,
            value: new Date(y, 0, 1).valueOf(),
          };
      }
    },
    [activeLocale, clusterMode]
  );

  const clusteredObservationIds = useMemo(() => {
    const observationsByKeys = new Map<ObservationClusterKey, number[]>();

    observationResults.forEach((observation) => {
      const completedDate = observation.completedTime
        ? getDateDisplayValue(observation.completedTime, timezone)
        : undefined;

      const observationDate = new Date(completedDate ?? observation.startDate);
      const clusterKey = getClusterKey(observationDate);

      if (!observationsByKeys.has(clusterKey)) {
        observationsByKeys.set(clusterKey, []);
      }

      observationsByKeys.get(clusterKey)!.push(observation.observationId);
    });

    return observationsByKeys;
  }, [getClusterKey, observationResults, timezone]);

  const clusteredAdHocObservationIds = useMemo(() => {
    const observationsByKeys = new Map<ObservationClusterKey, number[]>();

    adHocObservationResults.forEach((observation) => {
      const completedDate = observation.completedTime
        ? getDateDisplayValue(observation.completedTime, timezone)
        : undefined;

      const observationDate = new Date(completedDate ?? observation.startDate);
      const clusterKey = getClusterKey(observationDate);

      if (!observationsByKeys.has(clusterKey)) {
        observationsByKeys.set(clusterKey, []);
      }

      observationsByKeys.get(clusterKey)!.push(observation.observationId);
    });

    return observationsByKeys;
  }, [adHocObservationResults, getClusterKey, timezone]);

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
