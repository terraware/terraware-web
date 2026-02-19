import { useMemo, useState } from 'react';

import { useLocalization } from 'src/providers';

import { MapMultiSelectLegendGroup, MapMultiSelectLegendItem } from './MapLegend';
import useMapFeatureStyles from './useMapFeatureStyles';

const useMonitoringPlotsMapLegend = (
  disabled?: boolean,
  excludePermanentPlots?: boolean,
  excludeTemporaryPlots?: boolean,
  excludeAdHocPlots?: boolean,
  defaultVisibility?: boolean
) => {
  const { strings } = useLocalization();
  const [permanentPlotsVisible, setPermanentPlotsVisible] = useState<boolean>(defaultVisibility ?? false);
  const [temporaryPlotsVisible, setTemporaryPlotsVisible] = useState<boolean>(defaultVisibility ?? false);
  const [adHocPlotsVisible, setAdHocPlotsVisible] = useState<boolean>(defaultVisibility ?? false);

  const { permanentPlotsLayerStyle, temporaryPlotsLayerStyle, adHocPlotsLayerStyle } = useMapFeatureStyles();
  const monitoringPlotsLegendGroup = useMemo((): MapMultiSelectLegendGroup => {
    return {
      disabled,
      items: [
        !excludePermanentPlots
          ? ({
              id: 'live-plants',
              label: strings.PERMANENT_PLOTS,
              setVisible: setPermanentPlotsVisible,
              style: permanentPlotsLayerStyle,
              visible: permanentPlotsVisible,
            } as MapMultiSelectLegendItem)
          : undefined,
        !excludeTemporaryPlots
          ? ({
              id: 'dead-plants',
              label: strings.TEMPORARY_PLOTS,
              setVisible: setTemporaryPlotsVisible,
              style: temporaryPlotsLayerStyle,
              visible: temporaryPlotsVisible,
            } as MapMultiSelectLegendItem)
          : undefined,
        !excludeAdHocPlots
          ? ({
              id: 'dead-plants',
              label: strings.AD_HOC_PLOTS,
              setVisible: setAdHocPlotsVisible,
              style: adHocPlotsLayerStyle,
              visible: adHocPlotsVisible,
            } as MapMultiSelectLegendItem)
          : undefined,
      ].filter((item): item is MapMultiSelectLegendItem => item !== undefined),
      title: strings.MONITORING_PLOTS,
      type: 'multi-select',
    };
  }, [
    adHocPlotsLayerStyle,
    adHocPlotsVisible,
    disabled,
    excludeAdHocPlots,
    excludePermanentPlots,
    excludeTemporaryPlots,
    permanentPlotsLayerStyle,
    permanentPlotsVisible,
    strings.AD_HOC_PLOTS,
    strings.MONITORING_PLOTS,
    strings.PERMANENT_PLOTS,
    strings.TEMPORARY_PLOTS,
    temporaryPlotsLayerStyle,
    temporaryPlotsVisible,
  ]);

  return {
    monitoringPlotsLegendGroup,
    permanentPlotsVisible,
    temporaryPlotsVisible,
    adHocPlotsVisible,
  };
};

export default useMonitoringPlotsMapLegend;
