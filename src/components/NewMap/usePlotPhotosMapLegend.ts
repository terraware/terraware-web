import { useMemo, useState } from 'react';

import isEnabled from 'src/features';
import { useLocalization, useOrganization } from 'src/providers';

import { MapMultiSelectLegendGroup } from './MapLegend';
import useMapFeatureStyles from './useMapFeatureStyles';

const usePlotPhotosMapLegend = (disabled?: boolean) => {
  const { strings } = useLocalization();
  const { selectedOrganization } = useOrganization();
  const [plotPhotosVisible, setPlotPhotosVisible] = useState<boolean>(false);
  const [virtualPlotVisible, setVirtualPlotVisible] = useState<boolean>(false);
  const isVirtualPlotsEnabled = isEnabled('Virtual Monitoring Plots', selectedOrganization?.id);

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
