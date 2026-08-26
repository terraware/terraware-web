import React, { type JSX, useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { Typography, useTheme } from '@mui/material';
import { BusySpinner } from '@terraware/web-components';

import UpdateLocationModal from 'src/components/UpdateLocationModal';
import DialogBox from 'src/components/common/DialogBox/DialogBox';
import Button from 'src/components/common/button/Button';
import { useBotanicalCountries } from 'src/hooks/useBotanicalCountries';
import { useTrackEvent } from 'src/hooks/useTrackEvent';
import { useTrackModalAbandonment } from 'src/hooks/useTrackModalAbandonment';
import { MIXPANEL_EVENTS } from 'src/mixpanelEvents';
import { useLocalization, useOrganization } from 'src/providers/hooks';
import { useUpdateProjectMutation } from 'src/queries/generated/projects';
import {
  useAcceptPendingNativitiesMutation,
  useAcceptProblemSuggestionMutation,
  useOverrideProjectSpeciesDataMutation,
} from 'src/queries/generated/species';
import { OrganizationService } from 'src/services';
import strings from 'src/strings';
import { Project } from 'src/types/Project';
import { Species } from 'src/types/Species';
import useSnackbar from 'src/utils/useSnackbar';

import CancelSpeciesCheckModal from './CancelSpeciesCheckModal';
import NameCheckStep from './NameCheckStep';
import NativeCheckStep, { NativeCheckProjectSection } from './NativeCheckStep';
import { ProjectCheckSummaryProps } from './ProjectCheckSummary';
import SetLocationStep from './SetLocationStep';
import SpeciesCheckStepper from './SpeciesCheckStepper';
import { LocationEdit, LocationTarget, Nativity, ORG_TARGET_KEY, OverrideEdit, projectSpeciesKey } from './types';

export type SpeciesCheckEntry = 'first-time' | 'menu' | 'added';

type SpeciesCheckModalProps = {
  open: boolean;
  onClose: () => void;
  species: Species[];
  projects: Project[];
  entry: SpeciesCheckEntry;
  reloadSpecies: () => Promise<void>;
};

type StepKey = 'setLocation' | 'name' | 'native';

const SAVE_FAILURE_ENTITY_TYPES = {
  setLocation: 'species_intelligence_location',
  nameCheck: 'species_intelligence_name_check',
  nativeCheck: 'species_intelligence_native_check',
} as const;

const hasCompleteLocation = (location: LocationEdit): boolean =>
  !!location.countryCode && !!location.botanicalCountryCode;

const SpeciesCheckModal = ({
  open,
  onClose,
  species,
  projects,
  entry,
  reloadSpecies,
}: SpeciesCheckModalProps): JSX.Element => {
  const theme = useTheme();
  const snackbar = useSnackbar();
  const { countries } = useLocalization();
  const { selectedOrganization, reloadOrganizations } = useOrganization();
  const { botanicalCountries } = useBotanicalCountries(!open);
  const trackEvent = useTrackEvent();
  const markSubmitted = useTrackModalAbandonment('species_check', open);

  const [updateProject] = useUpdateProjectMutation();
  const [acceptProblem] = useAcceptProblemSuggestionMutation();
  const [overrideSpecies] = useOverrideProjectSpeciesDataMutation();
  const [acceptPending] = useAcceptPendingNativitiesMutation();

  const [step, setStep] = useState(0);
  const [nativeMode, setNativeMode] = useState<'list' | 'override'>('list');
  const [locationEdits, setLocationEdits] = useState<Record<number, LocationEdit>>({});
  const [nameSelected, setNameSelected] = useState<Set<number>>(new Set());
  const [nativeSelected, setNativeSelected] = useState<Set<string>>(new Set());
  const [overrideEdits, setOverrideEdits] = useState<Record<string, OverrideEdit>>({});
  const [showCancel, setShowCancel] = useState(false);
  const [busy, setBusy] = useState(false);
  const [showUpdateLocation, setShowUpdateLocation] = useState(false);
  const [recalculatedTargetKeys, setRecalculatedTargetKeys] = useState<Set<number>>(new Set());

  const targets = useMemo<LocationTarget[]>(() => {
    const orgCountryCode = selectedOrganization?.countryCode;
    if (projects.length > 0) {
      return projects.map((project) => ({
        key: project.id,
        projectId: project.id,
        name: project.name,
        countryCode: project.countryCode ?? orgCountryCode,
        botanicalCountryCode: project.botanicalCountryCode,
        isOrg: false,
      }));
    }
    return [
      {
        key: ORG_TARGET_KEY,
        projectId: undefined,
        name: selectedOrganization?.name ?? strings.NO_PROJECT,
        countryCode: orgCountryCode,
        botanicalCountryCode: selectedOrganization?.botanicalCountryCode,
        isOrg: true,
      },
    ];
  }, [projects, selectedOrganization]);

  const locationsOptional = projects.length > 1;

  const targetsRef = useRef(targets);
  targetsRef.current = targets;

  const speciesRef = useRef(species);
  speciesRef.current = species;

  const runStartRef = useRef(0);

  const trackEventRef = useRef(trackEvent);
  trackEventRef.current = trackEvent;
  const entryRef = useRef(entry);
  entryRef.current = entry;
  const projectsLengthRef = useRef(projects.length);
  projectsLengthRef.current = projects.length;

  useEffect(() => {
    if (!open) {
      return;
    }
    const initial: Record<number, LocationEdit> = {};
    targetsRef.current.forEach((target) => {
      initial[target.key] = {
        countryCode: target.countryCode,
        botanicalCountryCode: target.botanicalCountryCode,
      };
    });
    setLocationEdits(initial);
    const locationsMissing = !targetsRef.current.every(hasCompleteLocation);
    setStep(locationsMissing ? 0 : 1);
    setNativeMode('list');
    setNameSelected(
      new Set(
        speciesRef.current
          .filter((sp) => (sp.problems ?? []).some((problem) => !!problem.suggestedValue))
          .map((sp) => sp.id)
      )
    );
    setNativeSelected(new Set());
    setOverrideEdits({});
    setShowCancel(false);
    setShowUpdateLocation(false);
    setRecalculatedTargetKeys(new Set());

    runStartRef.current = Date.now();
    trackEventRef.current(MIXPANEL_EVENTS.SPECIES_INTELLIGENCE_CHECK_RUN, {
      project_scope: 'all',
      species_count: speciesRef.current.length,
    });
    if (locationsMissing) {
      trackEventRef.current(MIXPANEL_EVENTS.SPECIES_INTELLIGENCE_SETUP_PROMPT_SHOWN, {
        project_count: projectsLengthRef.current,
        trigger: entryRef.current,
      });
    }
  }, [open]);

  const stepKeys = useMemo<StepKey[]>(() => ['setLocation', 'name', 'native'], []);
  const currentKey = stepKeys[Math.min(step, stepKeys.length - 1)];

  const stepLabels = useMemo(
    () =>
      stepKeys.map((key) =>
        key === 'setLocation' ? strings.LOCATION : key === 'name' ? strings.NAME_CHECK : strings.NATIVE_CHECK
      ),
    [stepKeys]
  );

  const countryNameByCode = useCallback(
    (code?: string) => countries?.find((country) => country.code === code)?.name,
    [countries]
  );
  const botanicalNameByCode = useCallback(
    (code?: string) => botanicalCountries.find((botanicalCountry) => botanicalCountry.code === code)?.name,
    [botanicalCountries]
  );

  const locationForTarget = useCallback(
    (target: LocationTarget): LocationEdit =>
      locationEdits[target.key] ?? {
        countryCode: target.countryCode,
        botanicalCountryCode: target.botanicalCountryCode,
      },
    [locationEdits]
  );

  const trackSaveFailed = useCallback(
    (entityType: (typeof SAVE_FAILURE_ENTITY_TYPES)[keyof typeof SAVE_FAILURE_ENTITY_TYPES]) => {
      trackEvent(MIXPANEL_EVENTS.SAVE_FAILED, { entity_type: entityType });
    },
    [trackEvent]
  );

  const targetData = useMemo(
    () =>
      targets.map((target) => {
        const targetSpecies = [
          ...(target.isOrg
            ? species
            : species.filter((sp) => (sp.projects ?? []).some((p) => p.projectId === target.projectId))),
        ].sort((a, b) => (a.scientificName ?? '').localeCompare(b.scientificName ?? ''));
        const withProblems = targetSpecies.filter((sp) => (sp.problems?.length ?? 0) > 0);
        const pending = targetSpecies
          .map((sp) => {
            const element = (sp.projects ?? []).find((p) => p.projectId === target.projectId);
            return element?.pendingNativity ? { species: sp, nativity: element.pendingNativity as Nativity } : null;
          })
          .filter((row): row is { species: Species; nativity: Nativity } => row !== null);
        const displayRows = recalculatedTargetKeys.has(target.key)
          ? targetSpecies
              .map((sp) => {
                const element = (sp.projects ?? []).find((p) => p.projectId === target.projectId);
                const nativity = element?.pendingNativity ?? element?.overriddenNativity ?? element?.calculatedNativity;
                return nativity ? { species: sp, nativity: nativity as Nativity } : null;
              })
              .filter((row): row is { species: Species; nativity: Nativity } => row !== null)
          : pending;
        return { target, targetSpecies, withProblems, pending, displayRows };
      }),
    [species, targets, recalculatedTargetKeys]
  );

  const checkedTargetData = useMemo(
    () => targetData.filter((data) => hasCompleteLocation(locationForTarget(data.target))),
    [locationForTarget, targetData]
  );

  const checkedSpecies = useMemo(() => {
    const speciesById = new Map<number, Species>();
    checkedTargetData.forEach((data) => data.targetSpecies.forEach((sp) => speciesById.set(sp.id, sp)));
    return [...speciesById.values()];
  }, [checkedTargetData]);

  const speciesWithProblems = useMemo(
    () =>
      checkedSpecies
        .filter((sp) => (sp.problems?.length ?? 0) > 0)
        .sort((a, b) => (a.scientificName ?? '').localeCompare(b.scientificName ?? '')),
    [checkedSpecies]
  );

  const buildSummary = useCallback(
    (data: (typeof targetData)[number], updates: number): ProjectCheckSummaryProps => {
      const location = locationForTarget(data.target);
      return {
        projectName: data.target.name,
        countryName: countryNameByCode(location.countryCode),
        botanicalCountryName: botanicalNameByCode(location.botanicalCountryCode),
        showLocation: hasCompleteLocation(location),
        updates,
        speciesChecked: data.targetSpecies.length,
      };
    },
    [botanicalNameByCode, countryNameByCode, locationForTarget]
  );

  const nameSummaries = useMemo(
    () => checkedTargetData.map((data) => buildSummary(data, data.withProblems.length)),
    [buildSummary, checkedTargetData]
  );

  const nativeSections = useMemo<NativeCheckProjectSection[]>(
    () =>
      checkedTargetData.map((data) => ({
        key: data.target.key,
        projectId: data.target.projectId,
        summary: buildSummary(data, data.pending.length),
        pending: data.displayRows,
      })),
    [buildSummary, checkedTargetData]
  );

  const hasAnyPending = checkedTargetData.some((data) => data.pending.length > 0);

  const goToStep = useCallback((key: StepKey) => setStep(stepKeys.indexOf(key)), [stepKeys]);

  const goBackToLocationStep = useCallback(() => {
    goToStep('setLocation');
    trackEvent(MIXPANEL_EVENTS.SPECIES_INTELLIGENCE_SETUP_PROMPT_SHOWN, {
      project_count: projects.length,
      trigger: 'back-navigation',
    });
  }, [goToStep, projects.length, trackEvent]);

  const toggleName = useCallback((speciesId: number) => {
    setNameSelected((previous) => {
      const next = new Set(previous);
      if (next.has(speciesId)) {
        next.delete(speciesId);
      } else {
        next.add(speciesId);
      }
      return next;
    });
  }, []);

  const toggleNative = useCallback((targetKey: number, speciesId: number) => {
    const key = projectSpeciesKey(targetKey, speciesId);
    setNativeSelected((previous) => {
      const next = new Set(previous);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  }, []);

  const isLocationComplete = useCallback(
    (target: LocationTarget) => hasCompleteLocation(locationForTarget(target)),
    [locationForTarget]
  );

  const changedTargets = useMemo(
    () =>
      targets.filter((target) => {
        const edit = locationEdits[target.key];
        if (!edit) {
          return false;
        }
        return (
          (edit.countryCode ?? null) !== (target.countryCode ?? null) ||
          (edit.botanicalCountryCode ?? null) !== (target.botanicalCountryCode ?? null)
        );
      }),
    [targets, locationEdits]
  );

  const confirmTargets = useMemo(
    () => changedTargets.filter((target) => !!target.botanicalCountryCode),
    [changedTargets]
  );

  const onSetLocations = useCallback(async () => {
    const changedKeys = new Set(changedTargets.map((target) => target.key));
    setBusy(true);
    try {
      await Promise.all(
        changedTargets.map((target) => {
          const edit = locationForTarget(target);
          if (target.isOrg) {
            if (!selectedOrganization) {
              return Promise.resolve();
            }
            return OrganizationService.updateOrganization({
              ...selectedOrganization,
              countryCode: edit.countryCode,
              botanicalCountryCode: edit.botanicalCountryCode,
            });
          }
          const project = projects.find((p) => p.id === target.projectId);
          return updateProject({
            id: target.projectId as number,
            updateProjectRequestPayload: {
              name: project?.name ?? target.name,
              description: project?.description,
              countryCode: edit.countryCode ?? null,
              botanicalCountryCode: edit.botanicalCountryCode ?? null,
            },
          }).unwrap();
        })
      );
      if (changedTargets.some((target) => target.isOrg) && selectedOrganization) {
        await reloadOrganizations(selectedOrganization.id);
      }
      await reloadSpecies();
      setRecalculatedTargetKeys(changedKeys);
      setStep(1);
      trackEvent(MIXPANEL_EVENTS.SPECIES_INTELLIGENCE_SETUP_PROMPT_COMPLETED, {
        project_count: projects.length,
        countries_set: targets.filter((target) => !!locationForTarget(target).countryCode).length,
        botanical_country_set: targets.filter((target) => !!locationForTarget(target).botanicalCountryCode).length,
      });
    } catch {
      trackSaveFailed(SAVE_FAILURE_ENTITY_TYPES.setLocation);
      snackbar.toastError();
    }
    setBusy(false);
  }, [
    changedTargets,
    locationForTarget,
    projects,
    reloadOrganizations,
    reloadSpecies,
    selectedOrganization,
    snackbar,
    targets,
    trackEvent,
    trackSaveFailed,
    updateProject,
  ]);

  const onAcceptNames = useCallback(async () => {
    setBusy(true);
    try {
      const toAccept = speciesWithProblems.filter((sp) => nameSelected.has(sp.id));
      for (const sp of toAccept) {
        for (const problem of sp.problems ?? []) {
          if (problem.suggestedValue) {
            await acceptProblem(problem.id).unwrap();
          }
        }
      }
      goToStep('native');
    } catch {
      trackSaveFailed(SAVE_FAILURE_ENTITY_TYPES.nameCheck);
      snackbar.toastError();
    }
    setBusy(false);
  }, [acceptProblem, goToStep, nameSelected, snackbar, speciesWithProblems, trackSaveFailed]);

  const trackCheckCompleted = useCallback(
    (submittedOverrides: { projectId?: number; speciesId: number; overriddenNativity: Nativity }[] = []) => {
      const overrideByKey = new Map<string, Nativity>();
      submittedOverrides.forEach((override) => {
        overrideByKey.set(`${override.projectId ?? ORG_TARGET_KEY}-${override.speciesId}`, override.overriddenNativity);
      });

      let invasiveCount = 0;
      let unknownCount = 0;
      speciesRef.current.forEach((sp) => {
        const nativities = (sp.projects ?? []).map(
          (element) =>
            overrideByKey.get(`${element.projectId ?? ORG_TARGET_KEY}-${sp.id}`) ??
            element.pendingNativity ??
            element.overriddenNativity ??
            element.calculatedNativity
        );
        if (nativities.includes('Invasive')) {
          invasiveCount += 1;
        }
        if (nativities.includes('Unknown')) {
          unknownCount += 1;
        }
      });
      trackEvent(MIXPANEL_EVENTS.SPECIES_INTELLIGENCE_CHECK_COMPLETED, {
        project_scope: 'all',
        species_count: speciesRef.current.length,
        invasive_count: invasiveCount,
        unknown_count: unknownCount,
        duration_ms: Date.now() - runStartRef.current,
      });
    },
    [trackEvent]
  );

  const finish = useCallback(async () => {
    try {
      if (selectedOrganization && hasAnyPending) {
        // acceptPendingNativities invalidates the Species tag, so the list refetches.
        await acceptPending({ organizationId: selectedOrganization.id }).unwrap();
      }
      trackCheckCompleted();
      return true;
    } catch {
      trackSaveFailed(SAVE_FAILURE_ENTITY_TYPES.nativeCheck);
      snackbar.toastError();
      return false;
    } finally {
      void reloadSpecies();
    }
  }, [
    acceptPending,
    hasAnyPending,
    reloadSpecies,
    selectedOrganization,
    snackbar,
    trackCheckCompleted,
    trackSaveFailed,
  ]);

  const onFinish = useCallback(async () => {
    setBusy(true);
    const succeeded = await finish();
    if (succeeded) {
      markSubmitted();
    }
    setBusy(false);
    onClose();
  }, [finish, markSubmitted, onClose]);

  const onOverride = useCallback(async () => {
    setBusy(true);
    try {
      const overrides = nativeSections.flatMap((section) =>
        section.pending
          .filter((row) => nativeSelected.has(projectSpeciesKey(section.key, row.species.id)))
          .map((row) => {
            const key = projectSpeciesKey(section.key, row.species.id);
            const edit = overrideEdits[key] ?? {};
            return {
              projectId: section.projectId,
              speciesId: row.species.id,
              overriddenNativity: edit.nativity ?? row.nativity,
              overriddenJustification: edit.justification ?? '',
            };
          })
      );
      if (overrides.length) {
        await overrideSpecies({ overrides }).unwrap();
        overrides.forEach((override) => {
          trackEvent(MIXPANEL_EVENTS.SPECIES_INTELLIGENCE_OVERRIDE_CREATED, {
            project_scope: override.projectId,
            species_id: override.speciesId,
            justification_length: override.overriddenJustification.length,
          });
        });
      }
      if (selectedOrganization) {
        await acceptPending({ organizationId: selectedOrganization.id }).unwrap();
      }
      trackCheckCompleted(overrides);
      markSubmitted();
      onClose();
    } catch {
      trackSaveFailed(SAVE_FAILURE_ENTITY_TYPES.nativeCheck);
      snackbar.toastError();
    } finally {
      setBusy(false);
    }
  }, [
    acceptPending,
    onClose,
    nativeSections,
    nativeSelected,
    overrideEdits,
    overrideSpecies,
    selectedOrganization,
    snackbar,
    markSubmitted,
    trackCheckCompleted,
    trackEvent,
    trackSaveFailed,
  ]);

  const canContinueLocationStep = locationsOptional
    ? targets.some(isLocationComplete)
    : targets.every(isLocationComplete);

  const allOverridesValid = [...nativeSelected].every(
    (key) => (overrideEdits[key]?.justification ?? '').trim().length > 0
  );

  const requestCancel = useCallback(() => {
    if (currentKey === 'setLocation') {
      markSubmitted();
      trackEvent(MIXPANEL_EVENTS.SPECIES_INTELLIGENCE_SETUP_PROMPT_CANCELLED, {
        project_count: projects.length,
      });
      onClose();
    } else {
      setShowCancel(true);
    }
  }, [currentKey, markSubmitted, onClose, projects.length, trackEvent]);

  const middleButtons = useMemo<JSX.Element[]>(() => {
    const cancelButton = (
      <Button
        key='cancel'
        id='cancelSpeciesCheck'
        label={strings.CANCEL}
        onClick={requestCancel}
        priority='secondary'
        type='passive'
        disabled={busy}
      />
    );

    if (currentKey === 'setLocation') {
      return [
        cancelButton,
        <Button
          key='setLocation'
          id='setLocation'
          label={targets.length > 1 ? strings.SET_LOCATIONS : strings.SET_LOCATION}
          onClick={() => {
            if (confirmTargets.length > 0) {
              setShowUpdateLocation(true);
            } else {
              void onSetLocations();
            }
          }}
          disabled={busy || !canContinueLocationStep}
        />,
      ];
    }

    if (currentKey === 'name') {
      const nameBackButton = (
        <Button
          key='back'
          label={strings.BACK}
          onClick={goBackToLocationStep}
          priority='secondary'
          type='passive'
          disabled={busy}
        />
      );
      const namePrimary = (
        <Button key='next' label={strings.NEXT} onClick={() => void onAcceptNames()} disabled={busy} />
      );
      return [cancelButton, nameBackButton, namePrimary];
    }

    if (nativeMode === 'override') {
      return [
        cancelButton,
        <Button
          key='back'
          label={strings.BACK}
          onClick={() => setNativeMode('list')}
          priority='secondary'
          type='passive'
          disabled={busy}
        />,
        <Button
          key='override'
          label={strings.OVERRIDE}
          onClick={() => void onOverride()}
          disabled={busy || !allOverridesValid}
        />,
      ];
    }

    const backButton = (
      <Button
        key='back'
        label={strings.BACK}
        onClick={() => goToStep('name')}
        priority='secondary'
        type='passive'
        disabled={busy}
      />
    );
    const primary =
      nativeSelected.size > 0 ? (
        <Button key='override' label={strings.OVERRIDE} onClick={() => setNativeMode('override')} disabled={busy} />
      ) : (
        <Button key='done' label={strings.DONE} onClick={() => void onFinish()} disabled={busy} />
      );
    return [cancelButton, backButton, primary];
  }, [
    allOverridesValid,
    busy,
    canContinueLocationStep,
    confirmTargets.length,
    currentKey,
    goBackToLocationStep,
    goToStep,
    nativeMode,
    nativeSelected.size,
    onAcceptNames,
    onFinish,
    onOverride,
    onSetLocations,
    requestCancel,
    targets.length,
  ]);

  const title =
    currentKey === 'native' && nativeMode === 'override' && entry === 'menu'
      ? strings.OVERRIDE_SPECIES
      : strings.SPECIES_CHECK;

  return (
    <>
      {busy && <BusySpinner withSkrim />}
      <DialogBox
        open={open}
        onClose={requestCancel}
        title={title}
        size='x-large'
        scrolled
        skrim
        middleButtons={middleButtons}
      >
        <SpeciesCheckStepper steps={stepLabels} activeStep={Math.min(step, stepLabels.length - 1)} />

        {currentKey === 'name' && (
          <Typography
            fontSize='16px'
            color={theme.palette.TwClrTxt}
            textAlign='left'
            marginTop={theme.spacing(2)}
            marginBottom={theme.spacing(2)}
          >
            {strings.SPECIES_CHECK_UPDATE_HINT}
          </Typography>
        )}

        {currentKey === 'native' && nativeMode === 'list' && (
          <Typography
            fontSize='16px'
            color={theme.palette.TwClrTxt}
            textAlign='left'
            marginTop={theme.spacing(2)}
            marginBottom={theme.spacing(2)}
          >
            {strings.NATIVE_CHECK_UPDATE_HINT}
          </Typography>
        )}

        {currentKey === 'setLocation' && (
          <>
            <Typography
              fontSize='16px'
              color={theme.palette.TwClrTxt}
              textAlign='left'
              marginTop={theme.spacing(2)}
              marginBottom={theme.spacing(2)}
            >
              {targets.length > 1
                ? strings.SPECIES_CHECK_SET_LOCATION_HINT_PROJECTS
                : strings.SPECIES_CHECK_SET_LOCATION_HINT}
            </Typography>
            <SetLocationStep
              targets={targets}
              edits={locationEdits}
              countries={countries ?? []}
              botanicalCountries={botanicalCountries}
              locationsRequired={!locationsOptional}
              onChange={(targetKey, edit) => setLocationEdits((previous) => ({ ...previous, [targetKey]: edit }))}
            />
          </>
        )}
        {currentKey === 'name' && (
          <NameCheckStep
            summaries={nameSummaries}
            speciesWithProblems={speciesWithProblems}
            selectedSpeciesIds={nameSelected}
            onToggleSpecies={toggleName}
          />
        )}
        {currentKey === 'native' && (
          <NativeCheckStep
            mode={nativeMode}
            sections={nativeSections}
            selectedKeys={nativeSelected}
            onToggle={toggleNative}
            overrides={overrideEdits}
            onOverrideChange={(key, edit) => setOverrideEdits((previous) => ({ ...previous, [key]: edit }))}
          />
        )}
      </DialogBox>
      {showCancel && (
        <CancelSpeciesCheckModal
          onClose={() => setShowCancel(false)}
          onConfirm={() => {
            setShowCancel(false);
            onClose();
          }}
        />
      )}
      {showUpdateLocation && (
        <UpdateLocationModal
          locationName={confirmTargets.map((target) => target.name).join(', ')}
          onClose={() => setShowUpdateLocation(false)}
          onConfirm={() => {
            setShowUpdateLocation(false);
            void onSetLocations();
          }}
        />
      )}
    </>
  );
};

export default SpeciesCheckModal;
