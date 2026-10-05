import React, { type JSX, useMemo } from 'react';

import SegmentControl from 'src/components/common/SegmentControl';
import { useLocalization } from 'src/providers';

import { useObservationFilters } from '../ObservationFiltersProvider';

/** Picks between the map, the table, or both. */
const ViewModeToggle = (): JSX.Element => {
  const { strings } = useLocalization();
  const { setViewMode, viewMode } = useObservationFilters();

  const segments = useMemo(
    () => [
      { icon: 'iconMap' as const, id: 'map' as const, label: strings.MAP },
      { icon: 'iconGrid' as const, id: 'split' as const, label: strings.SPLIT },
      { icon: 'iconMenu' as const, id: 'list' as const, label: strings.LIST },
    ],
    [strings.LIST, strings.MAP, strings.SPLIT]
  );

  return <SegmentControl minSegmentWidth={70} onChange={setViewMode} segments={segments} selected={viewMode} />;
};

export default ViewModeToggle;
