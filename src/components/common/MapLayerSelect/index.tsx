import React, { useState } from 'react';
import { Icon, PopoverMultiSelect } from '@terraware/web-components';
import { makeStyles } from '@mui/styles';
import { Theme } from '@mui/material';

export type MapLayer = 'Planting Site' | 'Zones' | 'Sub-Zones' | 'Monitoring Plots';

const useStyles = makeStyles((theme: Theme) => ({
  layerButton: {
    border: `1px solid ${theme.palette.TwClrBaseGray300}`,
    borderRadius: '4px',
    backgroundColor: theme.palette.TwClrBg,
    cursor: 'pointer',
    height: '24px',
    minWidth: '24px',
    display: 'flex',
    alignItems: 'center',
    padding: `0 ${theme.spacing(0.5)}`,
  },
}));

type MapLayerSelectProps = {
  initialSelection: MapLayer[];
  onUpdateSelection: (selection: MapLayer[]) => void;
  menuSections: { label: string; value: MapLayer }[][];
};

export default function MapLayerSelect({
  initialSelection,
  onUpdateSelection,
  menuSections,
}: MapLayerSelectProps): JSX.Element {
  const classes = useStyles();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const handleClick = (event?: React.MouseEvent<HTMLButtonElement, MouseEvent> | undefined) => {
    setAnchorEl(event?.currentTarget ?? null);
  };

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
      <button onClick={handleClick} className={classes.layerButton}>
        <Icon name='iconLayers' size='small' />
      </button>
    </>
  );
}
