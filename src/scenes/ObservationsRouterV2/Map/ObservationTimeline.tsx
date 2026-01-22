import React, { useCallback, useEffect, useMemo, useState } from 'react';

import { useTheme } from '@mui/material';
import TimelineSlider, { TimelineSliderMark } from '@terraware/web-components/components/TimelineSlider';
import { getDateDisplayValue } from '@terraware/web-components/utils';

import { useLocalization } from 'src/providers';
import { ObservationResultsPayload } from 'src/queries/generated/observations';

type ObservationClusterMode = 'Month' | 'Quarter' | 'Year';

type ObservationTimelineProps = {
  adHocObservationResults: ObservationResultsPayload[];
  observationResults: ObservationResultsPayload[];
  selectAdHocObservationResults: (adHocResults: ObservationResultsPayload[]) => void;
  selectObservationResults: (observationResults: ObservationResultsPayload[]) => void;
  timezone: string;
};

const ObservationTimeline = ({
  adHocObservationResults,
  observationResults,
  selectAdHocObservationResults,
  selectObservationResults,
  timezone,
}: ObservationTimelineProps): JSX.Element => {
  const { activeLocale } = useLocalization();
  const theme = useTheme();
  const [selectedCluster, setSelectedCluster] = useState<string>();
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

    const totalMonthlyDiff = yearDiff * 12 - monthDiff;

    if (totalMonthlyDiff <= 12) {
      return 'Month';
    } else if (totalMonthlyDiff <= 48) {
      return 'Quarter';
    } else {
      return 'Year';
    }
  }, [earliestDate, latestDate]);

  const dateLabel = useCallback((date: Date) => {
    return date.getFullYear().toString();
  }, []);

  const getClusterKey = useCallback(
    (date: Date): string => {
      const year = date.getFullYear();
      const month = date.getMonth();

      switch (clusterMode) {
        case 'Month':
          return `${year}-${month}`;
        case 'Quarter': {
          const quarterStartMonth = Math.floor(month / 3) * 3;
          return `${year}-${quarterStartMonth}`;
        }
        case 'Year':
          return `${year}`;
      }
    },
    [clusterMode]
  );

  const getClusterLabel = useCallback(
    (clusterKey: string): string => {
      const keyParts = clusterKey.split('-');
      const year = Number(keyParts[0]);
      const month = Number(keyParts[1]);

      switch (clusterMode) {
        case 'Year':
          return `${year}`;
        case 'Quarter': {
          const quarter = Math.floor(month / 3) + 1;
          return `${year} Q${quarter}`;
        }
        case 'Month': {
          return new Intl.DateTimeFormat(activeLocale || 'en-US', {
            month: 'long',
            year: 'numeric',
            timeZone: timezone,
          }).format(new Date(year, month, 1));
        }
      }
    },
    [activeLocale, clusterMode, timezone]
  );

  const getClusterValue = useCallback(
    (clusterKey: string): number => {
      const keyParts = clusterKey.split('-');
      const year = Number(keyParts[0]);
      const month = Number(keyParts[1]);

      switch (clusterMode) {
        case 'Year':
          return new Date(year, 0, 1).valueOf();
        case 'Month':
        case 'Quarter':
          return new Date(year, month, 1).valueOf();
      }
    },
    [clusterMode]
  );

  const clusteredObservationIds = useMemo(() => {
    const observationsByKeys = new Map<string, number[]>();

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
    const observationsByKeys = new Map<string, number[]>();

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

  const allClusterKeys = useMemo(() => {
    const keySet = new Set([...clusteredAdHocObservationIds.keys(), ...clusteredObservationIds.keys()]);
    return [...keySet].sort((a, b) => getClusterValue(a) - getClusterValue(b));
  }, [clusteredAdHocObservationIds, clusteredObservationIds, getClusterValue]);

  useEffect(() => {
    const today = new Date().valueOf();

    let closestKey: string | undefined;
    let closestValue = -Infinity;
    allClusterKeys.forEach((key) => {
      const clusterDate = getClusterValue(key);

      if (clusterDate <= today && clusterDate > closestValue) {
        closestValue = clusterDate;
        closestKey = key;
      }
    });

    if (closestKey) {
      setSelectedCluster(closestKey);
    }
  }, [allClusterKeys, getClusterValue]);

  const marks = useMemo((): TimelineSliderMark[] => {
    return allClusterKeys
      .map((key): TimelineSliderMark | undefined => {
        const observationIds = clusteredObservationIds.get(key);
        const adHocObservationIds = clusteredAdHocObservationIds.get(key);
        const selected = key === selectedCluster;

        const observationsSize = observationIds?.length ?? 0;
        const adHocObservationsSize = adHocObservationIds?.length ?? 0;

        const clusterColor = selected
          ? theme.palette.TwClrIcnSecondary
          : observationsSize > 0
            ? theme.palette.TwClrBgBrand
            : theme.palette.TwClrBaseOrange300;
        const clusterSize = observationsSize + adHocObservationsSize;

        if (clusterSize === 1) {
          return {
            color: clusterColor?.toString() ?? '',
            onClick: () => setSelectedCluster(key),
            size: selected ? 'large' : 'small',
            value: getClusterValue(key),
          };
        } else if (clusterSize > 1) {
          return {
            color: clusterColor?.toString() ?? '',
            labelTop: clusterSize.toString(),
            onClick: () => setSelectedCluster(key),
            size: selected ? 'large' : 'medium',
            value: getClusterValue(key),
          };
        } else {
          return undefined;
        }
      })
      .filter((mark): mark is TimelineSliderMark => mark !== undefined);
  }, [
    allClusterKeys,
    clusteredAdHocObservationIds,
    clusteredObservationIds,
    getClusterValue,
    selectedCluster,
    theme.palette.TwClrBaseOrange300,
    theme.palette.TwClrBgBrand,
    theme.palette.TwClrIcnSecondary,
  ]);

  useEffect(() => {
    if (selectedCluster) {
      const observationIds = new Set(clusteredObservationIds.get(selectedCluster));
      const adHocObservationIds = new Set(clusteredAdHocObservationIds.get(selectedCluster));

      const filteredObservations = observationResults.filter((observation) =>
        observationIds.has(observation.observationId)
      );
      const filteredAdHocObservations = adHocObservationResults.filter((observation) =>
        adHocObservationIds.has(observation.observationId)
      );

      selectObservationResults(filteredObservations);
      selectAdHocObservationResults(filteredAdHocObservations);
    }
  }, [
    adHocObservationResults,
    clusteredAdHocObservationIds,
    clusteredObservationIds,
    observationResults,
    selectAdHocObservationResults,
    selectObservationResults,
    selectedCluster,
  ]);

  return (
    <TimelineSlider
      labelEnd={latestDate ? dateLabel(latestDate) : undefined}
      labelSelected={selectedCluster ? getClusterLabel(selectedCluster) : undefined}
      labelStart={earliestDate ? dateLabel(earliestDate) : undefined}
      marks={marks}
    />
  );
};

export default ObservationTimeline;
