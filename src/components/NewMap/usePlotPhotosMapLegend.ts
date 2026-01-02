import { useMemo, useState } from 'react';

import { useLocalization } from 'src/providers';

import { MapMultiSelectLegendGroup } from './MapLegend';
import useMapFeatureStyles from './useMapFeatureStyles';

const usePlotPhotosMapLegend = (disabled?: boolean) => {
  const { strings } = useLocalization();
  const [plotPhotosVisible, setPlotPhotosVisible] = useState<boolean>(false);

  const { plotPhotoStyle } = useMapFeatureStyles();
  const plotPhotosLegendGroup = useMemo((): MapMultiSelectLegendGroup => {
    return {
      disabled,
      items: [
        {
          id: 'plot-photos',
          label: strings.MONITORING_PLOTS,
          setVisible: setPlotPhotosVisible,
          style: plotPhotoStyle,
          visible: plotPhotosVisible,
        },
      ],
      title: strings.PHOTOS,
      type: 'multi-select',
    };
  }, [disabled, plotPhotoStyle, plotPhotosVisible, strings.MONITORING_PLOTS, strings.PHOTOS]);

  return {
    plotPhotosLegendGroup,
    plotPhotosVisible,
    setPlotPhotosVisible,
  };
};

export default usePlotPhotosMapLegend;
