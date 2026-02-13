import React, { useMemo } from 'react';

import { useTheme } from '@mui/material';

import strings from 'src/strings';
import { LAND_USE_MODEL_TYPES, LandUseModelType } from 'src/types/AcceleratorProject';
import { NumberFormatter } from 'src/types/Number';

import InvertedCard from './InvertedCard';

type LandUseModelTypeCardProps = {
  selectedTypes?: LandUseModelType[];
  modelHectares?: { [key: string]: number };
  numberFormatter: NumberFormatter;
};

const LandUseModelTypeCard = ({ selectedTypes, modelHectares, numberFormatter }: LandUseModelTypeCardProps) => {
  const theme = useTheme();

  const value = useMemo(() => {
    if (!modelHectares || Object.keys(modelHectares).length === 0) {
      return;
    }
    const output: string[] = [];
    for (const type of LAND_USE_MODEL_TYPES) {
      if (!selectedTypes?.includes(type)) {
        continue;
      }
      let hectaresString = '--';
      if (modelHectares[type] >= 0) {
        hectaresString = strings.formatString(strings.X_HA, numberFormatter.format(modelHectares[type]))?.toString();
      }
      output.push(`${type} (${hectaresString})`);
    }
    return output.join('/');
  }, [modelHectares, numberFormatter, selectedTypes]);

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
