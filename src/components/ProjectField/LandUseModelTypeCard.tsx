import React, { useMemo } from 'react';

import { useTheme } from '@mui/material';

import strings from 'src/strings';
import { LAND_USE_MODEL_TYPES } from 'src/types/ParticipantProject';

import InvertedCard from './InvertedCard';

type LandUseModelTypeCardProps = {
  modelHectares?: { [key: string]: number };
  numericFormatter?: any;
};

const LandUseModelTypeCard = ({ modelHectares, numericFormatter }: LandUseModelTypeCardProps) => {
  const theme = useTheme();

  const value = useMemo(() => {
    if (!modelHectares || Object.keys(modelHectares).length === 0) {
      return;
    }
    const output: string[] = [];
    for (const type of LAND_USE_MODEL_TYPES) {
      if (modelHectares[type] > 0) {
        output.push(
          `${type} (${strings.formatString(strings.X_HA, numericFormatter.format(modelHectares[type]))?.toString()})`
        );
      }
    }
    return output.join('/');
  }, [modelHectares]);

  return (
    <InvertedCard
      md={12}
      label={strings.LAND_USE_MODEL_TYPE}
      value={value}
      backgroundColor={theme.palette.TwClrBaseGray050}
    />
  );
};
export default LandUseModelTypeCard;
