import { useMemo, useRef, useState } from 'react';
import { makeStyles } from '@mui/styles';
import { useHistory } from 'react-router-dom';
import { FeatureCollection } from 'geojson';
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
import { toMultiPolygonArray } from 'src/components/Map/utils';
import PageHeaderWrapper from 'src/components/common/PageHeaderWrapper';
import PlantingSiteForm, { PlantingSiteStep, PlantingSiteStepType } from './PlantingSiteForm';
import PlantingSiteDetails from './PlantingSiteDetails';
import PlantingSiteBoundary from './PlantingSiteBoundary';
import PlantingSiteExclusions from './PlantingSiteExclusions';
import PlantingSiteZoneBoundaries from './PlantingSiteZoneBoundaries';
import PlantingSiteSubzoneBoundaries from './PlantingSiteSubzoneBoundaries';

type PlantingSiteEditorProps = {
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

export default function PlantingSiteEditor(props: PlantingSiteEditorProps): JSX.Element {
  const { reloadPlantingSites, site, siteType } = props;
  const { activeLocale } = useLocalization();
  const contentRef = useRef(null);
  const history = useHistory();
  const theme = useTheme();
  const snackbar = useSnackbar();
  const classes = useStyles();

  const [siteBoundary, setSiteBoundary] = useState<FeatureCollection | undefined>();
  const [exclusions, setExclusions] = useState<FeatureCollection | undefined>();
  const [currentStep, setCurrentStep] = useState<PlantingSiteStepType>('details');
  const [completedOptionalSteps, setCompletedOptionalSteps] = useState<Record<PlantingSiteStepType, boolean>>(
    {} as Record<PlantingSiteStepType, boolean>
  );
  const [plantingSite, setPlantingSite, onChange] = useForm({ ...site });

  const steps = useMemo<PlantingSiteStep[]>(() => {
    if (!activeLocale) {
      return [];
    }

    const isCompleted = (optionalStep: PlantingSiteStepType) => completedOptionalSteps[optionalStep] ?? false;

    const simpleSiteSteps: PlantingSiteStep[] = [
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

  const getCurrentStepIndex = (): number => {
    let stepIndex = 0;
    steps.find((step: PlantingSiteStep, index: number) => {
      if (currentStep === step.type) {
        stepIndex = index;
        return true;
      }
      return false;
    });

    return stepIndex;
  };

  const onCancel = () => {
    // TODO: confirm with user?
    goToPlantingSites();
  };

  const saveSiteBoundary = (): boolean => {
    if (!siteBoundary) {
      // string is wip
      snackbar.toastError('please draw a site boundary');
      return false;
    }
    onChange('boundary', toMultiPolygonArray(siteBoundary)?.[0]);
    setSiteBoundary(undefined);
    return true;
  };

  const saveExclusionAreas = (): boolean => true;

  const onSaveAndNext = () => {
    // TODO: save data here, alert user if data is missing
    if (currentStep === steps[steps.length - 1].type) {
      // this is the final step
      onSaveAndClose();
    } else {
      if (currentStep === 'site_boundary' && !saveSiteBoundary()) {
        return;
      }
      if (currentStep === 'exclusion_areas' && !saveExclusionAreas()) {
        return;
      }
      setCurrentStep(steps[getCurrentStepIndex() + 1].type);
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
    setCompletedOptionalSteps({} as Record<PlantingSiteStepType, boolean>);
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
      <PlantingSiteForm
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
          {currentStep === 'site_boundary' && (
            <PlantingSiteBoundary boundary={siteBoundary} setBoundary={setSiteBoundary} />
          )}
          {currentStep === 'exclusion_areas' && (
            <PlantingSiteExclusions boundary={exclusions} setBoundary={setExclusions} site={plantingSite} />
          )}
          {currentStep === 'zone_boundaries' && <PlantingSiteZoneBoundaries onChange={onChange} site={plantingSite} />}
          {currentStep === 'subzone_boundaries' && (
            <PlantingSiteSubzoneBoundaries onChange={onChange} site={plantingSite} />
          )}
        </Card>
      </PlantingSiteForm>
    </TfMain>
  );
}
