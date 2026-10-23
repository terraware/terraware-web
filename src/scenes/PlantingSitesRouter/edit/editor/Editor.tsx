import React, { type JSX, useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { Box, Grid, Typography, useMediaQuery, useTheme } from '@mui/material';
import { BusySpinner, Button, Message } from '@terraware/web-components';

import PageSnackbar from 'src/components/PageSnackbar';
import Card from 'src/components/common/Card';
import PageHeaderWrapper from 'src/components/common/PageHeaderWrapper';
import TfMain from 'src/components/common/TfMain';
import UnsavedChangesBadge from 'src/components/common/UnsavedChangesBadge';
import { APP_PATHS } from 'src/constants';
import useNavigateTo from 'src/hooks/useNavigateTo';
import { useSyncNavigate } from 'src/hooks/useSyncNavigate';
import { useLocalization } from 'src/providers';
import { clearSnackbar } from 'src/redux/features/snackbar/snackbarSlice';
import { useAppDispatch } from 'src/redux/store';
import useDraftPlantingSiteFinalize from 'src/scenes/PlantingSitesRouter/hooks/useDraftPlantingSiteFinalize';
import useDraftPlantingSiteUpdate from 'src/scenes/PlantingSitesRouter/hooks/useDraftPlantingSiteUpdate';
import strings from 'src/strings';
import { DraftPlantingSite, OptionalSiteEditStep, SiteEditStep } from 'src/types/PlantingSite';
import useDeviceInfo from 'src/utils/useDeviceInfo';
import useSnackbar from 'src/utils/useSnackbar';

import CloseSetupConfirmation from './CloseSetupConfirmation';
import { EditorStepperContext, PlantingSiteStep } from './EditorStepper';
import Exclusions from './Exclusions';
import SiteBoundary from './SiteBoundary';
import StartOverConfirmation from './StartOverConfirmation';
import Strata from './Strata';
import Substrata from './Substrata';
import { OnValidate } from './types';

type SaveAction = 'back' | 'draft' | 'next';

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
  const [contentElement, setContentElement] = useState<HTMLElement | null>(null);
  const contentRef = useCallback((node: HTMLElement | null) => setContentElement(node), []);
  const navigate = useSyncNavigate();
  const { goToPlantingSiteView } = useNavigateTo();
  const theme = useTheme();
  const { isDesktop } = useDeviceInfo();
  const isNarrowPortrait = useMediaQuery('(min-width: 768px) and (max-width: 1439px) and (orientation: portrait)');
  const isEditorAvailable = isDesktop && !isNarrowPortrait;
  const snackbar = useSnackbar();
  const dispatch = useAppDispatch();

  const [onValidate, setOnValidate] = useState<OnValidate | undefined>();
  const [showStartOver, setShowStartOver] = useState<boolean>(false);
  const startOverDraft = useRef<DraftPlantingSite>(undefined);
  const [startOverCount, setStartOverCount] = useState(0);
  const [currentStep, setCurrentStep] = useState<SiteEditStep>(siteEditStep);
  const [completedOptionalSteps, setCompletedOptionalSteps] = useState<Record<OptionalSiteEditStep, boolean>>(
    initializeOptionalStepsStatus(site)
  );
  const [isDirty, setIsDirty] = useState(false);
  const [plantingSite, setPlantingSite] = useState(site);
  const [showCloseConfirmation, setShowCloseConfirmation] = useState<boolean>(false);
  const [stepperCollapsed, setStepperCollapsed] = useState<boolean>(false);

  const onFinalizeSuccess = useCallback(
    (plantingSiteId: number) => {
      goToPlantingSiteView(plantingSiteId);
    },
    [goToPlantingSiteView]
  );

  const onFinalizeError = useCallback(() => {
    snackbar.toastError(strings.GENERIC_ERROR);
  }, [snackbar]);

  /**
   * set up hooks to update a draft and also to create a planting site from draft
   */
  const { onFinishUpdate, updateDraft, isUpdating, updatedDraft } = useDraftPlantingSiteUpdate();
  const { finalize, isPending } = useDraftPlantingSiteFinalize(onFinalizeSuccess, onFinalizeError);

  // update local state when draft is updated
  useEffect(() => {
    if (updatedDraft) {
      setPlantingSite(updatedDraft.draft);
      setIsDirty(false);
      setCurrentStep(updatedDraft.nextStep);
      if (updatedDraft.optionalSteps) {
        setCompletedOptionalSteps(updatedDraft.optionalSteps);
      }
      if (updatedDraft.draft === startOverDraft.current) {
        setStartOverCount((count) => count + 1);
      }
      onFinishUpdate();
    }
  }, [updatedDraft, onFinishUpdate]);

  const isSimpleSite = useMemo<boolean>(() => siteType === 'simple', [siteType]);

  const steps = useMemo<PlantingSiteStep[]>(() => {
    if (!activeLocale) {
      return [];
    }

    const isCompleted = (optionalStep: OptionalSiteEditStep) => completedOptionalSteps[optionalStep] ?? false;

    const simpleSiteSteps: PlantingSiteStep[] = [
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
    navigate(APP_PATHS.PLANTING_SITES_DRAFT_VIEW.replace(':plantingSiteId', `${plantingSite.id}`));
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

  const onClose = useCallback(() => {
    if (isDirty) {
      setShowCloseConfirmation(true);
    } else {
      goToPlantingSites();
    }
  }, [goToPlantingSites, isDirty]);

  const onKeepEditing = useCallback(() => setShowCloseConfirmation(false), []);

  const onSave = useCallback(
    (action: SaveAction) => () => {
      // wait for component to return
      if (onValidate) {
        return;
      }
      const stepIndex = getCurrentStepIndex();
      const isLastStep = stepIndex === steps.length - 1;
      const isFinalizing = action === 'next' && isLastStep;
      const redirect = action === 'draft' || isFinalizing;

      const getNextStep = (): SiteEditStep => {
        if (action === 'back') {
          return steps[stepIndex - 1].type;
        }
        // if user saves a draft we want to bring user back to the same step in the flow on next visit
        return redirect ? currentStep : steps[stepIndex + 1].type;
      };

      setOnValidate({
        allowIncomplete: action !== 'next',
        apply: (hasErrors: boolean, data?: Partial<DraftPlantingSite>) => {
          setOnValidate(undefined);
          if (!hasErrors) {
            const nextStep = getNextStep();
            const draft: DraftPlantingSite = {
              ...plantingSite,
              ...(data ?? {}),
              siteEditStep: nextStep,
            };

            if (isFinalizing) {
              // user is done with create wizard, create the site and delete the draft
              finalize(draft);
            } else {
              updateDraft({ draft, nextStep, optionalSteps: initializeOptionalStepsStatus(draft) }, redirect);
            }
          }
        },
      });
    },
    [currentStep, finalize, getCurrentStepIndex, onValidate, plantingSite, steps, updateDraft]
  );

  const onBack = useCallback(() => {
    if (isDirty) {
      onSave('back')();
    } else {
      setCurrentStep(steps[getCurrentStepIndex() - 1].type);
    }
  }, [getCurrentStepIndex, isDirty, onSave, steps]);

  const onSaveAsDraft = useCallback(() => {
    setShowCloseConfirmation(false);
    onSave('draft')();
  }, [onSave]);

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
      boundarySource: undefined,
      exclusion: undefined,
      strata: undefined,
      siteEditStep: nextStep,
    };

    const optionalSteps = initializeOptionalStepsStatus(draft);

    startOverDraft.current = draft;
    updateDraft({ draft, nextStep, optionalSteps }, redirect);
    setShowStartOver(false);
  }, [plantingSite, updateDraft]);

  const onOpenStartOver = useCallback(() => {
    dispatch(clearSnackbar({ type: 'toast' }));
    setShowStartOver(true);
  }, [dispatch]);
  const onCloseStartOver = useCallback(() => setShowStartOver(false), []);
  const onHeaderButtonClick = useCallback(() => dispatch(clearSnackbar({ type: 'toast' })), [dispatch]);
  const onToggleStepperCollapsed = useCallback(() => setStepperCollapsed((collapsed) => !collapsed), []);

  const busy = isUpdating || isPending || !!onValidate;
  const onFinalStep = getCurrentStepIndex() === steps.length - 1;
  const onNext = useMemo(() => onSave('next'), [onSave]);
  const showStartOverButton = currentStep !== 'site_boundary' || !!plantingSite.boundary;
  const onStepperBack = useCallback(() => {
    dispatch(clearSnackbar({ type: 'toast' }));
    onBack();
  }, [dispatch, onBack]);
  const onStepperNext = useCallback(() => {
    dispatch(clearSnackbar({ type: 'toast' }));
    onNext();
  }, [dispatch, onNext]);
  const stepperContext = useMemo(
    () => ({
      busy,
      collapsed: stepperCollapsed,
      currentStep,
      onBack: onStepperBack,
      onNext: onStepperNext,
      onStartOver: showStartOverButton ? onOpenStartOver : undefined,
      onToggleCollapsed: onToggleStepperCollapsed,
      steps,
    }),
    [
      busy,
      currentStep,
      onOpenStartOver,
      onStepperBack,
      onStepperNext,
      onToggleStepperCollapsed,
      showStartOverButton,
      stepperCollapsed,
      steps,
    ]
  );

  return (
    <TfMain>
      {isPending && <BusySpinner withSkrim={true} />}
      {isUpdating && <BusySpinner />}
      {showStartOver && <StartOverConfirmation onClose={onCloseStartOver} onConfirm={onStartOver} />}
      {showCloseConfirmation && (
        <CloseSetupConfirmation
          onDiscard={goToPlantingSites}
          onKeepEditing={onKeepEditing}
          onSaveAsDraft={onSaveAsDraft}
          siteName={plantingSite.name.trim()}
        />
      )}
      <PageHeaderWrapper
        alwaysVisible={isEditorAvailable}
        elevated={isEditorAvailable && isDirty}
        nextElement={contentElement}
      >
        <Box
          padding={theme.spacing(0, 0, 2, 3)}
          display='flex'
          alignItems='center'
          justifyContent='space-between'
          flexWrap='wrap'
          gap={theme.spacing(1.5)}
        >
          <Box display='flex' alignItems='center' flexWrap='wrap' gap={theme.spacing(1.5)}>
            <Typography fontSize='24px' fontWeight={600}>
              {strings.ADD_PLANTING_SITE}
            </Typography>
            {isDirty && <UnsavedChangesBadge />}
          </Box>
          {isEditorAvailable && (
            <Box
              display='flex'
              alignItems='center'
              flexWrap='wrap'
              justifyContent='flex-end'
              gap={theme.spacing(1)}
              onClickCapture={onHeaderButtonClick}
            >
              <Button
                id='close-planting-site-create'
                label={strings.CLOSE}
                onClick={onClose}
                disabled={busy}
                priority='secondary'
                type='passive'
                size='medium'
              />
              <Button
                id='save-planting-site-create'
                label={strings.CREATE_PLANTING_SITE}
                onClick={onNext}
                disabled={busy || !onFinalStep}
                size='medium'
              />
            </Box>
          )}
        </Box>
      </PageHeaderWrapper>
      <Grid ref={contentRef} size={12}>
        <PageSnackbar />
      </Grid>
      {!isEditorAvailable && (
        <Message
          body={isNarrowPortrait ? strings.SITE_EDITOR_USE_TABLET_LANDSCAPE : strings.SITE_EDITOR_USE_DESKTOP}
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
      {isEditorAvailable && (
        <EditorStepperContext.Provider value={stepperContext}>
          <Card
            radius={theme.spacing(1)}
            style={{
              display: 'flex',
              flexDirection: 'column',
              flexGrow: 1,
              marginTop: theme.spacing(2),
              position: 'relative',
            }}
          >
            {currentStep === 'site_boundary' && (
              <SiteBoundary
                key={startOverCount}
                onDirtyChange={setIsDirty}
                onValidate={onValidate}
                site={plantingSite}
              />
            )}
            {currentStep === 'exclusion_areas' && (
              <Exclusions onDirtyChange={setIsDirty} onValidate={onValidate} site={plantingSite} />
            )}
            {currentStep === 'stratum_boundaries' && (
              <Strata onDirtyChange={setIsDirty} onValidate={onValidate} site={plantingSite} />
            )}
            {currentStep === 'substratum_boundaries' && (
              <Substrata onDirtyChange={setIsDirty} onValidate={onValidate} site={plantingSite} />
            )}
          </Card>
        </EditorStepperContext.Provider>
      )}
    </TfMain>
  );
}
