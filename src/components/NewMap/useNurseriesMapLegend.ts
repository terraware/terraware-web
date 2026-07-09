import { useMemo, useState } from 'react';

import { useLocalization } from 'src/providers';

import { MapMultiSelectLegendGroup } from './MapLegend';
import useMapFeatureStyles from './useMapFeatureStyles';

type UseNurseriesMapLegendOptions = {
  disabled?: boolean;
};

const useNurseriesMapLegend = (options: UseNurseriesMapLegendOptions = {}) => {
  const { disabled } = options;

  const { strings } = useLocalization();
  const { nurseryLayerStyle } = useMapFeatureStyles();
  const [nurseriesVisible, setNurseriesVisible] = useState<boolean>(false);

  const nurseriesLegendGroup = useMemo(
    (): MapMultiSelectLegendGroup => ({
      disabled,
      items: [
        {
          id: 'nurseries',
          label: strings.NURSERIES,
          setVisible: setNurseriesVisible,
          style: nurseryLayerStyle,
          visible: nurseriesVisible,
        },
      ],
      title: strings.LOCATIONS,
      type: 'multi-select',
    }),
    [disabled, nurseriesVisible, nurseryLayerStyle, strings]
  );

  return {
    nurseriesLegendGroup,
    nurseriesVisible,
    setNurseriesVisible,
  };
};

export default useNurseriesMapLegend;
