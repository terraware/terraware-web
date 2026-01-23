import { useMemo, useState } from 'react';

import { useLocalization } from 'src/providers';

import { MapMultiSelectLegendGroup } from './MapLegend';
import useMapFeatureStyles from './useMapFeatureStyles';

const useVirtualPlotMapLegend = (disabled?: boolean) => {
  const { strings } = useLocalization();
  const [virtualPlotVisible, setVirtualPlotVisible] = useState<boolean>(false);

  const { virtualPlotStyle } = useMapFeatureStyles();
  const virtualPlotLegendGroup = useMemo((): MapMultiSelectLegendGroup => {
    return {
      disabled,
      items: [
        {
          id: 'virtual-plot',
          label: strings.VIRTUAL_PLOTS,
          setVisible: setVirtualPlotVisible,
          style: virtualPlotStyle,
          visible: virtualPlotVisible,
        },
      ],
      title: strings.PHOTOS,
      type: 'multi-select',
    };
  }, [disabled, strings.PHOTOS, strings.VIRTUAL_PLOTS, virtualPlotStyle, virtualPlotVisible]);

  return {
    virtualPlotLegendGroup,
    virtualPlotVisible,
    setVirtualPlotVisible,
  };
};

export default useVirtualPlotMapLegend;
