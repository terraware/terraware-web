import { useMemo, useState } from 'react';

import { useLocalization } from 'src/providers';

import { MapMultiSelectLegendGroup } from './MapLegend';
import useMapFeatureStyles from './useMapFeatureStyles';

const usePlantMarkersMapLegend = (disabled?: boolean) => {
  const { strings } = useLocalization();
  const [livePlantsVisible, setLivePlantsVisible] = useState<boolean>(false);
  const [deadPlantsVisible, setDeadPlantsVisible] = useState<boolean>(false);

  const { livePlantStyle, deadPlantStyle } = useMapFeatureStyles();
  const plantMarkersLegendGroup = useMemo((): MapMultiSelectLegendGroup => {
    return {
      disabled,
      items: [
        {
          id: 'live-plants',
          label: strings.LIVE_PLANTS,
          setVisible: setLivePlantsVisible,
          style: livePlantStyle,
          visible: livePlantsVisible,
        },
        {
          id: 'dead-plants',
          label: strings.DEAD_PLANTS,
          setVisible: setDeadPlantsVisible,
          style: deadPlantStyle,
          visible: deadPlantsVisible,
        },
      ],
      title: strings.PLANTS,
      type: 'multi-select',
    };
  }, [
    deadPlantStyle,
    deadPlantsVisible,
    disabled,
    livePlantStyle,
    livePlantsVisible,
    strings.DEAD_PLANTS,
    strings.LIVE_PLANTS,
    strings.PLANTS,
  ]);

  return {
    deadPlantsVisible,
    livePlantsVisible,
    plantMarkersLegendGroup,
    setDeadPlantsVisible,
    setLivePlantsVisible,
  };
};

export default usePlantMarkersMapLegend;
