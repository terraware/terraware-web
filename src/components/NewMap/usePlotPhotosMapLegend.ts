import { useMemo, useState } from 'react';

import useOrganizationFeatures from 'src/hooks/useOrganizationFeatures';
import { useLocalization } from 'src/providers';

import { MapMultiSelectLegendGroup } from './MapLegend';
import useMapFeatureStyles from './useMapFeatureStyles';

const usePlotPhotosMapLegend = (disabled?: boolean) => {
  const { strings } = useLocalization();
  const orgFeatures = useOrganizationFeatures();
  const [plotPhotosVisible, setPlotPhotosVisible] = useState<boolean>(false);
  const [virtualPlotVisible, setVirtualPlotVisible] = useState<boolean>(false);
  const isVirtualPlotsEnabled = !!orgFeatures?.virtualWalkthrough?.enabled;

  const { plotPhotoStyle, virtualPlotStyle } = useMapFeatureStyles();
  const plotPhotosLegendGroup = useMemo((): MapMultiSelectLegendGroup => {
    return {
      disabled,
      items: [
        {
          id: 'plot-photos',
          label: strings.OBSERVATIONS,
          setVisible: setPlotPhotosVisible,
          style: plotPhotoStyle,
          visible: plotPhotosVisible,
        },
        ...(isVirtualPlotsEnabled
          ? [
              {
                id: 'virtual-plot',
                label: strings.VIRTUAL_PLOTS,
                setVisible: setVirtualPlotVisible,
                style: virtualPlotStyle,
                visible: virtualPlotVisible,
              },
            ]
          : []),
      ],
      title: strings.PHOTOS_VIDEOS,
      type: 'multi-select',
    };
  }, [
    disabled,
    isVirtualPlotsEnabled,
    plotPhotoStyle,
    plotPhotosVisible,
    virtualPlotStyle,
    virtualPlotVisible,
    strings,
  ]);

  return {
    plotPhotosLegendGroup,
    plotPhotosVisible,
    setPlotPhotosVisible,
    virtualPlotVisible,
    setVirtualPlotVisible,
  };
};

export default usePlotPhotosMapLegend;
