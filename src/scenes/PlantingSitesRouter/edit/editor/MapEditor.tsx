import React, { type JSX, useCallback, useMemo, useState } from 'react';

import { BusySpinner } from '@terraware/web-components';
import _ from 'lodash';

import useNavigateTo from 'src/hooks/useNavigateTo';
import {
  PlantingSitePayload,
  useSummarizePlantingSiteMapEditMutation,
  useUpdatePlantingSiteMapMutation,
} from 'src/queries/generated/plantingSites';
import strings from 'src/strings';
import { EditorPlantingSite, PlantingSiteProblem, SiteEditStep } from 'src/types/PlantingSite';
import { getDraftMapProblems, getDraftSaveErrorMessage } from 'src/utils/draftPlantingSiteUtils';
import {
  EditedCompletedSubstratum,
  getEditedCompletedSubstrata,
  toEditorSite,
  toPlantingSiteMapEdit,
} from 'src/utils/plantingSiteMapEditUtils';
import useSnackbar from 'src/utils/useSnackbar';

import CloseSetupConfirmation from './CloseSetupConfirmation';
import DraftProblemsConfirmation from './DraftProblemsConfirmation';
import EditorLayout from './EditorLayout';
import MapEditSummaryModal, { MapEditSummaryItem } from './MapEditSummaryModal';
import MarkSubstrataIncompleteModal from './MarkSubstrataIncompleteModal';
import StartOverConfirmation from './StartOverConfirmation';
import { initializeOptionalStepsStatus, useEditorSteps } from './editorSteps';
import { OnValidate } from './types';

export type MapEditorProps = {
  site: PlantingSitePayload;
};

/**
 * Edits the map of an existing planting site. Edits stay in memory until they are saved all at once.
 */
export default function MapEditor({ site }: MapEditorProps): JSX.Element {
  const { goToPlantingSiteView } = useNavigateTo();
  const snackbar = useSnackbar();
  const [updatePlantingSiteMap, { isLoading: isSaving }] = useUpdatePlantingSiteMapMutation();
  const [summarizePlantingSiteMapEdit, { isLoading: isSummarizing }] = useSummarizePlantingSiteMapEditMutation();

  const initialSite = useMemo(() => toEditorSite(site), [site]);
  const [editorSite, setEditorSite] = useState<EditorPlantingSite>(initialSite);
  const [currentStep, setCurrentStep] = useState<SiteEditStep>('site_boundary');
  const [onValidate, setOnValidate] = useState<OnValidate | undefined>();
  const [isDirty, setIsDirty] = useState(false);
  const [startOverCount, setStartOverCount] = useState(0);
  const [showCloseConfirmation, setShowCloseConfirmation] = useState(false);
  const [showStartOver, setShowStartOver] = useState(false);
  const [problems, setProblems] = useState<PlantingSiteProblem[]>();
  const [summary, setSummary] = useState<MapEditSummaryItem[]>();
  const [substrataToConfirm, setSubstrataToConfirm] = useState<EditedCompletedSubstratum[]>();
  const [selectedIncompleteIds, setSelectedIncompleteIds] = useState<number[]>([]);

  const completedOptionalSteps = useMemo(() => initializeOptionalStepsStatus(editorSite), [editorSite]);
  const steps = useEditorSteps(editorSite.siteType, completedOptionalSteps);
  const stepIndex = Math.max(
    steps.findIndex((step) => step.type === currentStep),
    0
  );
  // the site boundary is ignored for sites with strata, and the steps may rebuild it in an equivalent form
  const hasChanges = useMemo(
    () =>
      isDirty ||
      !_.isEqual(
        _.omit(toPlantingSiteMapEdit(editorSite, site), 'boundary'),
        _.omit(toPlantingSiteMapEdit(initialSite, site), 'boundary')
      ),
    [editorSite, initialSite, isDirty, site]
  );

  const goToSiteView = useCallback(() => goToPlantingSiteView(site.id), [goToPlantingSiteView, site.id]);

  const onRequestError = useCallback(
    (error: unknown) => {
      const mapProblems = getDraftMapProblems(error);
      if (mapProblems?.length) {
        setProblems(mapProblems);
      } else {
        snackbar.toastError(getDraftSaveErrorMessage(error));
      }
    },
    [snackbar]
  );

  const save = useCallback(
    async (edited: EditorPlantingSite, substratumIdsToMarkIncomplete?: number[]) => {
      try {
        await updatePlantingSiteMap({
          id: site.id,
          updatePlantingSiteMapRequestPayload: toPlantingSiteMapEdit(edited, site, substratumIdsToMarkIncomplete),
        }).unwrap();
        snackbar.toastSuccess(strings.CHANGES_SAVED);
        goToSiteView();
      } catch (error) {
        onRequestError(error);
      }
    },
    [goToSiteView, onRequestError, site, snackbar, updatePlantingSiteMap]
  );

  const summarize = useCallback(
    async (edited: EditorPlantingSite) => {
      try {
        const response = await summarizePlantingSiteMapEdit({
          id: site.id,
          depth: 'Substratum',
          updatePlantingSiteMapRequestPayload: toPlantingSiteMapEdit(edited, site),
        }).unwrap();
        setSummary(response.summary);
      } catch (error) {
        onRequestError(error);
      }
    },
    [onRequestError, site, summarizePlantingSiteMapEdit]
  );

  const validateStep = useCallback(
    (allowIncomplete: boolean, onValid: (edited: EditorPlantingSite) => void) => {
      if (onValidate) {
        return;
      }
      setOnValidate({
        allowIncomplete,
        apply: (hasErrors: boolean, data?: Partial<EditorPlantingSite>) => {
          setOnValidate(undefined);
          if (!hasErrors) {
            const edited = { ...editorSite, ...(data ?? {}) };
            setEditorSite(edited);
            setIsDirty(false);
            onValid(edited);
          }
        },
      });
    },
    [editorSite, onValidate]
  );

  const onNext = useCallback(
    () =>
      validateStep(false, (edited) => {
        if (stepIndex === steps.length - 1) {
          void summarize(edited);
        } else {
          setCurrentStep(steps[stepIndex + 1].type);
        }
      }),
    [stepIndex, steps, summarize, validateStep]
  );

  const onCloseSummary = useCallback(() => setSummary(undefined), []);
  const onSaveSummary = useCallback(() => {
    setSummary(undefined);
    const editedCompletedSubstrata = getEditedCompletedSubstrata(editorSite, site);
    if (editedCompletedSubstrata.length) {
      setSubstrataToConfirm(editedCompletedSubstrata);
    } else {
      void save(editorSite);
    }
  }, [editorSite, save, site]);

  const onCancelMarkIncomplete = useCallback(() => setSubstrataToConfirm(undefined), []);
  const onSaveMarkIncomplete = useCallback(
    (substratumIds: number[]) => {
      setSubstrataToConfirm(undefined);
      setSelectedIncompleteIds(substratumIds);
      void save(editorSite, substratumIds);
    },
    [editorSite, save]
  );

  const onBack = useCallback(() => {
    const previousStep = steps[stepIndex - 1].type;
    if (isDirty) {
      validateStep(true, () => setCurrentStep(previousStep));
    } else {
      setCurrentStep(previousStep);
    }
  }, [isDirty, stepIndex, steps, validateStep]);

  const onClose = useCallback(() => {
    if (hasChanges) {
      setShowCloseConfirmation(true);
    } else {
      goToSiteView();
    }
  }, [goToSiteView, hasChanges]);

  const onKeepEditing = useCallback(() => setShowCloseConfirmation(false), []);
  const onOpenStartOver = useCallback(() => setShowStartOver(true), []);
  const onCloseStartOver = useCallback(() => setShowStartOver(false), []);
  const onBackToEdit = useCallback(() => setProblems(undefined), []);

  const onStartOver = useCallback(() => {
    setEditorSite(initialSite);
    setIsDirty(false);
    setSelectedIncompleteIds([]);
    setCurrentStep('site_boundary');
    setStartOverCount((count) => count + 1);
    setShowStartOver(false);
  }, [initialSite]);

  return (
    <EditorLayout
      busy={isSaving || isSummarizing || !!onValidate}
      closeButtonId='close-planting-site-edit'
      currentStep={currentStep}
      finishButtonId='save-planting-site-edit'
      finishLabel={strings.SAVE_CHANGES}
      isDirty={hasChanges}
      onBack={onBack}
      onClose={onClose}
      onDirtyChange={setIsDirty}
      onFinish={onNext}
      onLeave={goToSiteView}
      onNext={onNext}
      onStartOver={hasChanges ? onOpenStartOver : undefined}
      onValidate={onValidate}
      site={editorSite}
      stepKey={startOverCount}
      steps={steps}
      title={strings.EDIT_PLANTING_SITE}
    >
      {(isSaving || isSummarizing) && <BusySpinner withSkrim={true} />}
      {showStartOver && (
        <StartOverConfirmation
          message={strings.EDIT_SITE_START_OVER_WARNING}
          onClose={onCloseStartOver}
          onConfirm={onStartOver}
        />
      )}
      {summary && <MapEditSummaryModal onBackToEdit={onCloseSummary} onSave={onSaveSummary} summary={summary} />}
      {substrataToConfirm && (
        <MarkSubstrataIncompleteModal
          initialSelectedIds={selectedIncompleteIds}
          onCancel={onCancelMarkIncomplete}
          onSave={onSaveMarkIncomplete}
          substrata={substrataToConfirm}
        />
      )}
      {problems && (
        <DraftProblemsConfirmation
          message={strings.PLANTING_SITE_MAP_HAS_PROBLEMS}
          onBackToEdit={onBackToEdit}
          problems={problems}
          title={strings.PLANTING_SITE_MAP_PROBLEMS_TITLE}
        />
      )}
      {showCloseConfirmation && (
        <CloseSetupConfirmation
          message={strings.CLOSE_SITE_EDITOR_MESSAGE}
          onDiscard={goToSiteView}
          onKeepEditing={onKeepEditing}
          siteName={site.name.trim()}
          title={strings.CLOSE_SITE_EDITOR}
        />
      )}
    </EditorLayout>
  );
}
