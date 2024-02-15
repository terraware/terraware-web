import { useEffect, useMemo, useRef, useState } from 'react';
import { makeStyles } from '@mui/styles';
import { useHistory } from 'react-router-dom';
import { Box, Grid, Typography, useTheme } from '@mui/material';
import { BusySpinner, Button, Message } from '@terraware/web-components';
import strings from 'src/strings';
import { PlantingSeason, UpdatedPlantingSeason } from 'src/types/Tracking';
import { DraftPlantingSite } from 'src/types/PlantingSite';
import { SiteEditStep } from 'src/types/PlantingSite';
import { APP_PATHS } from 'src/constants';
import { useLocalization } from 'src/providers';
import { useDocLinks } from 'src/docLinks';
import useDeviceInfo from 'src/utils/useDeviceInfo';
import useForm from 'src/utils/useForm';
import TfMain from 'src/components/common/TfMain';
import TextWithLink from 'src/components/common/TextWithLink';
import Card from 'src/components/common/Card';
import PageHeaderWrapper from 'src/components/common/PageHeaderWrapper';
import PageSnackbar from 'src/components/PageSnackbar';
import usePlantingSiteCreate from 'src/scenes/PlantingSitesRouter/hooks/usePlantingSiteCreate';
import useDraftPlantingSiteCreate from 'src/scenes/PlantingSitesRouter/hooks/useDraftPlantingSiteCreate';
import useDraftPlantingSiteUpdate from 'src/scenes/PlantingSitesRouter/hooks/useDraftPlantingSiteUpdate';
import Form, { PlantingSiteStep } from './Form';
import Details from './Details';
import SiteBoundary from './SiteBoundary';
import Exclusions from './Exclusions';
import Zones from './Zones';
import Subzones from './Subzones';
import StartOverConfirmation from './StartOverConfirmation';

export type EditorProps = {
  site: DraftPlantingSite;
};

const useStyles = makeStyles(() => ({
  container: {
    display: 'flex',
    flexDirection: 'column',
    flexGrow: 1,
  },
}));

export default function Editor(props: EditorProps): JSX.Element {
  const { site } = props;
  const { siteEditStep, siteType } = site;
  const { activeLocale } = useLocalization();
  const contentRef = useRef(null);
  const history = useHistory();
  const theme = useTheme();
  const classes = useStyles();
  const docLinks = useDocLinks();
  const { isMobile } = useDeviceInfo();

  const [showPageMessage, setShowPageMessage] = useState<boolean>(true);
  const [onValidate, setOnValidate] = useState<
    ((hasErrors: boolean, data?: Partial<DraftPlantingSite>, isOptionalCompleted?: boolean) => void) | undefined
  >();
  const [showStartOver, setShowStartOver] = useState<boolean>(false);
  const [currentStep, setCurrentStep] = useState<SiteEditStep>(siteEditStep);
  const [completedOptionalSteps, setCompletedOptionalSteps] = useState<Record<SiteEditStep, boolean>>(
    {} as Record<SiteEditStep, boolean>
  );
  const [plantingSite, setPlantingSite, onChange] = useForm({ ...site });
  const [plantingSeasons, setPlantingSeasons] = useState<UpdatedPlantingSeason[]>(site.plantingSeasons);

  /**
   * set up hooks to create/update a draft and also to create a planting site from draft
   */
  const { onFinishCreate, createDraft, createDraftStatus, createdDraft } = useDraftPlantingSiteCreate();
  const { onFinishUpdate, updateDraft, updateDraftStatus, updatedDraft } = useDraftPlantingSiteUpdate();
  const { createPlantingSite, createPlantingSiteStatus } = usePlantingSiteCreate();

  // update local state when draft is created
  useEffect(() => {
    if (createdDraft) {
      setPlantingSite(createdDraft.draft);
      setCurrentStep(createdDraft.nextStep);
      onFinishCreate();
    }
  }, [createdDraft, onFinishCreate, setPlantingSite]);

  // update local state when draft is updated
  useEffect(() => {
    if (updatedDraft) {
      setPlantingSite(updatedDraft.draft);
      setCurrentStep(updatedDraft.nextStep);
      if (updatedDraft.optionalSteps) {
        setCompletedOptionalSteps(updatedDraft.optionalSteps);
      }
      onFinishUpdate();
    }
  }, [updatedDraft, onFinishUpdate, setPlantingSite]);

  const isSimpleSite = useMemo<boolean>(() => siteType === 'simple', [siteType]);

  const steps = useMemo<PlantingSiteStep[]>(() => {
    if (!activeLocale) {
      return [];
    }

    const isCompleted = (optionalStep: SiteEditStep) => completedOptionalSteps[optionalStep] ?? false;

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

  const getPlantingSeasonsToSave = (): PlantingSeason[] =>
    plantingSeasons.map((season: UpdatedPlantingSeason) => ({ ...season, id: -1 }));

  const onCancel = () => {
    // TODO: confirm with user?
    goToPlantingSites();
  };

  const onSave = (close: boolean) => {
    // wait for component to return
    if (onValidate) {
      return;
    }
    setOnValidate(() => (hasErrors: boolean, data?: Partial<DraftPlantingSite>, isOptionalCompleted?: boolean) => {
      setOnValidate(undefined);
      if (!hasErrors) {
        const isLastStep = currentStep === steps[steps.length - 1].type;
        const redirect = close || isLastStep;
        // if user hits Save&Close we want to bring user back to the same step in the flow on next visit
        const nextStep = redirect ? currentStep : steps[getCurrentStepIndex() + 1].type;

        const draft: DraftPlantingSite = {
          ...plantingSite,
          ...(data ?? {}),
          plantingSeasons: getPlantingSeasonsToSave(),
          siteEditStep: nextStep,
        };

        if (plantingSite.id === -1) {
          // new site
          createDraft({ draft, nextStep }, redirect);
        } else if (isLastStep && !close) {
          // user is done with create wizard, create planting site off draft and delete the draft
          createPlantingSite(draft);
        } else {
          // update the draft
          const optionalSteps =
            isOptionalCompleted !== undefined
              ? { ...completedOptionalSteps, [currentStep]: isOptionalCompleted }
              : undefined;
          updateDraft({ draft, nextStep, optionalSteps }, redirect);
        }
      }
    });
  };

  /**
   * On start over, data is reset to clear all boundaries and only keep the details information.
   * Optional steps completion state is reset.
   * User is taken back to 'site_boundary' step, if the update succeeds.
   */
  const onStartOver = () => {
    const nextStep = 'site_boundary';
    const optionalSteps = {} as Record<SiteEditStep, boolean>;
    const redirect = false;

    const draft: DraftPlantingSite = {
      ...plantingSite,
      // start over only resets the polygonal information
      // edits to name, description, planting seasons and project are preserved
      boundary: undefined,
      exclusion: undefined,
      plantingZones: undefined,
      siteEditStep: nextStep,
    };

    updateDraft({ draft, nextStep, optionalSteps }, redirect);
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
      {createPlantingSiteStatus === 'pending' && <BusySpinner withSkrim={true} />}
      {(createDraftStatus === 'pending' || updateDraftStatus === 'pending') && <BusySpinner />}
      {showStartOver && <StartOverConfirmation onClose={() => setShowStartOver(false)} onConfirm={onStartOver} />}
      <PageHeaderWrapper nextElement={contentRef.current}>
        <Box sx={{ padding: theme.spacing(0, 0, 4, 3), display: 'flex' }}>
          <Typography fontSize='24px' fontWeight={600}>
            {strings.ADD_PLANTING_SITE}
          </Typography>
        </Box>
      </PageHeaderWrapper>
      <Grid item xs={12}>
        <PageSnackbar />
      </Grid>
      {isMobile && (
        <Message
          body={strings.SITE_EDITOR_USE_DESKTOP}
          priority='info'
          type='page'
          pageButtons={[
            <Button
              key={0}
              label={strings.GO_TO_PLANTING_SITES}
              onClick={goToPlantingSites}
              priority='secondary'
              size='small'
              type='passive'
            />,
          ]}
        />
      )}
      {!isMobile && (
        <Form
          currentStep={currentStep}
          onCancel={onCancel}
          onSaveAndNext={() => onSave(false)}
          onSaveAndClose={() => onSave(true)}
          onStartOver={() => setShowStartOver(true)}
          steps={steps}
          className={classes.container}
        >
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
              <SiteBoundary isSimpleSite={isSimpleSite} onValidate={onValidate} site={plantingSite} />
            )}
            {currentStep === 'exclusion_areas' && <Exclusions onValidate={onValidate} site={plantingSite} />}
            {currentStep === 'zone_boundaries' && <Zones onValidate={onValidate} site={plantingSite} />}
            {currentStep === 'subzone_boundaries' && <Subzones onValidate={onValidate} site={plantingSite} />}
          </Card>
        </Form>
      )}
    </TfMain>
  );
}
