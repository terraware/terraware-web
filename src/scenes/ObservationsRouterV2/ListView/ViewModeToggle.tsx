import React, { type JSX, useMemo } from 'react';

import { Dropdown } from '@terraware/web-components';

import SegmentControl from 'src/components/common/SegmentControl';
import { useLocalization } from 'src/providers';
import useDeviceInfo from 'src/utils/useDeviceInfo';

import { ViewMode, useObservationFilters } from '../ObservationFiltersProvider';

/** Picks between the map, the table, or both. */
const ViewModeToggle = (): JSX.Element => {
  const { strings } = useLocalization();
  const { isDesktop } = useDeviceInfo();
  const { setViewMode, viewMode } = useObservationFilters();

  const segments = useMemo(
    () => [
      { icon: 'iconMap' as const, id: 'map' as const, label: strings.MAP },
      { icon: 'iconGrid' as const, id: 'split' as const, label: strings.SPLIT },
      { icon: 'iconMenu' as const, id: 'list' as const, label: strings.LIST },
    ],
    [strings.LIST, strings.MAP, strings.SPLIT]
  );

  if (!isDesktop) {
    return (
      <Dropdown
        id='view-mode'
        onChange={(value: string) => setViewMode(value as ViewMode)}
        options={segments.map((segment) => ({ label: segment.label, value: segment.id }))}
        required
        selectedValue={viewMode}
        sx={{ maxWidth: '180px', minWidth: '140px' }}
      />
    );
  }

  return <SegmentControl minSegmentWidth={70} onChange={setViewMode} segments={segments} selected={viewMode} />;
};

export default ViewModeToggle;
