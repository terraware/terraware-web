import React, { type JSX } from 'react';

import { SustainableDevelopmentGoal } from 'src/types/Report';

export type SdgIconProps = {
  goal: SustainableDevelopmentGoal;
  size?: number; // dimensions are width x height (where width = height = size)
};

const SdgIcon = ({ goal, size = 80 }: SdgIconProps): JSX.Element | null => {
  return (
    <img
      style={{
        width: `${size}px`,
        height: `${size}px`,
      }}
      src={`/assets/sdg/sdg-${goal.toString().padStart(2, '0')}.svg`}
      alt={`SDG ${goal}`}
    />
  );
};

export default SdgIcon;
