import React, { type JSX, useCallback, useEffect, useMemo, useState } from 'react';

import { useTheme } from '@mui/material';
import TimelineSlider, { TimelineSliderMark } from '@terraware/web-components/components/TimelineSlider';
import { getDateDisplayValue } from '@terraware/web-components/utils';

import { useLocalization } from 'src/providers';
import { ObservationResultsPayload } from 'src/queries/generated/observations';

import { useSelectedObservation } from '../SelectedObservationProvider';

type ObservationClusterMode = 'Month' | 'Quarter' | 'Year';

type ObservationTimelineProps = {
  isAdHoc?: boolean;
  observationResults: ObservationResultsPayload[];
  selectObservationResults: (observationResults: ObservationResultsPayload[]) => void;
  timezone: string;
};

const ObservationTimeline = ({
  isAdHoc,
  observationResults,
  selectObservationResults,
  timezone,
}: ObservationTimelineProps): JSX.Element => {
  const { activeLocale } = useLocalization();
  const { selectObservation, selectedObservationId } = useSelectedObservation();
  const theme = useTheme();
  const [selectedCluster, setSelectedCluster] = useState<string>();
  const observationDates = useMemo(() => {
    return observationResults.map((observation) => {
      const completedDate = observation.completedTime
        ? getDateDisplayValue(observation.completedTime, timezone)
        : undefined;

      return new Date(completedDate ?? observation.startDate);
    });
  }, [observationResults, timezone]);

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

    const totalMonthlyDiff = yearDiff * 12 + monthDiff;

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

  const allClusterKeys = useMemo(
    () => [...clusteredObservationIds.keys()].sort((a, b) => getClusterValue(a) - getClusterValue(b)),
    [clusteredObservationIds, getClusterValue]
  );

  const selectCluster = useCallback(
    (clusterKey: string) => {
      setSelectedCluster(clusterKey);
      // An ad-hoc plot is only ever selected by hand, so a new cluster starts with none selected.
      selectObservation(isAdHoc ? undefined : clusteredObservationIds.get(clusterKey)?.[0]);
    },
    [clusteredObservationIds, isAdHoc, selectObservation]
  );

  // A selection made outside the timeline, such as from the list, pulls the cluster to it.
  useEffect(() => {
    if (selectedObservationId === undefined) {
      return;
    }

    const [containingKey] =
      [...clusteredObservationIds.entries()].find(([, observationIds]) =>
        observationIds.includes(selectedObservationId)
      ) ?? [];

    if (containingKey !== undefined && containingKey !== selectedCluster) {
      setSelectedCluster(containingKey);
    }
  }, [clusteredObservationIds, selectedCluster, selectedObservationId]);

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

    if (closestKey && selectedCluster === undefined) {
      selectCluster(closestKey);
    }
  }, [allClusterKeys, getClusterValue, selectCluster, selectedCluster]);

  const marks = useMemo((): TimelineSliderMark[] => {
    return allClusterKeys
      .map((key): TimelineSliderMark | undefined => {
        const selected = key === selectedCluster;

        const clusterColor = selected
          ? theme.palette.TwClrIcnSecondary
          : isAdHoc
            ? theme.palette.TwClrBaseOrange300
            : theme.palette.TwClrBgBrand;
        const clusterSize = clusteredObservationIds.get(key)?.length ?? 0;

        if (clusterSize === 1) {
          return {
            color: clusterColor?.toString() ?? '',
            onClick: () => selectCluster(key),
            size: selected ? 'large' : 'small',
            value: getClusterValue(key),
          };
        } else if (clusterSize > 1) {
          return {
            color: clusterColor?.toString() ?? '',
            labelTop: clusterSize.toString(),
            onClick: () => selectCluster(key),
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
    clusteredObservationIds,
    getClusterValue,
    isAdHoc,
    selectCluster,
    selectedCluster,
    theme.palette.TwClrBaseOrange300,
    theme.palette.TwClrBgBrand,
    theme.palette.TwClrIcnSecondary,
  ]);

  useEffect(() => {
    if (selectedCluster) {
      const observationIds = new Set(clusteredObservationIds.get(selectedCluster));
      selectObservationResults(
        observationResults.filter((observation) => observationIds.has(observation.observationId))
      );
    }
  }, [clusteredObservationIds, observationResults, selectObservationResults, selectedCluster]);

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
