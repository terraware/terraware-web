import React, { type JSX, useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { Box, Grid, Typography, useTheme } from '@mui/material';
import { BusySpinner, Button, Message } from '@terraware/web-components';

import PageSnackbar from 'src/components/PageSnackbar';
import Card from 'src/components/common/Card';
import PageHeaderWrapper from 'src/components/common/PageHeaderWrapper';
import TextWithLink from 'src/components/common/TextWithLink';
import TfMain from 'src/components/common/TfMain';
import UnsavedChangesBadge from 'src/components/common/UnsavedChangesBadge';
import { APP_PATHS } from 'src/constants';
import useNavigateTo from 'src/hooks/useNavigateTo';
import { useSyncNavigate } from 'src/hooks/useSyncNavigate';
import { useLocalization } from 'src/providers';
import useDraftPlantingSiteCreate from 'src/scenes/PlantingSitesRouter/hooks/useDraftPlantingSiteCreate';
import useDraftPlantingSiteFinalize from 'src/scenes/PlantingSitesRouter/hooks/useDraftPlantingSiteFinalize';
import useDraftPlantingSiteUpdate from 'src/scenes/PlantingSitesRouter/hooks/useDraftPlantingSiteUpdate';
import strings from 'src/strings';
import { DraftPlantingSite, OptionalSiteEditStep } from 'src/types/PlantingSite';
import { SiteEditStep } from 'src/types/PlantingSite';
import useDeviceInfo from 'src/utils/useDeviceInfo';
import useForm from 'src/utils/useForm';
import useSnackbar from 'src/utils/useSnackbar';

import CloseSetupConfirmation from './CloseSetupConfirmation';
import Details from './Details';
import Exclusions from './Exclusions';
import Form, { PlantingSiteStep } from './Form';
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
  const { isMobile } = useDeviceInfo();
  const snackbar = useSnackbar();

  const [showPageMessage, setShowPageMessage] = useState<boolean>(true);
  const [onValidate, setOnValidate] = useState<OnValidate | undefined>();
  const [showStartOver, setShowStartOver] = useState<boolean>(false);
  const startOverDraft = useRef<DraftPlantingSite>(undefined);
  const [startOverCount, setStartOverCount] = useState(0);
  const [currentStep, setCurrentStep] = useState<SiteEditStep>(siteEditStep);
  const [completedOptionalSteps, setCompletedOptionalSteps] = useState<Record<OptionalSiteEditStep, boolean>>(
    initializeOptionalStepsStatus(site)
  );
  const [baselineSite, setBaselineSite] = useState(site);
  const [mapDirty, setMapDirty] = useState(false);
  const [plantingSite, setPlantingSite, onChange] = useForm({ ...site });
  const [showCloseConfirmation, setShowCloseConfirmation] = useState<boolean>(false);

  const isDirty =
    mapDirty ||
    plantingSite.name !== baselineSite.name ||
    (plantingSite.description ?? '') !== (baselineSite.description ?? '') ||
    (plantingSite.timeZone ?? null) !== (baselineSite.timeZone ?? null) ||
    (plantingSite.projectId ?? null) !== (baselineSite.projectId ?? null);

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
   * set up hooks to create/update a draft and also to create a planting site from draft
   */
  const { onFinishCreate, createDraft, isCreating, createdDraft } = useDraftPlantingSiteCreate();
  const { onFinishUpdate, updateDraft, isUpdating, updatedDraft } = useDraftPlantingSiteUpdate();
  const { finalize, isPending } = useDraftPlantingSiteFinalize(onFinalizeSuccess, onFinalizeError);

  // update local state when draft is created
  useEffect(() => {
    if (createdDraft) {
      setPlantingSite(createdDraft.draft);
      setBaselineSite(createdDraft.draft);
      setMapDirty(false);
      setCurrentStep(createdDraft.nextStep);
      onFinishCreate();
    }
  }, [createdDraft, onFinishCreate, setPlantingSite]);

  // update local state when draft is updated
  useEffect(() => {
    if (updatedDraft) {
      setPlantingSite(updatedDraft.draft);
      setBaselineSite(updatedDraft.draft);
      setMapDirty(false);
      setCurrentStep(updatedDraft.nextStep);
      if (updatedDraft.optionalSteps) {
        setCompletedOptionalSteps(updatedDraft.optionalSteps);
      }
      if (updatedDraft.draft === startOverDraft.current) {
        setStartOverCount((count) => count + 1);
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

            if (plantingSite.id === -1) {
              // new site
              createDraft({ draft, nextStep }, redirect);
            } else if (isFinalizing) {
              // user is done with create wizard, create the site and delete the draft
              finalize(draft);
            } else {
              updateDraft({ draft, nextStep, optionalSteps: initializeOptionalStepsStatus(draft) }, redirect);
            }
          }
        },
      });
    },
    [createDraft, currentStep, finalize, getCurrentStepIndex, onValidate, plantingSite, steps, updateDraft]
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

  const busy = isCreating || isUpdating || isPending || !!onValidate;
  const isFinalStep = currentStep === steps[steps.length - 1]?.type;
  const showStartOverButton = currentStep !== 'details' && (currentStep !== 'site_boundary' || !!plantingSite.boundary);

  return (
    <TfMain>
      {isPending && <BusySpinner withSkrim={true} />}
      {(isCreating || isUpdating) && <BusySpinner />}
      {showStartOver && <StartOverConfirmation onClose={onCloseStartOver} onConfirm={onStartOver} />}
      {showCloseConfirmation && (
        <CloseSetupConfirmation
          isNewSite={plantingSite.id === -1}
          onDiscard={goToPlantingSites}
          onKeepEditing={onKeepEditing}
          onSaveAsDraft={onSaveAsDraft}
          siteName={plantingSite.name.trim()}
        />
      )}
      <PageHeaderWrapper alwaysVisible={!isMobile} elevated={!isMobile && isDirty} nextElement={contentElement}>
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
          {!isMobile && (
            <Box display='flex' alignItems='center' flexWrap='wrap' justifyContent='flex-end' gap={theme.spacing(1)}>
              <Button
                id='close-planting-site-create'
                label={strings.CLOSE}
                onClick={onClose}
                disabled={busy}
                priority='secondary'
                type='passive'
                size='medium'
              />
              {showStartOverButton && (
                <Button
                  id='start-over'
                  label={strings.RESET_BOUNDARY_SETUP}
                  onClick={onOpenStartOver}
                  disabled={busy}
                  priority='secondary'
                  type='passive'
                  size='medium'
                />
              )}
              {currentStep !== 'details' && (
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
                id='save-planting-site-create'
                label={isFinalStep ? strings.CREATE_PLANTING_SITE : strings.NEXT}
                onClick={onSave('next')}
                disabled={busy}
                size='medium'
              />
            </Box>
          )}
        </Box>
      </PageHeaderWrapper>
      <Grid item xs={12} ref={contentRef}>
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
          steps={steps}
          style={{
            display: 'flex',
            flexDirection: 'column',
            flexGrow: 1,
          }}
        >
          {pageMessage && (
            <Box marginTop={theme.spacing(2)}>
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
            {currentStep === 'details' && (
              <Details
                onChange={onChange}
                onValidate={onValidate}
                setPlantingSite={setPlantingSite}
                site={plantingSite}
              />
            )}
            {currentStep === 'site_boundary' && (
              <SiteBoundary
                key={startOverCount}
                onDirtyChange={setMapDirty}
                onValidate={onValidate}
                site={plantingSite}
              />
            )}
            {currentStep === 'exclusion_areas' && (
              <Exclusions onDirtyChange={setMapDirty} onValidate={onValidate} site={plantingSite} />
            )}
            {currentStep === 'stratum_boundaries' && (
              <Strata onDirtyChange={setMapDirty} onValidate={onValidate} site={plantingSite} />
            )}
            {currentStep === 'substratum_boundaries' && (
              <Substrata onDirtyChange={setMapDirty} onValidate={onValidate} site={plantingSite} />
            )}
          </Card>
        </Form>
      )}
    </TfMain>
  );
}
