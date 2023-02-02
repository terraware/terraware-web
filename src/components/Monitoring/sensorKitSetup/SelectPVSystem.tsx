import { makeStyles } from '@mui/styles';
import React, { useEffect, useState } from 'react';
import strings from 'src/strings';
import { Facility } from 'src/types/Facility';
import { DeviceTemplate } from 'src/types/Device';
import Select from '../../common/Select/Select';
import FlowStep, { FlowError } from './FlowStep';
import { listDeviceTemplates, createDevice } from 'src/api/device/device';
import { listFacilityDevicesById } from 'src/api/facility/facility';
import useDeviceInfo from 'src/utils/useDeviceInfo';

interface StyleProps {
  isMobile: boolean;
}

const useStyles = makeStyles(() => ({
  selectPvSystem: {
    width: (props: StyleProps) => (props.isMobile ? '100%' : '432px'),
  },
}));

type SelectPVSystemProps = {
  seedBank: Facility;
  active: boolean;
  completed: boolean | undefined;
  onNext: () => void;
};

export default function SelectPVSystem(props: SelectPVSystemProps): JSX.Element {
  const { isMobile } = useDeviceInfo();
  const classes = useStyles({ isMobile });
  const { seedBank, active, completed, onNext } = props;
  const [availablePVSystems, setAvailablePVSystems] = useState<DeviceTemplate[]>([]);
  const [selectedPVSystem, setSelectedPVSystem] = useState<DeviceTemplate | undefined>();
  const [showError, setShowError] = useState<boolean>(false);
  const [flowError, setFlowError] = useState<FlowError | undefined>();
  const [processing, setProcessing] = useState<boolean>(false);
  const [initialized, setInitialized] = useState<boolean>(false);

  const onChange = (pvSystemName: string) => {
    const foundPVSystem = availablePVSystems.find((pvSystem) => pvSystem.name === pvSystemName);
    setSelectedPVSystem(foundPVSystem);
    setShowError(foundPVSystem === undefined);
    setFlowError(undefined);
  };

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

  useEffect(() => {
    // re initialize if seedbank id changes
    setAvailablePVSystems([]);
    setShowError(false);
    setFlowError(undefined);
    setProcessing(false);
    setInitialized(false);
  }, [seedBank.id]);

  useEffect(() => {
    const fetchDevices = async () => {
      const response = await listFacilityDevicesById(seedBank.id);
      if (!response.requestSucceeded) {
        setFlowError({
          title: strings.SERVER_ERROR,
          text: strings.GENERIC_ERROR,
        });
        return null;
      }
      return response.devices;
    };

    const initializeDeviceTemplates = async () => {
      const deviceTemplates = await listDeviceTemplates('PV');
      if (deviceTemplates.requestSucceeded) {
        const devices = await fetchDevices();
        if (!devices) {
          return;
        }
        if (
          devices.find((device) => {
            return deviceTemplates.templates.find((template) => {
              return template.make === device.make && template.model === device.model && template.type === device.type;
            });
          })
        ) {
          // advance to next step as user has already picked a PV system
          onNext();
          return;
        }
        setAvailablePVSystems(deviceTemplates.templates);
        setInitialized(true);
      } else {
        setFlowError({
          title: strings.SERVER_ERROR,
          text: strings.GENERIC_ERROR,
        });
      }
    };

    if (active) {
      if (seedBank.connectionState === 'Not Connected') {
        initializeDeviceTemplates();
      } else {
        onNext();
      }
    }
  }, [setAvailablePVSystems, seedBank.id, seedBank.connectionState, onNext, setInitialized, active]);

  return (
    <FlowStep
      flowState='PVSystem'
      active={active && initialized}
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
