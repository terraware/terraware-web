import { useMemo, useRef, useState } from 'react';
import { makeStyles } from '@mui/styles';
import { useHistory } from 'react-router-dom';
import TfMain from 'src/components/common/TfMain';
import { Box, Typography, useTheme } from '@mui/material';
import strings from 'src/strings';
import { PlantingSite } from 'src/types/Tracking';
import { SiteType } from 'src/types/PlantingSite';
import { APP_PATHS } from 'src/constants';
import { useLocalization } from 'src/providers';
import useSnackbar from 'src/utils/useSnackbar';
import useForm from 'src/utils/useForm';
import Card from 'src/components/common/Card';
import PageHeaderWrapper from 'src/components/common/PageHeaderWrapper';
import PlantingSiteCreateForm, { PlantingSiteCreateStep, PlantingSiteCreateStepType } from './PlantingSiteCreateForm';
import PlantingSiteDetails from './PlantingSiteDetails';
import PlantingSiteBoundary from './PlantingSiteBoundary';
import PlantingSiteExclusions from './PlantingSiteExclusions';
import PlantingSiteZoneBoundaries from './PlantingSiteZoneBoundaries';
import PlantingSiteSubzoneBoundaries from './PlantingSiteSubzoneBoundaries';

type PlantingSiteCreateFlowProps = {
  reloadPlantingSites: () => void;
  site: PlantingSite;
  siteType: SiteType;
};

const useStyles = makeStyles(() => ({
  container: {
    display: 'flex',
    flexDirection: 'column',
    flexGrow: 1,
  },
}));

export default function PlantingSiteCreateFlow(props: PlantingSiteCreateFlowProps): JSX.Element {
  const { reloadPlantingSites, site, siteType } = props;
  const { activeLocale } = useLocalization();
  const contentRef = useRef(null);
  const history = useHistory();
  const theme = useTheme();
  const snackbar = useSnackbar();
  const classes = useStyles();

  const [currentStep, setCurrentStep] = useState<PlantingSiteCreateStepType>('details');
  const [completedOptionalSteps, setCompletedOptionalSteps] = useState<Record<PlantingSiteCreateStepType, boolean>>(
    {} as Record<PlantingSiteCreateStepType, boolean>
  );
  const [plantingSite, setPlantingSite, onChange] = useForm({ ...site });

  const steps = useMemo<PlantingSiteCreateStep[]>(() => {
    if (!activeLocale) {
      return [];
    }

    const isCompleted = (optionalStep: PlantingSiteCreateStepType) => completedOptionalSteps[optionalStep] ?? false;

    const simpleSiteSteps: PlantingSiteCreateStep[] = [
      {
        type: 'details',
        label: strings.DETAILS,
      },
      {
        type: 'site_boundary',
        label: strings.SITE_BOUNDARY,
      },
      {
        type: 'exclusion_areas',
        label: strings.EXCLUSION_AREAS,
        optional: { completed: isCompleted('exclusion_areas') },
      },
    ];

    if (siteType === 'simple') {
      return simpleSiteSteps;
    }

    return [
      ...simpleSiteSteps,
      {
        type: 'zone_boundaries',
        label: strings.ZONE_BOUNDARIES,
        optional: { completed: isCompleted('zone_boundaries') },
      },
      {
        type: 'subzone_boundaries',
        label: strings.SUBZONE_BOUNDARIES,
        optional: { completed: isCompleted('subzone_boundaries') },
      },
    ];
  }, [activeLocale, siteType, completedOptionalSteps]);

  const goToPlantingSites = () => {
    history.push(APP_PATHS.PLANTING_SITES);
  };

  const onCancel = () => {
    // TODO: confirm with user?
    goToPlantingSites();
  };

  const onSaveAndNext = () => {
    // TODO: save data here, alert user if data is missing
    if (currentStep === steps[steps.length - 1].type) {
      // this is the final step
      onSaveAndClose();
    } else {
      let stepIndex = 0;
      steps.forEach((step: PlantingSiteCreateStep, index: number) => {
        if (currentStep === step.type) {
          stepIndex = index;
        }
      });
      setCurrentStep(steps[stepIndex + 1].type);
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
    setCurrentStep(steps[0].type);
    setPlantingSite({ ...site });
    setCompletedOptionalSteps({} as Record<PlantingSiteCreateStepType, boolean>);
  };

  return (
    <TfMain>
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
        <Card style={{ display: 'flex', flexDirection: 'column', flexGrow: 1, marginTop: theme.spacing(4) }}>
          {currentStep === 'details' && <PlantingSiteDetails onChange={onChange} site={plantingSite} />}
          {currentStep === 'site_boundary' && <PlantingSiteBoundary onChange={onChange} site={plantingSite} />}
          {currentStep === 'exclusion_areas' && <PlantingSiteExclusions onChange={onChange} site={plantingSite} />}
          {currentStep === 'zone_boundaries' && <PlantingSiteZoneBoundaries onChange={onChange} site={plantingSite} />}
          {currentStep === 'subzone_boundaries' && (
            <PlantingSiteSubzoneBoundaries onChange={onChange} site={plantingSite} />
          )}
        </Card>
      </PlantingSiteCreateForm>
    </TfMain>
  );
}
