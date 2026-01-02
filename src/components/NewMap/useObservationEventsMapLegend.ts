import { useMemo, useState } from 'react';

import { useLocalization } from 'src/providers';

import { MapGroupToggleLegendGroup } from './MapLegend';
import useMapFeatureStyles from './useMapFeatureStyles';

const useObservationEventsMapLegend = (disabled?: boolean) => {
  const { strings } = useLocalization();
  const [observationEventsVisible, setObservationEventsVisible] = useState<boolean>(false);

  const { observationEventStyle } = useMapFeatureStyles();
  const observationEventsLegendGroup = useMemo((): MapGroupToggleLegendGroup => {
    return {
      disabled,
      items: [
        {
          label: strings.LATEST_OBSERVATION,
          style: {
            ...observationEventStyle,
            opacity: 1.0,
          },
        },
      ],
      title: strings.OBSERVATION_EVENTS,
      tooltip: strings.OBSERVATION_EVENTS_TOOLTIP,
      type: 'group-toggle',
      setVisible: setObservationEventsVisible,
      visible: observationEventsVisible,
    };
  }, [
    disabled,
    observationEventStyle,
    observationEventsVisible,
    strings.LATEST_OBSERVATION,
    strings.OBSERVATION_EVENTS,
    strings.OBSERVATION_EVENTS_TOOLTIP,
  ]);

  return {
    observationEventsLegendGroup,
    observationEventsVisible,
    setObservationEventsVisible,
  };
};

export default useObservationEventsMapLegend;
