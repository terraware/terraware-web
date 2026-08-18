import React, { type JSX, useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { BusySpinner } from '@terraware/web-components';

import DialogBox from 'src/components/common/DialogBox/DialogBox';
import Button from 'src/components/common/button/Button';
import { useBotanicalCountries } from 'src/hooks/useBotanicalCountries';
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
  reloadSpecies: () => void;
};

type StepKey = 'setLocation' | 'name' | 'native';

const SpeciesCheckModal = ({
  open,
  onClose,
  species,
  projects,
  entry,
  reloadSpecies,
}: SpeciesCheckModalProps): JSX.Element => {
  const snackbar = useSnackbar();
  const { countries } = useLocalization();
  const { selectedOrganization, reloadOrganizations } = useOrganization();
  const { botanicalCountries } = useBotanicalCountries(!open);

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
  const [forceLocation, setForceLocation] = useState(false);
  const [locationsSubmitted, setLocationsSubmitted] = useState(false);
  const [busy, setBusy] = useState(false);

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

  const targetsRef = useRef(targets);
  targetsRef.current = targets;

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
    setStep(0);
    setNativeMode('list');
    setNameSelected(new Set());
    setNativeSelected(new Set());
    setOverrideEdits({});
    setShowCancel(false);
    setForceLocation(false);
    setLocationsSubmitted(false);
  }, [open]);

  const allLocationsSet = targets.every((target) => !!target.botanicalCountryCode);
  const includeSetLocation = (!allLocationsSet && !locationsSubmitted) || forceLocation;

  const stepKeys = useMemo<StepKey[]>(
    () => (includeSetLocation ? ['setLocation', 'name', 'native'] : ['name', 'native']),
    [includeSetLocation]
  );
  const currentKey = stepKeys[Math.min(step, stepKeys.length - 1)];

  const stepLabels = useMemo(() => {
    const locationLabel = targets.length > 1 ? strings.SET_LOCATIONS : strings.SET_LOCATION;
    return stepKeys.map((key) =>
      key === 'setLocation' ? locationLabel : key === 'name' ? strings.NAME_CHECK : strings.NATIVE_CHECK
    );
  }, [targets.length, stepKeys]);

  const countryNameByCode = useCallback(
    (code?: string) => countries?.find((country) => country.code === code)?.name,
    [countries]
  );
  const botanicalNameByCode = useCallback(
    (code?: string) => botanicalCountries.find((botanicalCountry) => botanicalCountry.code === code)?.name,
    [botanicalCountries]
  );

  const targetData = useMemo(
    () =>
      targets.map((target) => {
        const targetSpecies = target.isOrg
          ? species
          : species.filter((sp) => (sp.projects ?? []).some((p) => p.projectId === target.projectId));
        const withProblems = targetSpecies.filter((sp) => (sp.problems?.length ?? 0) > 0);
        const pending = targetSpecies
          .map((sp) => {
            const element = (sp.projects ?? []).find((p) => p.projectId === target.projectId);
            return element?.pendingNativity ? { species: sp, nativity: element.pendingNativity as Nativity } : null;
          })
          .filter((row): row is { species: Species; nativity: Nativity } => row !== null);
        return { target, targetSpecies, withProblems, pending };
      }),
    [species, targets]
  );

  const speciesWithProblems = useMemo(() => species.filter((sp) => (sp.problems?.length ?? 0) > 0), [species]);

  const buildSummary = useCallback(
    (data: (typeof targetData)[number], updates: number): ProjectCheckSummaryProps => ({
      projectName: data.target.name,
      countryName: countryNameByCode(locationEdits[data.target.key]?.countryCode ?? data.target.countryCode),
      botanicalCountryName: botanicalNameByCode(
        locationEdits[data.target.key]?.botanicalCountryCode ?? data.target.botanicalCountryCode
      ),
      updates,
      speciesChecked: data.targetSpecies.length,
      onEdit: () => {
        setForceLocation(true);
        setStep(0);
      },
    }),
    [botanicalNameByCode, countryNameByCode, locationEdits]
  );

  const nameSummaries = useMemo(
    () => targetData.map((data) => buildSummary(data, data.withProblems.length)),
    [buildSummary, targetData]
  );

  const nativeSections = useMemo<NativeCheckProjectSection[]>(
    () =>
      targetData.map((data) => ({
        key: data.target.key,
        projectId: data.target.projectId,
        summary: buildSummary(data, data.pending.length),
        pending: data.pending,
      })),
    [buildSummary, targetData]
  );

  const hasAnyPending = nativeSections.some((section) => section.pending.length > 0);

  const goToStep = useCallback((key: StepKey) => setStep(stepKeys.indexOf(key)), [stepKeys]);

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

  const onSetLocations = useCallback(async () => {
    setBusy(true);
    try {
      await Promise.all(
        targets.map((target) => {
          const edit = locationEdits[target.key] ?? {};
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
              countryCode: edit.countryCode,
              botanicalCountryCode: edit.botanicalCountryCode,
            },
          }).unwrap();
        })
      );
      if (targets.some((target) => target.isOrg) && selectedOrganization) {
        await reloadOrganizations(selectedOrganization.id);
      }
      reloadSpecies();
      setLocationsSubmitted(true);
      setForceLocation(false);
      setStep(0);
    } catch {
      snackbar.toastError();
    }
    setBusy(false);
  }, [
    locationEdits,
    projects,
    reloadOrganizations,
    reloadSpecies,
    selectedOrganization,
    snackbar,
    targets,
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
      if (toAccept.length) {
        reloadSpecies();
      }
      goToStep('native');
    } catch {
      snackbar.toastError();
    }
    setBusy(false);
  }, [acceptProblem, goToStep, nameSelected, reloadSpecies, snackbar, speciesWithProblems]);

  const finish = useCallback(async () => {
    try {
      if (selectedOrganization && hasAnyPending) {
        await acceptPending({ organizationId: selectedOrganization.id }).unwrap();
      }
    } catch {
      snackbar.toastError();
    } finally {
      reloadSpecies();
    }
  }, [acceptPending, hasAnyPending, reloadSpecies, selectedOrganization, snackbar]);

  const onFinish = useCallback(async () => {
    setBusy(true);
    await finish();
    setBusy(false);
    onClose();
  }, [finish, onClose]);

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
      }
      if (selectedOrganization) {
        await acceptPending({ organizationId: selectedOrganization.id }).unwrap();
      }
      onClose();
    } catch {
      snackbar.toastError();
    } finally {
      reloadSpecies();
      setBusy(false);
    }
  }, [
    acceptPending,
    onClose,
    nativeSections,
    nativeSelected,
    overrideEdits,
    overrideSpecies,
    reloadSpecies,
    selectedOrganization,
    snackbar,
  ]);

  const allLocationEditsValid = targets.every((target) => {
    const edit = locationEdits[target.key] ?? {};
    return !!(edit.countryCode ?? target.countryCode) && !!(edit.botanicalCountryCode ?? target.botanicalCountryCode);
  });

  const allOverridesValid = [...nativeSelected].every(
    (key) => (overrideEdits[key]?.justification ?? '').trim().length > 0
  );

  const requestCancel = useCallback(() => {
    if (currentKey === 'setLocation') {
      onClose();
    } else {
      setShowCancel(true);
    }
  }, [currentKey, onClose]);

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
          onClick={() => void onSetLocations()}
          disabled={busy || !allLocationEditsValid}
        />,
      ];
    }

    if (currentKey === 'name') {
      const nameBackButton = includeSetLocation ? (
        <Button
          key='back'
          label={strings.BACK}
          onClick={() => goToStep('setLocation')}
          priority='secondary'
          type='passive'
          disabled={busy}
        />
      ) : null;
      const namePrimary =
        speciesWithProblems.length === 0 ? (
          <Button key='next' label={strings.NEXT} onClick={() => goToStep('native')} disabled={busy} />
        ) : (
          <Button
            key='acceptNext'
            label={strings.ACCEPT_AND_NEXT}
            onClick={() => void onAcceptNames()}
            disabled={busy}
          />
        );
      return [cancelButton, nameBackButton, namePrimary].filter((button): button is JSX.Element => button !== null);
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
    const primary = !hasAnyPending ? (
      <Button key='finish' label={strings.FINISH} onClick={() => void onFinish()} disabled={busy} />
    ) : (
      <Button
        key='override'
        label={strings.OVERRIDE}
        onClick={() => (nativeSelected.size > 0 ? setNativeMode('override') : void onFinish())}
        disabled={busy}
      />
    );
    return [cancelButton, backButton, primary];
  }, [
    allLocationEditsValid,
    allOverridesValid,
    busy,
    currentKey,
    goToStep,
    hasAnyPending,
    includeSetLocation,
    nativeMode,
    nativeSelected.size,
    onAcceptNames,
    onFinish,
    onOverride,
    onSetLocations,
    requestCancel,
    speciesWithProblems.length,
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

        {currentKey === 'setLocation' && (
          <SetLocationStep
            targets={targets}
            edits={locationEdits}
            countries={countries ?? []}
            botanicalCountries={botanicalCountries}
            onChange={(targetKey, edit) => setLocationEdits((previous) => ({ ...previous, [targetKey]: edit }))}
          />
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
    </>
  );
};

export default SpeciesCheckModal;
