import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { Box, Grid, Typography, useTheme } from '@mui/material';
import { BusySpinner, Button, Message } from '@terraware/web-components';

import PageSnackbar from 'src/components/PageSnackbar';
import Card from 'src/components/common/Card';
import PageHeaderWrapper from 'src/components/common/PageHeaderWrapper';
import TextWithLink from 'src/components/common/TextWithLink';
import TfMain from 'src/components/common/TfMain';
import { APP_PATHS } from 'src/constants';
import useNavigateTo from 'src/hooks/useNavigateTo';
import { useSyncNavigate } from 'src/hooks/useSyncNavigate';
import { useLocalization } from 'src/providers';
import { usePlantingSiteData } from 'src/providers/Tracking/PlantingSiteContext';
import useDraftPlantingSiteCreate from 'src/scenes/PlantingSitesRouter/hooks/useDraftPlantingSiteCreate';
import useDraftPlantingSiteFinalize from 'src/scenes/PlantingSitesRouter/hooks/useDraftPlantingSiteFinalize';
import useDraftPlantingSiteUpdate from 'src/scenes/PlantingSitesRouter/hooks/useDraftPlantingSiteUpdate';
import strings from 'src/strings';
import { DraftPlantingSite, OptionalSiteEditStep } from 'src/types/PlantingSite';
import { SiteEditStep } from 'src/types/PlantingSite';
import { UpdatedPlantingSeason } from 'src/types/Tracking';
import useDeviceInfo from 'src/utils/useDeviceInfo';
import useForm from 'src/utils/useForm';
import useSnackbar from 'src/utils/useSnackbar';

import Details from './Details';
import Exclusions from './Exclusions';
import Form, { PlantingSiteStep } from './Form';
import SiteBoundary from './SiteBoundary';
import StartOverConfirmation from './StartOverConfirmation';
import Strata from './Strata';
import Substrata from './Substrata';
import { OnValidate } from './types';

export type EditorProps = {
  site: DraftPlantingSite;
};

/**
 * Check if user has already completed certain steps and mark them as completed.
 */
const initializeOptionalStepsStatus = (site: DraftPlantingSite): Record<OptionalSiteEditStep, boolean> => {
  const status: Record<OptionalSiteEditStep, boolean> = {
    exclusion_areas: false,
    stratum_boundaries: false,
    substratum_boundaries: false,
  };

  if (site.exclusion) {
    // if we have an exclusion, mark this optional step as completed
    status.exclusion_areas = true;
  }

  if (site.strata) {
    const numStrata = site.strata.length;
    const numSubstrata = site.strata.flatMap((stratum) => stratum.substrata).length;

    // if we have more than just the default stratum, mark this optional step as completed
    status.stratum_boundaries = numStrata > 1;
    // if we have more than just the default substrata, mark this optional step as completed
    status.substratum_boundaries = numSubstrata > numStrata;
  }

  return status;
};

export default function Editor(props: EditorProps): JSX.Element {
  const { site } = props;
  const { siteEditStep, siteType } = site;
  const { activeLocale } = useLocalization();
  const contentRef = useRef(null);
  const navigate = useSyncNavigate();
  const { goToPlantingSiteView } = useNavigateTo();
  const theme = useTheme();
  const { isMobile } = useDeviceInfo();
  const snackbar = useSnackbar();

  const [showPageMessage, setShowPageMessage] = useState<boolean>(true);
  const [onValidate, setOnValidate] = useState<OnValidate | undefined>();
  const [showStartOver, setShowStartOver] = useState<boolean>(false);
  const [currentStep, setCurrentStep] = useState<SiteEditStep>(siteEditStep);
  const [completedOptionalSteps, setCompletedOptionalSteps] = useState<Record<OptionalSiteEditStep, boolean>>(
    initializeOptionalStepsStatus(site)
  );
  const [plantingSite, setPlantingSite, onChange] = useForm({ ...site });
  const [plantingSeasons, setPlantingSeasons] = useState<UpdatedPlantingSeason[]>(site.plantingSeasons);

  const { reload } = usePlantingSiteData();

  const onFinalizeSuccess = useCallback(
    (plantingSiteId: number) => {
      reload();
      goToPlantingSiteView(plantingSiteId);
    },
    [goToPlantingSiteView, reload]
  );

  const onFinalizeError = useCallback(() => {
    snackbar.toastError(strings.GENERIC_ERROR);
  }, [snackbar]);

  /**
   * set up hooks to create/update a draft and also to create a planting site from draft
   */
  const { onFinishCreate, createDraft, createDraftStatus, createdDraft } = useDraftPlantingSiteCreate();
  const { onFinishUpdate, updateDraft, updateDraftStatus, updatedDraft } = useDraftPlantingSiteUpdate();
  const { finalize, isPending } = useDraftPlantingSiteFinalize(onFinalizeSuccess, onFinalizeError);

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

    const isCompleted = (optionalStep: OptionalSiteEditStep) => completedOptionalSteps[optionalStep] ?? false;

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
        type: 'stratum_boundaries',
        label: strings.STRATUM_BOUNDARIES,
        optional: { completed: isCompleted('stratum_boundaries') },
      },
      {
        type: 'substratum_boundaries',
        label: strings.SUBSTRATUM_BOUNDARIES,
        optional: { completed: isCompleted('substratum_boundaries') },
      },
    ];
  }, [activeLocale, isSimpleSite, completedOptionalSteps]);

  const goToPlantingSites = useCallback(() => {
    if (plantingSite.id !== -1) {
      navigate(APP_PATHS.PLANTING_SITES_DRAFT_VIEW.replace(':plantingSiteId', `${plantingSite.id}`));
    } else {
      navigate(APP_PATHS.PLANTING_SITES);
    }
  }, [navigate, plantingSite.id]);

  const getCurrentStepIndex = useCallback((): number => {
    let stepIndex = 0;
    steps.find((step: PlantingSiteStep, index: number) => {
      if (currentStep === step.type) {
        stepIndex = index;
        return true;
      }
      return false;
    });

    return stepIndex;
  }, [currentStep, steps]);

  const onCancel = useCallback(() => {
    // TODO: confirm with user?
    goToPlantingSites();
  }, [goToPlantingSites]);

  const onSave = useCallback(
    (close: boolean) => () => {
      // wait for component to return
      if (onValidate) {
        return;
      }
      setOnValidate({
        isSaveAndClose: close,
        apply: (hasErrors: boolean, data?: Partial<DraftPlantingSite>, isOptionalCompleted?: boolean) => {
          setOnValidate(undefined);
          if (!hasErrors) {
            const isLastStep = currentStep === steps[steps.length - 1].type;
            const redirect = close || isLastStep;
            // if user hits Save&Close we want to bring user back to the same step in the flow on next visit
            const nextStep = redirect ? currentStep : steps[getCurrentStepIndex() + 1].type;

            const draft: DraftPlantingSite = {
              ...plantingSite,
              ...(data ?? {}),
              plantingSeasons: plantingSeasons.map((season: UpdatedPlantingSeason) => ({ ...season, id: -1 })),
              siteEditStep: nextStep,
            };

            if (plantingSite.id === -1) {
              // new site
              createDraft({ draft, nextStep }, redirect);
            } else if (isLastStep && !close) {
              // user is done with create wizard, create the site and delete the draft
              finalize(draft);
            } else {
              // update the draft
              const optionalSteps =
                isOptionalCompleted !== undefined
                  ? { ...completedOptionalSteps, [currentStep]: isOptionalCompleted }
                  : undefined;
              updateDraft({ draft, nextStep, optionalSteps }, redirect);
            }
          }
        },
      });
    },
    [
      completedOptionalSteps,
      createDraft,
      currentStep,
      finalize,
      getCurrentStepIndex,
      onValidate,
      plantingSeasons,
      plantingSite,
      steps,
      updateDraft,
    ]
  );

  /**
   * On start over, data is reset to clear all boundaries and only keep the details information.
   * Optional steps completion state is reset.
   * User is taken back to 'site_boundary' step, if the update succeeds.
   */
  const onStartOver = useCallback(() => {
    const nextStep = 'site_boundary';
    const redirect = false;

    const draft: DraftPlantingSite = {
      ...plantingSite,
      // start over only resets the polygonal information
      // edits to name, description, planting seasons and project are preserved
      boundary: undefined,
      exclusion: undefined,
      strata: undefined,
      siteEditStep: nextStep,
    };

    const optionalSteps = initializeOptionalStepsStatus(draft);

    updateDraft({ draft, nextStep, optionalSteps }, redirect);
    setShowStartOver(false);
  }, [plantingSite, updateDraft]);

  const onOpenStartOver = useCallback(() => setShowStartOver(true), []);
  const onCloseStartOver = useCallback(() => setShowStartOver(false), []);
  const onClosePageMessage = useCallback(() => setShowPageMessage(false), []);

  const pageMessage = useMemo<JSX.Element | null>(() => {
    if (showPageMessage && !isSimpleSite && currentStep === 'details') {
      return (
        <Box>
          <TextWithLink href={APP_PATHS.HELP_SUPPORT} text={strings.PLANTING_SITE_CREATE_DETAILED_HELP} />
        </Box>
      );
    } else {
      return null;
    }
  }, [currentStep, isSimpleSite, showPageMessage]);

  return (
    <TfMain>
      {isPending && <BusySpinner withSkrim={true} />}
      {(createDraftStatus === 'pending' || updateDraftStatus === 'pending') && <BusySpinner />}
      {showStartOver && <StartOverConfirmation onClose={onCloseStartOver} onConfirm={onStartOver} />}
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
          onSaveAndNext={onSave(false)}
          onSaveAndClose={onSave(true)}
          onStartOver={onOpenStartOver}
          steps={steps}
          style={{
            display: 'flex',
            flexDirection: 'column',
            flexGrow: 1,
          }}
        >
          {pageMessage && (
            <Box marginTop={theme.spacing(6)}>
              <Message
                body={pageMessage}
                onClose={onClosePageMessage}
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
            {currentStep === 'site_boundary' && <SiteBoundary onValidate={onValidate} site={plantingSite} />}
            {currentStep === 'exclusion_areas' && <Exclusions onValidate={onValidate} site={plantingSite} />}
            {currentStep === 'stratum_boundaries' && <Strata onValidate={onValidate} site={plantingSite} />}
            {currentStep === 'substratum_boundaries' && <Substrata onValidate={onValidate} site={plantingSite} />}
          </Card>
        </Form>
      )}
    </TfMain>
  );
}
