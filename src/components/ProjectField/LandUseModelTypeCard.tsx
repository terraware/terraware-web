import React, { useMemo } from 'react';

import { useTheme } from '@mui/material';

import strings from 'src/strings';

import InvertedCard from './InvertedCard';

type LandUseModelTypeCardProps = {
  modelHectares?: { [key: string]: number };
  numericFormatter?: any;
};

const LandUseModelTypeCard = ({ modelHectares, numericFormatter }: LandUseModelTypeCardProps) => {
  const theme = useTheme();

  const value = useMemo(() => {
    if (!modelHectares) {
      return;
    }
    const output: string[] = [];
    for (const [type, hectares] of Object.entries(modelHectares)) {
      if (hectares > 0) {
        output.push(`${type} (${strings.formatString(strings.X_HA, numericFormatter.format(hectares))?.toString()})`);
      }
    }
    return output.join('/');
  }, [modelHectares]);

  return (
    <InvertedCard
      md={12}
      label={strings.LAND_USE_MODEL_TYPE}
      value={value || 'N/A'}
      backgroundColor={theme.palette.TwClrBaseGray050}
    />
  );
};
export default LandUseModelTypeCard;
