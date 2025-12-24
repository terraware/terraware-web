import { useMemo, useState } from 'react';

import { useLocalization } from 'src/providers';

import { MapSingleSelectLegendGroup } from './MapLegend';
import useMapFeatureStyles from './useMapFeatureStyles';

export type PlantingSiteMapLayer = 'sites' | 'zones' | 'subzones';

const usePlantingSiteMapLegend = (defaultLayer?: PlantingSiteMapLayer, disabled?: boolean) => {
  const { strings } = useLocalization();
  const { sitesLayerStyle, zonesLayerStyle, subzonesLayerStyle } = useMapFeatureStyles();
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
          id: 'zones',
          label: strings.ZONES,
          style: zonesLayerStyle,
        },
        {
          id: 'subzones',
          label: strings.SUBZONES,
          style: subzonesLayerStyle,
        },
      ],
      title: strings.BOUNDARIES,
      type: 'single-select',
      selectedLayer,
      setSelectedLayer: (id: string | undefined) => setSelectedLayer(id as PlantingSiteMapLayer | undefined),
      disabled,
    }),
    [disabled, selectedLayer, sitesLayerStyle, strings, subzonesLayerStyle, zonesLayerStyle]
  );

  return {
    selectedLayer,
    setSelectedLayer,
    plantingSiteLegendGroup,
  };
};

export default usePlantingSiteMapLegend;
