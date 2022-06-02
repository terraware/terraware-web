import { createStyles, makeStyles } from '@material-ui/core/styles';
import React, { useEffect, useState } from 'react';
import strings from 'src/strings';
import { Facility } from 'src/api/types/facilities';
import { DeviceTemplate } from 'src/types/Device';
import Select from '../../common/Select/Select';
import FlowStep from './FlowStep';
import { listDeviceTemplates, createDevice } from 'src/api/device/device';
import { listFacilityDevices } from 'src/api/facility/facility';

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
  const [genericError, setGenericError] = useState<string | undefined>();
  const [processing, setProcessing] = useState<boolean>(false);
  const [initialized, setInitialized] = useState<boolean>(false);

  const onChange = (pvSystemName: string) => {
    const foundPVSystem = availablePVSystems.find((pvSystem) => pvSystem.name === pvSystemName);
    setSelectedPVSystem(foundPVSystem);
    setShowError(foundPVSystem === undefined);
    setGenericError(undefined);
  };

  useEffect(() => {
    const fetchDevices = async () => {
      const response = await listFacilityDevices(seedBank);
      if (!response.requestSucceeded) {
        setGenericError(strings.GENERIC_ERROR);
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
              return (
                template.name === device.name &&
                template.name === device.name &&
                template.make === device.make &&
                template.model === device.model &&
                template.type === device.type
              );
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
        setGenericError(strings.GENERIC_ERROR);
      }
    };

    if (active) {
      initializeDeviceTemplates();
    }
  }, [setAvailablePVSystems, seedBank, onNext, setInitialized, active]);

  const goToNext = () => {
    setGenericError(undefined);

    if (!selectedPVSystem) {
      setShowError(true);
      setGenericError(strings.FILL_OUT_ALL_FIELDS);
      return;
    }

    setProcessing(true);
    const createDeviceFromTemplate = async () => {
      const createDeviceResponse = await createDevice(seedBank.id, selectedPVSystem);
      setProcessing(false);
      if (createDeviceResponse.requestSucceeded === false) {
        setGenericError(strings.GENERIC_ERROR);
        return;
      }
      onNext();
    };
    createDeviceFromTemplate();
  };

  return (
    <FlowStep
      flowState='PVSystem'
      active={active && initialized}
      showNext={true}
      disableNext={processing}
      genericError={genericError}
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
