import { useMemo, useRef, useState } from 'react';
import { makeStyles } from '@mui/styles';
import { useHistory } from 'react-router-dom';
import TfMain from 'src/components/common/TfMain';
import { Box, Container, Typography, useTheme } from '@mui/material';
import strings from 'src/strings';
import { SiteType } from 'src/types/PlantingSite';
import { APP_PATHS } from 'src/constants';
import { useLocalization } from 'src/providers';
import useSnackbar from 'src/utils/useSnackbar';
import PageHeaderWrapper from 'src/components/common/PageHeaderWrapper';
import InstructionsModal from './InstructionsModal';
import PlantingSiteCreateForm, { PlantingSiteCreateStep } from './PlantingSiteCreateForm';

type PlantingSiteCreateFlowProps = {
  siteType: SiteType;
  reloadPlantingSites: () => void;
};

const useStyles = makeStyles(() => ({
  container: {
    display: 'flex',
    flexDirection: 'column',
    flexGrow: 1,
  },
}));

export default function PlantingSiteCreateFlow(props: PlantingSiteCreateFlowProps): JSX.Element {
  const { reloadPlantingSites, siteType } = props;
  const { activeLocale } = useLocalization();
  const contentRef = useRef(null);
  const history = useHistory();
  const theme = useTheme();
  const snackbar = useSnackbar();
  const classes = useStyles();

  // this is a placeholder for the instructions modal trigger
  const [showModal, setShowModal] = useState<boolean>(true);
  const [currentStep, setCurrentStep] = useState<number>(0);

  const onClose = () => {
    setShowModal(false);
  };

  const steps = useMemo<PlantingSiteCreateStep[]>(() => {
    if (!activeLocale) {
      return [];
    }

    if (siteType === 'simple') {
      return [
        { label: strings.DETAILS },
        { label: strings.SITE_BOUNDARY },
        { label: strings.EXCLUSION_AREAS, optional: { completed: false } },
      ];
    }

    return [
      { label: strings.DETAILS },
      { label: strings.SITE_BOUNDARY },
      { label: strings.EXCLUSION_AREAS, optional: { completed: false } },
      { label: strings.ZONE_BOUNDARIES, optional: { completed: false } },
      { label: strings.SUBZONE_BOUNDARIES, optional: { completed: false } },
    ];
  }, [activeLocale, siteType]);

  const goToPlantingSites = () => {
    history.push(APP_PATHS.PLANTING_SITES);
  };

  const onCancel = () => {
    // TODO: confirm with user?
    goToPlantingSites();
  };

  const onSaveAndNext = () => {
    // TODO: save data here, alert user if data is missing
    if (currentStep === steps.length - 1) {
      // this is the final step
      onSaveAndClose();
    } else {
      setCurrentStep(currentStep + 1);
    }
  };

  const onSaveAndClose = () => {
    // TODO: save data here, alert user if data is missing
    snackbar.toastSuccess(strings.SAVED);
    reloadPlantingSites();
    // TODO: if this is the last step, redirect user to newly created planting site
    goToPlantingSites();
  };

  const onStartOver = () => {
    // TODO: reset data here, confirm with user?
    setCurrentStep(0);
  };

  return (
    <TfMain>
      <InstructionsModal open={showModal} onClose={onClose} />
      <PageHeaderWrapper nextElement={contentRef.current}>
        <Box sx={{ padding: theme.spacing(0, 0, 4, 3), display: 'flex' }}>
          <Typography fontSize='24px' fontWeight={600}>
            {strings.ADD_PLANTING_SITE}
          </Typography>
        </Box>
      </PageHeaderWrapper>
      <PlantingSiteCreateForm
        currentStep={currentStep}
        onCancel={onCancel}
        onSaveAndNext={onSaveAndNext}
        onSaveAndClose={onSaveAndClose}
        onStartOver={onStartOver}
        steps={steps}
        className={classes.container}
      >
        <Container maxWidth={false} sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1, paddingRight: 0 }}>
          <Box display='flex' margin='auto auto'>
            <Typography fontSize='24px' fontWeight='bold'>
              Site Creation Flow WIP - site type {siteType}, current step {steps[currentStep]?.label}
            </Typography>
          </Box>
        </Container>
      </PlantingSiteCreateForm>
    </TfMain>
  );
}
