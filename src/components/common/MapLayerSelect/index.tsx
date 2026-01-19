import React, { type JSX, useState } from 'react';

import { useTheme } from '@mui/material';
import { Icon, PopoverMultiSelect } from '@terraware/web-components';

import { useMapPortalContainer } from 'src/components/Map/MapRenderUtils';

export type MapLayer = 'Planting Site' | 'Strata' | 'Sub-Strata' | 'Monitoring Plots' | 'Project Zones';

type MapLayerSelectProps = {
  initialSelection: MapLayer[];
  onUpdateSelection: (selection: MapLayer[]) => void;
  menuSections: { label: string; value: MapLayer }[][];
};

export default function MapLayerSelect({
  initialSelection,
  onUpdateSelection,
  menuSections,
}: MapLayerSelectProps): JSX.Element | null {
  const theme = useTheme();
  const mapPortalContainer = useMapPortalContainer();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const handleClick = (event?: React.MouseEvent<HTMLButtonElement, MouseEvent> | undefined) => {
    setAnchorEl(event?.currentTarget ?? null);
  };

  if (mapPortalContainer) {
    return null;
  }

  return (
    <>
      <PopoverMultiSelect
        anchorElement={anchorEl}
        setAnchorElement={setAnchorEl}
        sections={menuSections}
        initialSelection={initialSelection}
        onChange={onUpdateSelection}
        menuAlign='right'
      />
      <button
        onClick={handleClick}
        style={{
          border: `1px solid ${theme.palette.TwClrBaseGray300}`,
          borderRadius: '4px',
          backgroundColor: theme.palette.TwClrBg,
          cursor: 'pointer',
          height: '24px',
          minWidth: '24px',
          display: 'flex',
          alignItems: 'center',
          padding: `0 ${theme.spacing(0.5)}`,
        }}
      >
        <Icon name='iconLayers' size='small' />
      </button>
    </>
  );
}
