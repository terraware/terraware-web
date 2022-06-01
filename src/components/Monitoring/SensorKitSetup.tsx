import { createStyles, makeStyles } from '@material-ui/core/styles';
import { Container, Grid } from '@material-ui/core';
import React, { useState } from 'react';
import { ServerOrganization } from 'src/types/Organization';
import strings from 'src/strings';
import { Facility } from 'src/api/types/facilities';
import Button from 'src/components/common/button/Button';
import Expandable from '../common/Expandable';
import Icon from '../common/icon/Icon';

const useStyles = makeStyles((theme) =>
  createStyles({
    setupInfo: {
      textAlign: 'center',
      lineHeight: '28px',
      fontSize: '16px',
      marginTop: `${theme.spacing(10)}px`,
    },
    setupTitle: {
      fontWeight: 'bold',
      fontSize: '18px',
      lineHeight: '28px',
    },
    text: {
      textAlign: 'center',
      fontSize: '14px',
      margin: 'auto auto',
    },
    onboardingContainer: {
      display: 'flex',
      margin: ' auto',
      marginTop: `${theme.spacing(5)}px`,
      justifyContent: 'center',
    },
    gridItem: {
      display: 'flex',
      justifyContent: 'center',
      marginBottom: `${theme.spacing(2)}px`,
    },
    nextButton: {
      float: 'right',
      margin: `${theme.spacing(2)}px`,
    },
    flowFooter: {
      float: 'left',
      margin: `${theme.spacing(2)}px`,
    },
    icon: {
      marginRight: `${theme.spacing(1)}px`,
    },
    titleContainer: {
      display: 'flex',
      alignItems: 'center',
    },
  })
);

type SetupFlowState = 'PVSystem' | 'SensorKitID' | 'DeviceManager' | 'DetectSensors' | 'SensorLocations' | 'Complete';

type SensorKitSetupProps = {
  seedBank: Facility;
  organization: ServerOrganization;
  onFinish: () => void;
};

type Completed = {
  [step in SetupFlowState]?: boolean;
};

export default function SensorKitSetup(props: SensorKitSetupProps): JSX.Element {
  const classes = useStyles();
  const { seedBank, onFinish } = props;
  const [flowState, setFlowState] = useState<SetupFlowState>('PVSystem');
  const [completedSteps, setCompletedSteps] = useState<Completed>({});

  const setCompletedAndNext = (currentState: SetupFlowState, nextState: SetupFlowState) => {
    setCompletedSteps((currentCompleted) => {
      const newCompleted = { ...currentCompleted };
      newCompleted[currentState] = true;
      return newCompleted;
    });
    setFlowState(nextState);
  };

  return (
    <Container maxWidth={false}>
      <div className={classes.setupInfo}>
        <div className={classes.setupTitle}>{strings.SENSOR_KIT_SET_UP_TITLE} &#127881;</div>
        <div>{strings.SENSOR_KIT_SET_UP_DESCRIPTION}</div>
        <div>{strings.SENSOR_KIT_SET_UP_TIME}</div>
      </div>
      <Grid container className={classes.onboardingContainer}>
        <FlowStep
          flowState='PVSystem'
          active={flowState === 'PVSystem'}
          showNext={true}
          onNext={() => setCompletedAndNext('PVSystem', 'SensorKitID')}
          title={strings.SENSOR_KIT_SET_UP_PV_SYSTEM}
          completed={completedSteps.PVSystem}
        >
          <div className={classes.text}>Onboarding PVSystem placeholder for {seedBank.id}</div>
        </FlowStep>
        <FlowStep
          flowState='SensorKitID'
          active={flowState === 'SensorKitID'}
          showNext={true}
          onNext={() => setCompletedAndNext('SensorKitID', 'DeviceManager')}
          title={strings.SENSOR_KIT_SET_UP_SENSOR_KIT_ID}
          completed={completedSteps.SensorKitID}
        >
          <div className={classes.text}>Onboarding SensorKitID placeholder for {seedBank.id}</div>
        </FlowStep>
        <FlowStep
          flowState='DeviceManager'
          active={flowState === 'DeviceManager'}
          showNext={true}
          onNext={() => setCompletedAndNext('DeviceManager', 'DetectSensors')}
          title={strings.SENSOR_KIT_SET_UP_DEVICE_MANAGER}
          completed={completedSteps.DeviceManager}
        >
          <div className={classes.text}>Onboarding DeviceManager placeholder for {seedBank.id}</div>
        </FlowStep>
        <FlowStep
          flowState='DetectSensors'
          active={flowState === 'DetectSensors'}
          showNext={true}
          onNext={() => setCompletedAndNext('DetectSensors', 'SensorLocations')}
          title={strings.SENSOR_KIT_SET_UP_DETECT_SENSORS}
          completed={completedSteps.DetectSensors}
        >
          <div className={classes.text}>Onboarding DetectSensors placeholder for {seedBank.id}</div>
        </FlowStep>
        <FlowStep
          flowState='SensorLocations'
          active={flowState === 'SensorLocations'}
          showNext={true}
          onNext={() => setCompletedAndNext('SensorLocations', 'Complete')}
          title={strings.SENSOR_KIT_SET_UP_SENSOR_LOCATIONS}
          completed={completedSteps.SensorLocations}
        >
          <div className={classes.text}>Onboarding SensorLocations placeholder for {seedBank.id}</div>
        </FlowStep>
        <FlowStep
          flowState='Complete'
          active={flowState === 'Complete'}
          showNext={true}
          onNext={onFinish}
          buttonText={strings.TAKE_ME_THERE}
          title={strings.SENSOR_KIT_SET_UP_COMPLETE}
          completed={false}
        >
          <div className={classes.text}>{strings.SENSOR_KIT_SET_UP_COMPLETE_DESCRIPTION}</div>
        </FlowStep>
      </Grid>
    </Container>
  );
}

type FlowStepProps = {
  flowState: SetupFlowState;
  title: string;
  active: boolean;
  completed: boolean | undefined;
  children: React.ReactNode;
  footer?: React.ReactNode;
  showNext: boolean;
  buttonText?: string;
  onNext: () => void;
};

const FlowStep = (props: FlowStepProps) => {
  const classes = useStyles();
  const { flowState, title, active, completed, children, footer, showNext, buttonText, onNext } = props;

  return (
    <Grid item xs={12} className={classes.gridItem}>
      <Expandable
        title={
          <div className={classes.titleContainer}>
            {completed && <Icon name='checkmark' className={classes.icon} />}
            <span className={classes.setupTitle}>{title}</span>
          </div>
        }
        opened={active}
        disabled={!active}
      >
        {children}
        <div>
          {footer && <div className={classes.flowFooter}>{footer}</div>}
          {showNext && (
            <Button
              id={'flow-state-next-' + flowState}
              label={buttonText || strings.NEXT}
              onClick={onNext}
              priority='secondary'
              size='small'
              className={classes.nextButton}
            />
          )}
        </div>
      </Expandable>
    </Grid>
  );
};
