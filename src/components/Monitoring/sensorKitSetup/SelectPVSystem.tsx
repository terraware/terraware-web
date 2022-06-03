import { createStyles, makeStyles } from '@material-ui/core/styles';
import React, { useEffect, useState } from 'react';
import strings from 'src/strings';
import { Facility } from 'src/api/types/facilities';
import { DeviceTemplate } from 'src/types/Device';
import Select from '../../common/Select/Select';
import FlowStep, { FlowError } from './FlowStep';
import { listDeviceTemplates, createDevice } from 'src/api/device/device';

const useStyles = makeStyles((theme) =>
  createStyles({
    selectPvSystem: {
      width: '432px',
    },
  })
);

type SelectPVSystemProps = {
  seedBank: Facility;
  active: boolean;
  completed: boolean | undefined;
  onNext: () => void;
};

export default function SelectPVSystem(props: SelectPVSystemProps): JSX.Element {
  const classes = useStyles();
  const { seedBank, active, completed, onNext } = props;
  const [availablePVSystems, setAvailablePVSystems] = useState<DeviceTemplate[]>([]);
  const [selectedPVSystem, setSelectedPVSystem] = useState<DeviceTemplate | undefined>();
  const [showError, setShowError] = useState<boolean>(false);
  const [flowError, setFlowError] = useState<FlowError | undefined>();
  const [processing, setProcessing] = useState<boolean>(false);

  const onChange = (pvSystemName: string) => {
    const foundPVSystem = availablePVSystems.find((pvSystem) => pvSystem.name === pvSystemName);
    setSelectedPVSystem(foundPVSystem);
    setShowError(foundPVSystem === undefined);
    setFlowError(undefined);
  };

  useEffect(() => {
    const fetchDeviceTemplates = async () => {
      const deviceTemplates = await listDeviceTemplates('PV');
      if (deviceTemplates.requestSucceeded) {
        setAvailablePVSystems(deviceTemplates.templates);
      } else {
        setFlowError({
          title: strings.SERVER_ERROR,
          text: strings.GENERIC_ERROR,
        });
      }
    };

    fetchDeviceTemplates();
  }, [setAvailablePVSystems, seedBank]);

  const goToNext = () => {
    setFlowError(undefined);

    if (!selectedPVSystem) {
      setShowError(true);
      setFlowError({ text: strings.FILL_OUT_ALL_FIELDS });
      return;
    }

    setProcessing(true);
    const createDeviceFromTemplate = async () => {
      const createDeviceResponse = await createDevice(seedBank.id, selectedPVSystem);
      setProcessing(false);
      if (createDeviceResponse.requestSucceeded === false) {
        setFlowError({
          title: strings.SERVER_ERROR,
          text: strings.GENERIC_ERROR,
        });
        return;
      }
      onNext();
    };
    createDeviceFromTemplate();
  };

  return (
    <FlowStep
      flowState='PVSystem'
      active={active}
      showNext={true}
      disableNext={processing}
      flowError={flowError}
      onNext={goToNext}
      title={strings.SENSOR_KIT_SET_UP_PV_SYSTEM}
      completed={completed}
      footerError={showError}
      footer={
        <div className={classes.selectPvSystem}>
          <Select
            id='select-pv-system'
            selectedValue={selectedPVSystem?.name}
            onChange={onChange}
            options={availablePVSystems.map((pvSystem) => pvSystem.name)}
            label={strings.PV_SYSTEM}
            aria-label={strings.PV_SYSTEM}
            placeholder={strings.SELECT}
            readonly={true}
            fullWidth={true}
            errorText={showError ? strings.REQUIRED_FIELD : ''}
          />
        </div>
      }
    >
      <div>{strings.SENSOR_KIT_SET_UP_PV_SYSTEM_DESCRIPTION}</div>
    </FlowStep>
  );
}
