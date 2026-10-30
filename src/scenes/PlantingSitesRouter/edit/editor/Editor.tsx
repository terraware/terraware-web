import React, { type JSX, useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { BusySpinner, Button } from '@terraware/web-components';

import { APP_PATHS } from 'src/constants';
import { useSyncNavigate } from 'src/hooks/useSyncNavigate';
import useDraftPlantingSiteFinalize from 'src/scenes/PlantingSitesRouter/hooks/useDraftPlantingSiteFinalize';
import useDraftPlantingSiteUpdate from 'src/scenes/PlantingSitesRouter/hooks/useDraftPlantingSiteUpdate';
import usePlantingSiteProblemsToast from 'src/scenes/PlantingSitesRouter/hooks/usePlantingSiteProblemsToast';
import strings from 'src/strings';
import { DraftPlantingSite, OptionalSiteEditStep, PlantingSiteProblem, SiteEditStep } from 'src/types/PlantingSite';
import useSnackbar from 'src/utils/useSnackbar';

import CloseSetupConfirmation from './CloseSetupConfirmation';
import DraftProblemsConfirmation from './DraftProblemsConfirmation';
import EditorLayout from './EditorLayout';
import SkipRemainingStepsConfirmation, { SkippedStep } from './SkipRemainingStepsConfirmation';
import StartOverConfirmation from './StartOverConfirmation';
import { initializeOptionalStepsStatus, useEditorSteps } from './editorSteps';
import { OnValidate } from './types';

type StepAction = 'back' | 'create' | 'exit' | 'next';

export type EditorProps = {
  site: DraftPlantingSite;
};

export default function Editor(props: EditorProps): JSX.Element {
  const { site } = props;
  const { siteEditStep, siteType } = site;
  const navigate = useSyncNavigate();
  const snackbar = useSnackbar();
  const showProblems = usePlantingSiteProblemsToast();

  const [onValidate, setOnValidate] = useState<OnValidate | undefined>();
  const [showStartOver, setShowStartOver] = useState<boolean>(false);
  const isStartingOver = useRef(false);
  const [startOverCount, setStartOverCount] = useState(0);
  const [currentStep, setCurrentStep] = useState<SiteEditStep>(siteEditStep);
  const [visitedSteps, setVisitedSteps] = useState<Set<SiteEditStep>>(() => new Set([siteEditStep]));
  const [completedOptionalSteps, setCompletedOptionalSteps] = useState<Record<OptionalSiteEditStep, boolean>>(
    initializeOptionalStepsStatus(site)
  );
  const [stepIsDirty, setStepIsDirty] = useState(false);
  const [hasCarriedEdits, setHasCarriedEdits] = useState(false);
  const [hasBoundary, setHasBoundary] = useState(!!site.boundary);
  const [plantingSite, setPlantingSite] = useState(site);
  const [showCancelConfirmation, setShowCancelConfirmation] = useState<boolean>(false);
  const [stepToSkip, setStepToSkip] = useState<SkippedStep | undefined>();

  const hasUnsavedEdits = stepIsDirty || hasCarriedEdits;

  const goToPlantingSites = useCallback(() => navigate(APP_PATHS.PLANTING_SITES), [navigate]);

  const onFinalizeSuccess = useCallback(() => {
    snackbar.toastSuccess(strings.PLANTING_SITE_CREATED);
    goToPlantingSites();
  }, [goToPlantingSites, snackbar]);

  const onFinalizeError = useCallback(
    (problems?: PlantingSiteProblem[]) => {
      if (problems?.length) {
        showProblems(problems);
      } else {
        snackbar.toastError(strings.GENERIC_ERROR);
      }
    },
    [showProblems, snackbar]
  );

  /**
   * set up hooks to update a draft and also to create a planting site from draft
   */
  const {
    onCancelSave,
    onFinishUpdate,
    onSaveAnyway,
    problems: draftProblems,
    updateDraft,
    isUpdating,
    updatedDraft,
  } = useDraftPlantingSiteUpdate(site.id);
  const { finalize, isPending } = useDraftPlantingSiteFinalize(onFinalizeSuccess, onFinalizeError);

  const steps = useEditorSteps(siteType, completedOptionalSteps);
  const stepIndex = useMemo(
    () =>
      Math.max(
        steps.findIndex((step) => step.type === currentStep),
        0
      ),
    [currentStep, steps]
  );
  const isLastStep = stepIndex === steps.length - 1;

  const goToStep = useCallback((step: SiteEditStep) => {
    setCurrentStep(step);
    setVisitedSteps((visited) => (visited.has(step) ? visited : new Set(visited).add(step)));
  }, []);

  // update local state when draft is updated
  useEffect(() => {
    if (updatedDraft) {
      setPlantingSite(updatedDraft.draft);
      setStepIsDirty(false);
      setHasCarriedEdits(false);
      setHasBoundary(!!updatedDraft.draft.boundary);
      goToStep(updatedDraft.nextStep);
      if (updatedDraft.optionalSteps) {
        setCompletedOptionalSteps(updatedDraft.optionalSteps);
      }
      if (isStartingOver.current) {
        isStartingOver.current = false;
        setStartOverCount((count) => count + 1);
      }
      onFinishUpdate();
    }
  }, [updatedDraft, goToStep, onFinishUpdate]);

  const runStep = useCallback(
    (action: StepAction) => {
      // wait for the step component to hand its data back
      if (onValidate) {
        return;
      }

      const nextStep =
        action === 'back' ? steps[stepIndex - 1].type : action === 'next' ? steps[stepIndex + 1].type : currentStep;

      setOnValidate({
        allowIncomplete: action === 'back' || action === 'exit',
        apply: (hasErrors: boolean, data?: Partial<DraftPlantingSite>) => {
          setOnValidate(undefined);
          if (hasErrors) {
            return;
          }

          const draft: DraftPlantingSite = { ...plantingSite, ...(data ?? {}), siteEditStep: nextStep };

          if (action === 'create') {
            finalize(draft);
          } else if (action === 'back') {
            setPlantingSite(draft);
            setHasCarriedEdits(true);
            goToStep(nextStep);
          } else {
            updateDraft({ draft, nextStep, optionalSteps: initializeOptionalStepsStatus(draft) }, action === 'exit');
          }
        },
      });
    },
    [currentStep, finalize, goToStep, onValidate, plantingSite, stepIndex, steps, updateDraft]
  );

  const onCancel = useCallback(() => {
    if (stepIndex === 0 && !hasBoundary) {
      goToPlantingSites();
    } else {
      setShowCancelConfirmation(true);
    }
  }, [goToPlantingSites, hasBoundary, stepIndex]);

  const onKeepEditing = useCallback(() => setShowCancelConfirmation(false), []);

  const onBack = useCallback(() => {
    if (hasUnsavedEdits) {
      runStep('back');
    } else {
      goToStep(steps[stepIndex - 1].type);
    }
  }, [goToStep, hasUnsavedEdits, runStep, stepIndex, steps]);

  const onNext = useCallback(() => {
    if (hasUnsavedEdits) {
      runStep('next');
    } else {
      goToStep(steps[stepIndex + 1].type);
    }
  }, [goToStep, hasUnsavedEdits, runStep, stepIndex, steps]);

  const onSaveAndExit = useCallback(() => runStep('exit'), [runStep]);

  const skippableStep = useMemo<SkippedStep | undefined>(() => {
    const isSettled = (step: OptionalSiteEditStep) => visitedSteps.has(step) || completedOptionalSteps[step];

    if (siteType !== 'Detailed' || isLastStep) {
      return undefined;
    }
    if (currentStep === 'exclusion_areas' && !isSettled('stratum_boundaries')) {
      return 'stratum_boundaries';
    }
    if (
      (currentStep === 'exclusion_areas' || currentStep === 'stratum_boundaries') &&
      !isSettled('substratum_boundaries')
    ) {
      return 'substratum_boundaries';
    }
    return undefined;
  }, [completedOptionalSteps, currentStep, isLastStep, siteType, visitedSteps]);

  const onCreateSite = useCallback(() => {
    if (skippableStep) {
      setStepToSkip(skippableStep);
    } else {
      runStep('create');
    }
  }, [runStep, skippableStep]);

  const onCloseSkipConfirmation = useCallback(() => setStepToSkip(undefined), []);

  const onContinueSetup = useCallback(() => {
    setStepToSkip(undefined);
    onNext();
  }, [onNext]);

  const onCreateSiteAnyway = useCallback(() => {
    setStepToSkip(undefined);
    runStep('create');
  }, [runStep]);

  /**
   * On start over, data is reset to clear all boundaries and only keep the details information.
   * Optional steps completion state is reset.
   * User is taken back to 'site_boundary' step, if the update succeeds.
   */
  const onStartOver = useCallback(() => {
    const nextStep = 'site_boundary';

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

    isStartingOver.current = true;
    updateDraft({ draft, nextStep, optionalSteps });
    setShowStartOver(false);
  }, [plantingSite, updateDraft]);

  const onBackToEdit = useCallback(() => {
    isStartingOver.current = false;
    onCancelSave();
  }, [onCancelSave]);

  const onOpenStartOver = useCallback(() => setShowStartOver(true), []);
  const onCloseStartOver = useCallback(() => setShowStartOver(false), []);

  const busy = isUpdating || isPending || !!onValidate;
  const showStartOverButton = currentStep !== 'site_boundary' || !!plantingSite.boundary;
  const siteName = plantingSite.name.trim();

  const actions = (
    <>
      <Button
        id='cancel-planting-site-create'
        label={strings.CANCEL}
        onClick={onCancel}
        disabled={busy}
        priority='secondary'
        type='passive'
        size='medium'
      />
      {stepIndex > 0 && (
        <Button
          id='back-planting-site-create'
          label={strings.BACK}
          onClick={onBack}
          disabled={busy}
          priority='secondary'
          type='passive'
          size='medium'
        />
      )}
      <Button
        id='save-and-exit-planting-site-create'
        label={strings.SAVE_AND_EXIT}
        onClick={onSaveAndExit}
        disabled={busy || !hasBoundary}
        priority='secondary'
        type='passive'
        size='medium'
      />
      <Button
        id='create-planting-site'
        label={strings.CREATE_SITE}
        onClick={onCreateSite}
        disabled={busy || currentStep === 'site_boundary'}
        priority={isLastStep ? 'primary' : 'secondary'}
        size='medium'
      />
      {!isLastStep && (
        <Button
          id='next-planting-site-create'
          label={strings.NEXT}
          onClick={onNext}
          disabled={busy || !hasBoundary}
          size='medium'
        />
      )}
    </>
  );

  return (
    <EditorLayout
      actions={actions}
      busy={busy}
      currentStep={currentStep}
      isDirty={hasUnsavedEdits}
      onDirtyChange={setStepIsDirty}
      onHasBoundaryChange={setHasBoundary}
      onLeave={goToPlantingSites}
      onStartOver={showStartOverButton ? onOpenStartOver : undefined}
      onValidate={onValidate}
      site={plantingSite}
      stepKey={startOverCount}
      steps={steps}
      title={strings.ADD_PLANTING_SITE}
    >
      {isPending && <BusySpinner withSkrim={true} />}
      {isUpdating && <BusySpinner />}
      {showStartOver && <StartOverConfirmation onClose={onCloseStartOver} onConfirm={onStartOver} />}
      {draftProblems && (
        <DraftProblemsConfirmation onBackToEdit={onBackToEdit} onSaveAnyway={onSaveAnyway} problems={draftProblems} />
      )}
      {stepToSkip && (
        <SkipRemainingStepsConfirmation
          onClose={onCloseSkipConfirmation}
          onContinueSetup={onContinueSetup}
          onCreateSite={onCreateSiteAnyway}
          skippedStep={stepToSkip}
        />
      )}
      {showCancelConfirmation && (
        <CloseSetupConfirmation
          message={
            hasUnsavedEdits
              ? strings.CANCEL_DRAFT_SITE_SETUP_MESSAGE
              : strings.CANCEL_DRAFT_SITE_SETUP_NO_CHANGES_MESSAGE
          }
          nothingToDiscard={!hasUnsavedEdits}
          onDiscard={goToPlantingSites}
          onKeepEditing={onKeepEditing}
          siteName={siteName}
        />
      )}
    </EditorLayout>
  );
}
