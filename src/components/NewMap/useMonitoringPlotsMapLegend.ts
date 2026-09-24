import { useMemo, useState } from 'react';

import { useLocalization } from 'src/providers';

import { MapMultiSelectLegendGroup } from './MapLegend';
import useMapFeatureStyles from './useMapFeatureStyles';

const useMonitoringPlotsMapLegend = (
  disabled?: boolean,
  disablePermanentPlots?: boolean,
  disableTemporaryPlots?: boolean,
  disableAdHocPlots?: boolean,
  defaultVisibility?: boolean
) => {
  const { strings } = useLocalization();
  const [permanentPlotsVisible, setPermanentPlotsVisible] = useState<boolean>(defaultVisibility ?? false);
  const [temporaryPlotsVisible, setTemporaryPlotsVisible] = useState<boolean>(defaultVisibility ?? false);
  const [adHocPlotsVisible, setAdHocPlotsVisible] = useState<boolean>(defaultVisibility ?? false);

  const { permanentPlotsLayerStyle, temporaryPlotsLayerStyle, adHocPlotsLayerStyle } = useMapFeatureStyles();

  // A plot type the view cannot use is drawn nowhere, so its row reads as off rather than lying.
  const permanentVisible = !disablePermanentPlots && permanentPlotsVisible;
  const temporaryVisible = !disableTemporaryPlots && temporaryPlotsVisible;
  const adHocVisible = !disableAdHocPlots && adHocPlotsVisible;
  const monitoringPlotsLegendGroup = useMemo((): MapMultiSelectLegendGroup => {
    return {
      disabled,
      items: [
        {
          disabled: disablePermanentPlots,
          id: 'live-plants',
          label: strings.PERMANENT_PLOTS,
          setVisible: setPermanentPlotsVisible,
          style: permanentPlotsLayerStyle,
          visible: permanentVisible,
        },
        {
          disabled: disableTemporaryPlots,
          id: 'dead-plants',
          label: strings.TEMPORARY_PLOTS,
          setVisible: setTemporaryPlotsVisible,
          style: temporaryPlotsLayerStyle,
          visible: temporaryVisible,
        },
        {
          disabled: disableAdHocPlots,
          id: 'dead-plants',
          label: strings.AD_HOC_PLOTS,
          setVisible: setAdHocPlotsVisible,
          style: adHocPlotsLayerStyle,
          visible: adHocVisible,
        },
      ],
      id: 'monitoringPlots',
      title: strings.MONITORING_PLOTS,
      type: 'multi-select',
    };
  }, [
    adHocPlotsLayerStyle,
    adHocVisible,
    disabled,
    disableAdHocPlots,
    disablePermanentPlots,
    disableTemporaryPlots,
    permanentPlotsLayerStyle,
    permanentVisible,
    strings.AD_HOC_PLOTS,
    strings.MONITORING_PLOTS,
    strings.PERMANENT_PLOTS,
    strings.TEMPORARY_PLOTS,
    temporaryPlotsLayerStyle,
    temporaryVisible,
  ]);

  return {
    monitoringPlotsLegendGroup,
    permanentPlotsVisible: permanentVisible,
    temporaryPlotsVisible: temporaryVisible,
    adHocPlotsVisible: adHocVisible,
  };
};

export default useMonitoringPlotsMapLegend;
