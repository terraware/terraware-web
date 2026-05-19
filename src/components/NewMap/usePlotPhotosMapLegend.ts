import { useMemo, useState } from 'react';

import useOrganizationFeatures from 'src/hooks/useOrganizationFeatures';
import { useLocalization } from 'src/providers';

import { MapMultiSelectLegendGroup, MapMultiSelectLegendItem } from './MapLegend';
import useMapFeatureStyles from './useMapFeatureStyles';

type UsePlotPhotosMapLegendOptions = {
  disabled?: boolean;
  includeObservations?: boolean;
  includeWithdrawals?: boolean;
  withdrawalsDisabled?: boolean;
};

const usePlotPhotosMapLegend = (options: UsePlotPhotosMapLegendOptions = {}) => {
  const { disabled, includeObservations = true, includeWithdrawals = false, withdrawalsDisabled } = options;

  const { strings } = useLocalization();
  const orgFeatures = useOrganizationFeatures();
  const [plotPhotosVisible, setPlotPhotosVisible] = useState<boolean>(false);
  const [virtualPlotVisible, setVirtualPlotVisible] = useState<boolean>(false);
  const [withdrawalPhotosVisible, setWithdrawalPhotosVisible] = useState<boolean>(false);
  const isVirtualPlotsEnabled = !!orgFeatures?.virtualWalkthrough?.enabled;

  const { plotPhotoStyle, virtualPlotStyle, withdrawalPhotoStyle } = useMapFeatureStyles();
  const plotPhotosLegendGroup = useMemo((): MapMultiSelectLegendGroup => {
    const items: MapMultiSelectLegendItem[] = [];

    if (includeObservations) {
      items.push({
        id: 'plot-photos',
        label: strings.OBSERVATIONS,
        setVisible: setPlotPhotosVisible,
        style: plotPhotoStyle,
        visible: plotPhotosVisible,
      });

      if (isVirtualPlotsEnabled) {
        items.push({
          id: 'virtual-plot',
          label: strings.VIRTUAL_PLOTS,
          setVisible: setVirtualPlotVisible,
          style: virtualPlotStyle,
          visible: virtualPlotVisible,
        });
      }
    }

    if (includeWithdrawals) {
      items.push({
        disabled: withdrawalsDisabled,
        id: 'withdrawal-photos',
        label: strings.PLANTING_WITHDRAWALS,
        setVisible: setWithdrawalPhotosVisible,
        style: withdrawalPhotoStyle,
        visible: withdrawalPhotosVisible,
      });
    }

    return {
      disabled,
      items,
      title: strings.PHOTOS_VIDEOS,
      type: 'multi-select',
    };
  }, [
    disabled,
    includeObservations,
    includeWithdrawals,
    isVirtualPlotsEnabled,
    plotPhotoStyle,
    plotPhotosVisible,
    strings,
    virtualPlotStyle,
    virtualPlotVisible,
    withdrawalPhotoStyle,
    withdrawalPhotosVisible,
    withdrawalsDisabled,
  ]);

  return {
    plotPhotosLegendGroup,
    plotPhotosVisible,
    setPlotPhotosVisible,
    virtualPlotVisible,
    setVirtualPlotVisible,
    withdrawalPhotosVisible,
    setWithdrawalPhotosVisible,
  };
};

export default usePlotPhotosMapLegend;
