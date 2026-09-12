import React, { type JSX, useCallback } from 'react';

import { IconButton, useTheme } from '@mui/material';
import { Icon } from '@terraware/web-components';

import { useLocalization } from 'src/providers';

import { useSelectedObservation } from '../SelectedObservationProvider';

export type SelectObservationButtonProps = {
  observationId: number;
};

/** Points the map and timeline at one observation, and shows which one they are pointing at. */
const SelectObservationButton = ({ observationId }: SelectObservationButtonProps): JSX.Element => {
  const { strings } = useLocalization();
  const theme = useTheme();
  const { selectObservation, selectedObservationId } = useSelectedObservation();

  const isSelected = selectedObservationId === observationId;

  const onClick = useCallback(() => {
    selectObservation(observationId);
  }, [observationId, selectObservation]);

  return (
    <IconButton
      aria-label={strings.SHOW_OBSERVATION_ON_MAP}
      aria-pressed={isSelected}
      id={`select-observation-${observationId}`}
      onClick={onClick}
      sx={{
        background: isSelected ? theme.palette.TwClrBgBrand : 'transparent',
        border: `1px solid ${theme.palette.TwClrBrdrBrand}`,
        borderRadius: '4px',
        height: '28px',
        padding: 0,
        width: '28px',
        '&:hover': {
          background: isSelected ? theme.palette.TwClrBgBrandHover : theme.palette.TwClrBgBrandGhostHover,
        },
      }}
    >
      <Icon
        name='iconMyLocation'
        size='small'
        fillColor={isSelected ? theme.palette.TwClrIcnOnBrand : theme.palette.TwClrIcnBrand}
      />
    </IconButton>
  );
};

export default SelectObservationButton;
