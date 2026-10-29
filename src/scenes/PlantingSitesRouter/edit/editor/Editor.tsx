import React, { type JSX, useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { BusySpinner } from '@terraware/web-components';

import { APP_PATHS } from 'src/constants';
import useNavigateTo from 'src/hooks/useNavigateTo';
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
import { PlantingSiteStep } from './EditorStepper';
import StartOverConfirmation from './StartOverConfirmation';
import { initializeOptionalStepsStatus, useEditorSteps } from './editorSteps';
import { OnValidate } from './types';

type SaveAction = 'back' | 'finish' | 'next';

export type EditorProps = {
  site: DraftPlantingSite;
};

export default function Editor(props: EditorProps): JSX.Element {
  const { site } = props;
  const { siteEditStep, siteType } = site;
  const navigate = useSyncNavigate();
  const { goToPlantingSiteView } = useNavigateTo();
  const snackbar = useSnackbar();
  const showProblems = usePlantingSiteProblemsToast();

  const [onValidate, setOnValidate] = useState<OnValidate | undefined>();
  const [showStartOver, setShowStartOver] = useState<boolean>(false);
  const isStartingOver = useRef(false);
  const [startOverCount, setStartOverCount] = useState(0);
  const [currentStep, setCurrentStep] = useState<SiteEditStep>(siteEditStep);
  const [completedOptionalSteps, setCompletedOptionalSteps] = useState<Record<OptionalSiteEditStep, boolean>>(
    initializeOptionalStepsStatus(site)
  );
  const [isDirty, setIsDirty] = useState(false);
  const [plantingSite, setPlantingSite] = useState(site);
  const [showCloseConfirmation, setShowCloseConfirmation] = useState<boolean>(false);

  const onFinalizeSuccess = useCallback(
    (plantingSiteId: number) => {
      snackbar.toastSuccess(strings.NEW_PLANTING_SITE_CREATED);
      goToPlantingSiteView(plantingSiteId);
    },
    [goToPlantingSiteView, snackbar]
  );

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

  // update local state when draft is updated
  useEffect(() => {
    if (updatedDraft) {
      setPlantingSite(updatedDraft.draft);
      setIsDirty(false);
      setCurrentStep(updatedDraft.nextStep);
      if (updatedDraft.optionalSteps) {
        setCompletedOptionalSteps(updatedDraft.optionalSteps);
      }
      if (isStartingOver.current) {
        isStartingOver.current = false;
        setStartOverCount((count) => count + 1);
      }
      onFinishUpdate();
    }
  }, [updatedDraft, onFinishUpdate]);

  const steps = useEditorSteps(siteType, completedOptionalSteps);

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
      // the user can finish from any step once the required steps are done, skipping the optional ones that are left
      const isFinalizing = action === 'finish' || (action === 'next' && isLastStep);

      const getNextStep = (): SiteEditStep => {
        if (action === 'back') {
          return steps[stepIndex - 1].type;
        }
        return isFinalizing ? currentStep : steps[stepIndex + 1].type;
      };

      setOnValidate({
        allowIncomplete: action === 'back',
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
              updateDraft({ draft, nextStep, optionalSteps: initializeOptionalStepsStatus(draft) });
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
  const onFinish = useMemo(() => onSave('finish'), [onSave]);
  const onNext = useMemo(() => onSave('next'), [onSave]);
  const showStartOverButton = currentStep !== 'site_boundary' || !!plantingSite.boundary;

  return (
    <EditorLayout
      busy={busy}
      canFinish={!!plantingSite.boundary}
      closeButtonId='close-planting-site-create'
      closeLabel={strings.CANCEL}
      currentStep={currentStep}
      finishButtonId='save-planting-site-create'
      finishLabel={strings.SAVE}
      isDirty={isDirty}
      onBack={onBack}
      onClose={onClose}
      onDirtyChange={setIsDirty}
      onFinish={onFinish}
      onLeave={goToPlantingSites}
      onNext={onNext}
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
      {showCloseConfirmation && (
        <CloseSetupConfirmation
          onDiscard={goToPlantingSites}
          onKeepEditing={onKeepEditing}
          siteName={plantingSite.name.trim()}
        />
      )}
    </EditorLayout>
  );
}
