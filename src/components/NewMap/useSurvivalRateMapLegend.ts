import { useMemo, useState } from 'react';

import { useLocalization } from 'src/providers';

import { MapGroupToggleLegendGroup } from './MapLegend';
import useMapFeatureStyles from './useMapFeatureStyles';

const useSurvivalRateMapLegend = (disabled?: boolean) => {
  const { strings } = useLocalization();
  const [survivalRateVisible, setSurvivalRateVisible] = useState<boolean>(false);
  const { survivalRateLessThan50, survivalRate50To75, survivalRateMoreThan75 } = useMapFeatureStyles();

  const survivalRateLegendGroup = useMemo((): MapGroupToggleLegendGroup => {
    return {
      disabled,
      items: [
        {
          label: strings.LESS_THAN_FIFTY_PERCENT,
          style: survivalRateLessThan50,
        },
        {
          label: strings.FIFTY_TO_SEVENTY_FIVE_PERCENT,
          style: survivalRate50To75,
        },
        {
          label: strings.GREATER_THAN_SEVENTY_FIVE_PERCENT,
          style: survivalRateMoreThan75,
        },
      ],
      title: strings.SURVIVAL_RATE,
      type: 'group-toggle',
      setVisible: setSurvivalRateVisible,
      visible: survivalRateVisible,
    };
  }, [
    disabled,
    strings.FIFTY_TO_SEVENTY_FIVE_PERCENT,
    strings.GREATER_THAN_SEVENTY_FIVE_PERCENT,
    strings.LESS_THAN_FIFTY_PERCENT,
    strings.SURVIVAL_RATE,
    survivalRate50To75,
    survivalRateLessThan50,
    survivalRateMoreThan75,
    survivalRateVisible,
  ]);

  return {
    setSurvivalRateVisible,
    survivalRateLegendGroup,
    survivalRateVisible,
  };
};

export default useSurvivalRateMapLegend;
