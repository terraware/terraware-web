import { useMemo, useState } from 'react';

import { useLocalization } from 'src/providers';

import { MapSingleSelectLegendGroup } from './MapLegend';
import useMapFeatureStyles from './useMapFeatureStyles';

export type PlantingSiteMapLayer = 'sites' | 'strata' | 'substrata';

const usePlantingSiteMapLegend = (defaultLayer?: PlantingSiteMapLayer, disabled?: boolean) => {
  const { strings } = useLocalization();
  const {
    sitesLayerStyle,
    strataLayerStyle: strataLayerStyle,
    substrataLayerStyle: substrataLayerStyle,
  } = useMapFeatureStyles();
  const [selectedLayer, setSelectedLayer] = useState<PlantingSiteMapLayer | undefined>(defaultLayer);

  const plantingSiteLegendGroup = useMemo(
    (): MapSingleSelectLegendGroup => ({
      items: [
        {
          id: 'sites',
          label: strings.SITE,
          style: sitesLayerStyle,
        },
        {
          id: 'strata',
          label: strings.STRATA,
          style: strataLayerStyle,
        },
        {
          id: 'substrata',
          label: strings.SUBSTRATA,
          style: substrataLayerStyle,
        },
      ],
      title: strings.BOUNDARIES,
      type: 'single-select',
      selectedLayer,
      setSelectedLayer: (id: string | undefined) => setSelectedLayer(id as PlantingSiteMapLayer | undefined),
      disabled,
    }),
    [disabled, selectedLayer, sitesLayerStyle, strings, substrataLayerStyle, strataLayerStyle]
  );

  return {
    selectedLayer,
    setSelectedLayer,
    plantingSiteLegendGroup,
  };
};

export default usePlantingSiteMapLegend;
