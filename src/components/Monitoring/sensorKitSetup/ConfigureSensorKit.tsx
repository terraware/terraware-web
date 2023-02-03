import React, { useEffect, useState } from 'react';
import strings from 'src/strings';
import { Facility } from 'src/types/Facility';
import FlowStep, { FlowError } from './FlowStep';
import { markSensorKitConfigured } from 'src/api/facility/facility';

type ConfigureSensorKitProps = {
  seedBank: Facility;
  active: boolean;
  onNext: (reload?: boolean) => void;
};

export default function ConfigureSensorKit(props: ConfigureSensorKitProps): JSX.Element {
  const { seedBank, active, onNext } = props;
  const [flowError, setFlowError] = useState<FlowError | undefined>();
  const [processing, setProcessing] = useState<boolean>(false);

  const configureSensorKit = () => {
    const configure = async () => {
      setProcessing(true);
      const response = await markSensorKitConfigured(seedBank.id);
      if (response.requestSucceeded === false) {
        setFlowError({
          title: strings.SERVER_ERROR,
          text: strings.GENERIC_ERROR,
        });
      } else {
        onNext();
      }
      setProcessing(false);
    };
    configure();
  };

  useEffect(() => {
    // reinitialize if seed bank id changes
    setFlowError(undefined);
  }, [seedBank.id]);

  return (
    <FlowStep
      flowState='Configure'
      active={active}
      flowError={flowError}
      showNext={true}
      onNext={configureSensorKit}
      buttonText={strings.GO_TO_DASHBOARD}
      disableNext={processing}
      title={strings.SENSOR_KIT_SET_UP_COMPLETE}
      completed={false}
    >
      <div>{strings.SENSOR_KIT_SET_UP_COMPLETE_DESCRIPTION}</div>
    </FlowStep>
  );
}
