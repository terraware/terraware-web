import { useMemo, useRef, useState } from 'react';
import _ from 'lodash';
import { makeStyles } from '@mui/styles';
import { useHistory } from 'react-router-dom';
import { Box, Typography, useTheme } from '@mui/material';
import { Message } from '@terraware/web-components';
import strings from 'src/strings';
import { PlantingSite, UpdatedPlantingSeason } from 'src/types/Tracking';
import { SiteType } from 'src/types/PlantingSite';
import { APP_PATHS } from 'src/constants';
import { useLocalization } from 'src/providers';
import { useDocLinks } from 'src/docLinks';
import useSnackbar from 'src/utils/useSnackbar';
import useForm from 'src/utils/useForm';
import TfMain from 'src/components/common/TfMain';
import TextWithLink from 'src/components/common/TextWithLink';
import Card from 'src/components/common/Card';
import PageHeaderWrapper from 'src/components/common/PageHeaderWrapper';
import PageSnackbar from 'src/components/PageSnackbar';
import Form, { PlantingSiteStep, PlantingSiteStepType } from './Form';
import Details from './Details';
import SiteBoundary from './SiteBoundary';
import Exclusions from './Exclusions';
import Zones from './Zones';
import Subzones from './Subzones';
import StartOverConfirmation from './StartOverConfirmation';

type EditorProps = {
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

export default function Editor(props: EditorProps): JSX.Element {
  const { reloadPlantingSites, site, siteType } = props;
  const { activeLocale } = useLocalization();
  const contentRef = useRef(null);
  const history = useHistory();
  const theme = useTheme();
  const snackbar = useSnackbar();
  const classes = useStyles();
  const docLinks = useDocLinks();

  const [showPageMessage, setShowPageMessage] = useState<boolean>(true);
  const [onValidate, setOnValidate] = useState<
    ((hasErrors: boolean, isOptionalCompleted?: boolean) => void) | undefined
  >();
  const [showStartOver, setShowStartOver] = useState<boolean>(false);
  const [currentStep, setCurrentStep] = useState<PlantingSiteStepType>('details');
  const [completedOptionalSteps, setCompletedOptionalSteps] = useState<Record<PlantingSiteStepType, boolean>>(
    {} as Record<PlantingSiteStepType, boolean>
  );
  const [plantingSite, setPlantingSite, onChange] = useForm({ ...site });
  const [plantingSeasons, setPlantingSeasons] = useState<UpdatedPlantingSeason[]>();

  const isSimpleSite = useMemo<boolean>(() => siteType === 'simple', [siteType]);

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

    if (isSimpleSite) {
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
  }, [activeLocale, isSimpleSite, completedOptionalSteps]);

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

  const saveSite = async (): Promise<PlantingSite | undefined> => {
    // TODO save site and update site state
    // return undefined if error and toast error
    return plantingSite;
  };

  const onSave = (close: boolean) => {
    // wait for component to return
    if (onValidate) {
      return;
    }
    setOnValidate(() => async (hasErrors: boolean, isOptionalCompleted?: boolean) => {
      setOnValidate(undefined);
      if (!hasErrors) {
        const closeEditor = close || currentStep === steps[steps.length - 1].type;
        const savedSite = await saveSite();
        if (!savedSite) {
          return;
        }
        if (closeEditor) {
          snackbar.toastSuccess(strings.SAVED);
          reloadPlantingSites();
          // TODO go to saved site
          goToPlantingSites();
        } else {
          // update state of optional step for the stepper visualization
          if (isOptionalCompleted !== undefined) {
            setCompletedOptionalSteps((current: Record<PlantingSiteStepType, boolean>) => ({
              ...current,
              [currentStep]: isOptionalCompleted,
            }));
          }
          setCurrentStep(steps[getCurrentStepIndex() + 1].type);
        }
      }
    });
  };

  const onStartOver = () => {
    setCurrentStep('site_boundary');
    setPlantingSite((current: PlantingSite) => ({
      ...current,
      // start over only resets the polygonal information
      // edits to name, description, planting seasons and project are preserved
      boundary: _.cloneDeep(site.boundary),
      exclusion: _.cloneDeep(site.exclusion),
      plantingZones: _.cloneDeep(site.plantingZones),
    }));
    setCompletedOptionalSteps({} as Record<PlantingSiteStepType, boolean>);
    setShowStartOver(false);
  };

  const pageMessage = useMemo<JSX.Element | null>(() => {
    if (showPageMessage && !isSimpleSite && currentStep === 'details') {
      return (
        <Box>
          <TextWithLink href={docLinks.contact_us} isExternal text={strings.PLANTING_SITE_CREATE_DETAILED_HELP} />
        </Box>
      );
    } else {
      return null;
    }
  }, [currentStep, docLinks, isSimpleSite, showPageMessage]);

  return (
    <TfMain>
      {showStartOver && <StartOverConfirmation onClose={() => setShowStartOver(false)} onConfirm={onStartOver} />}
      <PageHeaderWrapper nextElement={contentRef.current}>
        <Box sx={{ padding: theme.spacing(0, 0, 4, 3), display: 'flex' }}>
          <Typography fontSize='24px' fontWeight={600}>
            {strings.ADD_PLANTING_SITE}
          </Typography>
        </Box>
      </PageHeaderWrapper>
      <Form
        currentStep={currentStep}
        onCancel={onCancel}
        onSaveAndNext={() => onSave(false)}
        onSaveAndClose={() => onSave(true)}
        onStartOver={() => setShowStartOver(true)}
        steps={steps}
        className={classes.container}
      >
        <PageSnackbar />
        {pageMessage && (
          <Box marginTop={theme.spacing(6)}>
            <Message
              body={pageMessage}
              onClose={() => setShowPageMessage(false)}
              priority='info'
              showCloseButton
              title={strings.PLANTING_SITE_CREATE_DETAILED_TITLE}
              type='page'
            />
          </Box>
        )}
        <Card style={{ display: 'flex', flexDirection: 'column', flexGrow: 1, marginTop: theme.spacing(4) }}>
          {currentStep === 'details' && (
            <Details
              onChange={onChange}
              onValidate={onValidate}
              plantingSeasons={plantingSeasons}
              setPlantingSeasons={setPlantingSeasons}
              setPlantingSite={setPlantingSite}
              site={plantingSite}
            />
          )}
          {currentStep === 'site_boundary' && (
            <SiteBoundary isSimpleSite={isSimpleSite} onChange={onChange} onValidate={onValidate} site={plantingSite} />
          )}
          {currentStep === 'exclusion_areas' && (
            <Exclusions onChange={onChange} onValidate={onValidate} site={plantingSite} />
          )}
          {currentStep === 'zone_boundaries' && (
            <Zones onChange={onChange} onValidate={onValidate} site={plantingSite} />
          )}
          {currentStep === 'subzone_boundaries' && (
            <Subzones onChange={onChange} onValidate={onValidate} site={plantingSite} />
          )}
        </Card>
      </Form>
    </TfMain>
  );
}
