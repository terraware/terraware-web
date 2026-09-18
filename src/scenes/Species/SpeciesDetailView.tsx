import React, { type JSX, useCallback, useEffect, useMemo, useState } from 'react';
import { useLocation, useParams } from 'react-router';

import { Box, Grid, GridProps, Typography, useTheme } from '@mui/material';
import { Badge, BusySpinner, Button, DropdownItem } from '@terraware/web-components';
import { DateTime } from 'luxon';

import Page from 'src/components/Page';
import Checkbox from 'src/components/common/Checkbox';
import Link from 'src/components/common/Link';
import OptionsMenu from 'src/components/common/OptionsMenu';
import TextField from 'src/components/common/Textfield/Textfield';
import UnsavedChangesBadge from 'src/components/common/UnsavedChangesBadge';
import TooltipButton from 'src/components/common/button/TooltipButton';
import { APP_PATHS } from 'src/constants';
import { useProjects } from 'src/hooks/useProjects';
import { useSyncNavigate } from 'src/hooks/useSyncNavigate';
import { useParticipantData } from 'src/providers/Participant/ParticipantContext';
import { useOrganization } from 'src/providers/hooks';
import {
  useAssignSpeciesToProjectsMutation,
  useDeleteSpeciesMutation,
  useLazyGetSpeciesQuery,
  useUnassignSpeciesFromProjectsMutation,
  useUpdateSpeciesMutation,
} from 'src/queries/generated/species';
import {
  requestAddManyAcceleratorProjectSpecies,
  requestDeleteManyAcceleratorProjectSpecies,
} from 'src/redux/features/acceleratorProjectSpecies/acceleratorProjectSpeciesAsyncThunks';
import { useAppDispatch } from 'src/redux/store';
import SpeciesDetailsForm from 'src/scenes/Species/SpeciesDetailsForm';
import { CreateAcceleratorProjectSpeciesRequestPayload } from 'src/services/AcceleratorProjectSpeciesService';
import strings from 'src/strings';
import {
  Species,
  getConservationCategoryString,
  getEcosystemTypesString,
  getGrowthFormsString,
  getPlantMaterialSourcingMethodsString,
  getSeedStorageBehaviorString,
  getSuccessionalGroupsString,
} from 'src/types/Species';
import { isContributor } from 'src/utils/organization';
import useDeviceInfo from 'src/utils/useDeviceInfo';
import useForm from 'src/utils/useForm';
import useSnackbar from 'src/utils/useSnackbar';

import { ProjectSpecies } from './AddToProjectModal';
import DeleteSpeciesModal from './DeleteSpeciesModal';
import OverrideSpeciesModal from './OverrideSpeciesModal';
import SpeciesDataSourceBadge from './SpeciesDataSourceBadge';
import SpeciesDataSourceField from './SpeciesDataSourceField';
import SpeciesNativityBadge from './SpeciesNativityBadge';
import SpeciesProjectsSection from './SpeciesProjectsSection';
import SpeciesProjectsTable from './SpeciesProjectsTable';
import StatusDetailsModal from './StatusDetailsModal';

function initSpecies(): Species {
  const now = DateTime.now().toISO();
  return {
    createdTime: now,
    modifiedTime: now,
    scientificName: '',
    id: -1,
  };
}

// The fields the edit form can change, normalized so a fresh load compares equal to its own seed
// (undefined/empty/missing collapse to a single canonical value) for dirty detection.
const getComparableSpecies = (species?: Species): string =>
  JSON.stringify({
    averageWoodDensity: species?.averageWoodDensity ?? null,
    commonName: species?.commonName ?? '',
    conservationCategory: species?.conservationCategory ?? null,
    dbhSource: species?.dbhSource ?? null,
    dbhValue: species?.dbhValue ?? null,
    ecologicalRoleKnown: species?.ecologicalRoleKnown ?? '',
    ecosystemTypes: species?.ecosystemTypes ?? [],
    familyName: species?.familyName ?? '',
    growthForms: species?.growthForms ?? [],
    heightAtMaturitySource: species?.heightAtMaturitySource ?? null,
    heightAtMaturityValue: species?.heightAtMaturityValue ?? null,
    localUsesKnown: species?.localUsesKnown ?? '',
    nativeEcosystem: species?.nativeEcosystem ?? '',
    otherFacts: species?.otherFacts ?? '',
    plantMaterialSourcingMethods: species?.plantMaterialSourcingMethods ?? [],
    rare: species?.rare ?? false,
    scientificName: species?.scientificName ?? '',
    seedStorageBehavior: species?.seedStorageBehavior ?? null,
    successionalGroups: species?.successionalGroups ?? [],
    woodDensityLevel: species?.woodDensityLevel ?? null,
  });

type SpeciesDetailViewProps = {
  initialEditing?: boolean;
  reloadData: () => void;
};

export default function SpeciesDetailView({ initialEditing = false, reloadData }: SpeciesDetailViewProps): JSX.Element {
  const theme = useTheme();
  const navigate = useSyncNavigate();
  const location = useLocation();
  const { isMobile } = useDeviceInfo();
  const { selectedOrganization } = useOrganization();
  const { availableProjects } = useProjects();
  const hasMultipleProjects = (availableProjects?.length ?? 0) > 1;
  const { speciesId } = useParams<{ speciesId: string }>();
  const userCanEdit = !isContributor(selectedOrganization);
  const [deleteSpeciesModalOpen, setDeleteSpeciesModalOpen] = useState(false);
  const [overrideModalOpen, setOverrideModalOpen] = useState(false);
  const [statusDetailsOpen, setStatusDetailsOpen] = useState(false);
  const snackbar = useSnackbar();
  const { orgHasParticipants } = useParticipantData();
  const showOrgNativity = !hasMultipleProjects;

  const [isEditing, setIsEditing] = useState(initialEditing);
  const editing = isEditing && userCanEdit;

  const [getSpecies, { currentData: speciesData, isError: getSpeciesError }] = useLazyGetSpeciesQuery();
  const species = speciesData?.species;

  const [deleteSpecies, { isLoading: isDeleting }] = useDeleteSpeciesMutation();
  const [updateSpecies] = useUpdateSpeciesMutation();
  const [assignSpeciesToProjects] = useAssignSpeciesToProjectsMutation();
  const [unassignSpeciesFromProjects] = useUnassignSpeciesFromProjectsMutation();

  const [record, setRecord, , onChangeCallback] = useForm<Species>(initSpecies());
  const [nameFormatError, setNameFormatError] = useState<string | string[]>('');
  const [saving, setSaving] = useState(false);

  const [addedProjectIds, setAddedProjectIds] = useState<number[]>([]);
  const [removedProjectIds, setRemovedProjectIds] = useState<number[]>([]);
  const [addedProjectsSpecies, setAddedProjectsSpecies] = useState<ProjectSpecies[]>();
  const [removedProjectsIds, setRemovedProjectsIds] = useState<number[]>();

  const dispatch = useAppDispatch();

  const reloadSpecies = useCallback(() => {
    if (selectedOrganization && speciesId) {
      void getSpecies({ speciesId: Number(speciesId), organizationId: selectedOrganization.id }, true);
    }
  }, [getSpecies, selectedOrganization, speciesId]);

  useEffect(() => {
    reloadSpecies();
  }, [reloadSpecies]);

  useEffect(() => {
    if (getSpeciesError) {
      navigate(APP_PATHS.SPECIES);
    }
  }, [getSpeciesError, navigate]);

  // Seed the editable record from the fetched species so the form shows current values and dirty
  // detection has a faithful baseline to compare against.
  useEffect(() => {
    if (species) {
      setRecord({ ...species });
    }
  }, [species, setRecord]);

  const gridSize = useMemo(() => (isMobile ? 12 : 4), [isMobile]);

  const isDirty = useMemo(() => {
    // record.id !== species.id means the record has not been seeded from this species yet, so any
    // difference is just the initial empty state rather than a real edit.
    if (!species || record.id !== species.id) {
      return false;
    }
    const fieldsDirty = getComparableSpecies(record) !== getComparableSpecies(species);
    const projectsDirty =
      addedProjectIds.length > 0 ||
      removedProjectIds.length > 0 ||
      (addedProjectsSpecies?.length ?? 0) > 0 ||
      (removedProjectsIds?.length ?? 0) > 0;
    return fieldsDirty || projectsDirty;
  }, [species, record, addedProjectIds, removedProjectIds, addedProjectsSpecies, removedProjectsIds]);

  const onAddProjectIds = useCallback((projectIds: number[]) => {
    setAddedProjectIds((previous) => [...previous, ...projectIds.filter((id) => !previous.includes(id))]);
  }, []);

  const onRemoveProjectIds = useCallback(
    (projectIds: number[]) => {
      // Staged (not-yet-saved) additions are simply dropped; already-assigned projects are staged
      // for unassignment on save.
      const stagedRemovals = projectIds.filter((id) => !addedProjectIds.includes(id));
      setAddedProjectIds((previous) => previous.filter((id) => !projectIds.includes(id)));
      setRemovedProjectIds((previous) => [...previous, ...stagedRemovals.filter((id) => !previous.includes(id))]);
    },
    [addedProjectIds]
  );

  const onRemoveExistingHandler = (removedIds: number[]) => {
    setRemovedProjectsIds(removedIds);
  };

  const onRemoveNewHandler = (removedIds: number[]) => {
    setAddedProjectsSpecies((oldProjectsSpecies) =>
      oldProjectsSpecies?.filter((oPS) => !removedIds.includes(oPS.project.id))
    );
  };

  const onAddHandler = (addedProjectSpecies: ProjectSpecies[]) => {
    setAddedProjectsSpecies((oldProjectSpecies) =>
      oldProjectSpecies ? [...oldProjectSpecies, ...addedProjectSpecies] : addedProjectSpecies
    );
  };

  const clearProjectStaging = useCallback(() => {
    setAddedProjectIds([]);
    setRemovedProjectIds([]);
    setAddedProjectsSpecies(undefined);
    setRemovedProjectsIds(undefined);
  }, []);

  const exitEditMode = useCallback(() => {
    setIsEditing(false);
    // Deep links (e.g. fixing a flagged species) land on the /edit path; put the URL back to the
    // read view once we leave edit mode.
    if (speciesId && location.pathname.endsWith('/edit')) {
      navigate(APP_PATHS.SPECIES_DETAILS.replace(':speciesId', speciesId), { replace: true });
    }
  }, [location.pathname, navigate, speciesId]);

  const onEdit = useCallback(() => setIsEditing(true), []);

  const onCancel = useCallback(() => {
    if (species) {
      setRecord({ ...species });
    }
    clearProjectStaging();
    setNameFormatError('');
    exitEditMode();
  }, [clearProjectStaging, exitEditMode, setRecord, species]);

  const finishSave = useCallback(() => {
    clearProjectStaging();
    reloadSpecies();
    reloadData();
    snackbar.toastSuccess(strings.CHANGES_SAVED);
    exitEditMode();
  }, [clearProjectStaging, exitEditMode, reloadData, reloadSpecies, snackbar]);

  const saveSpecies = async () => {
    if (!selectedOrganization) {
      return;
    }
    if (!record.scientificName) {
      setNameFormatError(strings.REQUIRED_FIELD);
      return;
    }

    setSaving(true);
    try {
      await updateSpecies({
        speciesId: record.id,
        updateSpeciesRequestPayload: {
          organizationId: selectedOrganization.id,
          scientificName: record.scientificName,
          averageWoodDensity: record.averageWoodDensity,
          commonName: record.commonName,
          conservationCategory: record.conservationCategory,
          dbhSource: record.dbhSource,
          dbhValue: record.dbhValue,
          ecologicalRoleKnown: record.ecologicalRoleKnown,
          ecosystemTypes: record.ecosystemTypes,
          familyName: record.familyName,
          growthForms: record.growthForms,
          heightAtMaturitySource: record.heightAtMaturitySource,
          heightAtMaturityValue: record.heightAtMaturityValue,
          localUsesKnown: record.localUsesKnown,
          nativeEcosystem: record.nativeEcosystem,
          otherFacts: record.otherFacts,
          plantMaterialSourcingMethods: record.plantMaterialSourcingMethods,
          rare: record.rare,
          seedStorageBehavior: record.seedStorageBehavior,
          successionalGroups: record.successionalGroups,
          woodDensityLevel: record.woodDensityLevel,
        },
      }).unwrap();

      if (addedProjectIds.length && speciesId) {
        await assignSpeciesToProjects({
          species: [{ speciesId: Number(speciesId), projectIds: addedProjectIds }],
        }).unwrap();
      }

      if (removedProjectIds.length && speciesId) {
        await unassignSpeciesFromProjects({
          species: [{ speciesId: Number(speciesId), projectIds: removedProjectIds }],
        }).unwrap();
      }

      // These accelerator project species mutations are awaited too, so a failure lands in the catch
      // below with the staged changes still intact for the user to retry.
      if (removedProjectsIds?.length) {
        await dispatch(requestDeleteManyAcceleratorProjectSpecies(removedProjectsIds)).unwrap();
      }
      if (addedProjectsSpecies?.length && speciesId) {
        const createRequests = addedProjectsSpecies.map(
          (aPS) =>
            ({
              projectId: aPS.project.id,
              speciesId: Number(speciesId),
              speciesNativeCategory: aPS.nativeCategory,
            }) as CreateAcceleratorProjectSpeciesRequestPayload
        );
        await dispatch(requestAddManyAcceleratorProjectSpecies(createRequests)).unwrap();
      }
    } catch (e) {
      // Keep the staged edits and stay in edit mode so nothing is lost and the user can retry.
      if ((e as { status?: number })?.status === 409) {
        snackbar.toastError(strings.formatString(strings.EXISTING_SPECIES_MSG, record.scientificName));
      } else {
        snackbar.toastError();
      }
      return;
    } finally {
      setSaving(false);
    }

    // Reached only when every requested mutation succeeded.
    finishSave();
  };

  const onOptionItemClick = (optionItem: DropdownItem) => {
    if (optionItem.value === 'delete') {
      setDeleteSpeciesModalOpen(true);
    }
  };

  const deleteSelectedSpecies = async (id: number) => {
    try {
      await deleteSpecies(id).unwrap();
      reloadData();
    } catch {
      snackbar.toastError(strings.GENERIC_ERROR);
    }
    setDeleteSpeciesModalOpen(false);
    navigate(APP_PATHS.SPECIES);
  };

  const GridItemWrapper = useCallback(
    ({ children, props }: { children: JSX.Element; props?: GridProps }) => (
      <Grid item xs={gridSize} {...props} minHeight={'64px'} paddingBottom={theme.spacing(2)}>
        {children}
      </Grid>
    ),
    [gridSize, theme]
  );

  const orgScopeKnown = availableProjects !== undefined && availableProjects.length <= 1;
  const orgNativityElement = useMemo(() => {
    const elements = species?.projects ?? [];
    const nativityOf = (element?: (typeof elements)[number]) =>
      element?.overriddenNativity ?? element?.calculatedNativity;
    const orgElement = elements.find((element) => element.projectId === undefined);
    if (nativityOf(orgElement) || !orgScopeKnown) {
      return orgElement;
    }
    return elements.find((element) => nativityOf(element)) ?? orgElement;
  }, [species, orgScopeKnown]);
  const orgNativity = orgNativityElement?.overriddenNativity ?? orgNativityElement?.calculatedNativity;
  const orgIsOverridden = !!orgNativityElement?.overriddenNativity;

  const title = (
    <Box
      alignItems='center'
      display='flex'
      flexWrap='wrap'
      gap={theme.spacing(1.5)}
      sx={{ paddingLeft: theme.spacing(3) }}
    >
      <Typography fontSize='24px' fontWeight={600}>
        {species?.scientificName}
      </Typography>
      {editing && isDirty && <UnsavedChangesBadge />}
    </Box>
  );

  const rightComponent = editing ? (
    <Box alignItems='center' display='flex' gap={theme.spacing(1)} justifyContent='flex-end'>
      <Button
        disabled={saving}
        id='cancelEditSpecies'
        label={strings.CANCEL}
        onClick={onCancel}
        priority='secondary'
        size='medium'
        type='passive'
      />
      <Button
        disabled={!isDirty || saving}
        id='saveEditSpecies'
        label={strings.SAVE}
        onClick={() => void saveSpecies()}
        size='medium'
      />
    </Box>
  ) : userCanEdit ? (
    <Box alignItems='center' display='inline-flex' justifyContent='flex-end'>
      <Button
        icon='iconEdit'
        label={isMobile ? undefined : strings.EDIT_SPECIES}
        priority='primary'
        size='medium'
        onClick={onEdit}
      />
      <OptionsMenu
        onOptionItemClick={onOptionItemClick}
        optionItems={[{ label: strings.DELETE, value: 'delete', type: 'destructive' }]}
      />
    </Box>
  ) : undefined;

  return (
    <Page
      crumbs={editing ? undefined : [{ name: strings.SPECIES, to: APP_PATHS.SPECIES }]}
      hierarchicalCrumbs={false}
      rightComponent={rightComponent}
      stickyHeader
      stickyHeaderElevated={editing && isDirty}
      title={title}
    >
      {(isDeleting || saving) && <BusySpinner withSkrim={true} />}
      <Box
        sx={{
          backgroundColor: theme.palette.TwClrBg,
          borderRadius: '32px',
          margin: 0,
          padding: theme.spacing(3),
          width: '100%',
        }}
      >
        {editing ? (
          <>
            <SpeciesDetailsForm
              gridSize={gridSize}
              record={record}
              onChange={onChangeCallback}
              setRecord={setRecord}
              nameFormatError={nameFormatError}
              setNameFormatError={setNameFormatError}
              onAdd={onAddHandler}
              onRemoveExisting={onRemoveExistingHandler}
              onRemoveNew={onRemoveNewHandler}
              addedProjectsSpecies={addedProjectsSpecies}
              removedProjectsIds={removedProjectsIds}
            />
            {hasMultipleProjects && species && (
              <Box marginTop={theme.spacing(4)}>
                <SpeciesProjectsSection
                  speciesId={species.id}
                  speciesName={species.scientificName}
                  speciesProjects={species.projects}
                  editMode
                  addedProjectIds={addedProjectIds}
                  removedProjectIds={removedProjectIds}
                  onAddProjectIds={onAddProjectIds}
                  onRemoveProjectIds={onRemoveProjectIds}
                />
              </Box>
            )}
          </>
        ) : (
          <Grid container>
            <GridItemWrapper>
              <TextField
                label={strings.SCIENTIFIC_NAME}
                id='scientificName'
                type='text'
                value={species?.scientificName}
                display={true}
              />
            </GridItemWrapper>
            <GridItemWrapper>
              <SpeciesDataSourceField
                id='commonName'
                label={strings.COMMON_NAME}
                source={species?.commonNameSource}
                speciesId={species?.id}
                tooltipTitle={strings.TOOLTIP_COMMON_NAME}
                value={species?.commonName}
              />
            </GridItemWrapper>
            <GridItemWrapper>
              <SpeciesDataSourceField
                id='family'
                label={strings.FAMILY}
                source={species?.familyNameSource}
                speciesId={species?.id}
                value={species?.familyName}
              />
            </GridItemWrapper>
            <GridItemWrapper>
              <TextField
                id={'conservationCategory'}
                label={strings.CONSERVATION_CATEGORY}
                value={getConservationCategoryString(species?.conservationCategory)}
                tooltipTitle={strings.TOOLTIP_SPECIES_CONSERVATION_CATEGORY}
                type='text'
                display={true}
              />
            </GridItemWrapper>
            <GridItemWrapper>
              <TextField
                id={'growthForms'}
                label={strings.GROWTH_FORM}
                value={getGrowthFormsString(species)}
                tooltipTitle={strings.TOOLTIP_SPECIES_GROWTH_FORM}
                type='text'
                aria-label='date-picker'
                display={true}
              />
            </GridItemWrapper>
            <GridItemWrapper>
              <Checkbox
                id='Rare'
                name='rare'
                label={strings.RARE}
                disabled={true}
                onChange={() => {
                  return;
                }}
                sx={{ display: 'block' }}
                value={species?.rare}
              />
            </GridItemWrapper>
            <GridItemWrapper>
              <TextField
                id={'nativeEcosistem'}
                label={strings.NATIVE_ECOSYSTEM}
                value={species?.nativeEcosystem}
                type='text'
                display={true}
              />
            </GridItemWrapper>
            <GridItemWrapper>
              <TextField
                id={'successionalGroup'}
                label={strings.SUCCESSIONAL_GROUP}
                value={getSuccessionalGroupsString(species)}
                type='text'
                display={true}
              />
            </GridItemWrapper>
            <GridItemWrapper>
              <TextField
                id={'ecosystemType'}
                label={strings.ECOSYSTEM_TYPE}
                value={getEcosystemTypesString(species)}
                tooltipTitle={strings.TOOLTIP_ECOSYSTEM_TYPE}
                type='text'
                display={true}
              />
            </GridItemWrapper>
            <GridItemWrapper>
              <TextField
                id={'ecologicalRoleKnown'}
                label={strings.ECOLOGICAL_ROLE_KNOWN}
                value={species?.ecologicalRoleKnown}
                type='text'
                display={true}
                tooltipTitle={strings.ECOLOGICAL_ROLE_KNOWN_TOOLTIP}
              />
            </GridItemWrapper>
            <GridItemWrapper>
              <TextField
                id={'localUsesKnown'}
                label={strings.LOCAL_USES_KNOWN}
                value={species?.localUsesKnown}
                type='text'
                display={true}
                tooltipTitle={strings.LOCAL_USES_KNOWN_TOOLTIP}
              />
            </GridItemWrapper>
            <GridItemWrapper>
              <TextField
                id={'seedStorageBehavior'}
                label={strings.SEED_STORAGE_BEHAVIOR}
                value={getSeedStorageBehaviorString(species)}
                tooltipTitle={strings.TOOLTIP_SPECIES_SEED_STORAGE_BEHAVIOR}
                type='text'
                display={true}
              />
            </GridItemWrapper>
            <GridItemWrapper>
              <TextField
                id={'plantMaterialSourcingMethod'}
                label={strings.PLANT_MATERIAL_SOURCING_METHOD}
                value={getPlantMaterialSourcingMethodsString(species)}
                type='text'
                display={true}
                tooltipTitle={
                  <>
                    <ul style={{ paddingLeft: '16px' }}>
                      <li>{strings.PLANT_MATERIAL_SOURCING_METHOD_TOOLTIP_SEED_COLLECTION_AND_GERMINATION}</li>
                      <li>{strings.PLANT_MATERIAL_SOURCING_METHOD_TOOLTIP_SEED_PURCHASE_AND_GERMINATION}</li>
                      <li>{strings.PLANT_MATERIAL_SOURCING_METHOD_TOOLTIP_MANGROVE_PROPAGULES}</li>
                      <li>{strings.PLANT_MATERIAL_SOURCING_METHOD_TOOLTIP_VEGETATIVE_PROPAGATION}</li>
                      <li>{strings.PLANT_MATERIAL_SOURCING_METHOD_TOOLTIP_WILDLING_HARVEST}</li>
                      <li>{strings.PLANT_MATERIAL_SOURCING_METHOD_TOOLTIP_SEEDLING_PURCHASE}</li>
                    </ul>
                  </>
                }
              />
            </GridItemWrapper>
            <GridItemWrapper props={{ xs: isMobile ? 12 : showOrgNativity ? 4 : 8 }}>
              <TextField
                id={'otherFacts'}
                label={strings.OTHER_FACTS}
                value={species?.otherFacts}
                type='textarea'
                display={true}
              />
            </GridItemWrapper>
            {showOrgNativity && (
              <GridItemWrapper>
                <Box>
                  <Typography color={theme.palette.TwClrTxtSecondary} fontSize='14px' fontWeight={400}>
                    {strings.STATUS}
                  </Typography>
                  <Box
                    display='flex'
                    alignItems='center'
                    flexWrap='wrap'
                    gap={theme.spacing(1)}
                    marginTop={theme.spacing(1)}
                  >
                    {orgNativity ? (
                      <SpeciesNativityBadge nativity={orgNativity} />
                    ) : (
                      <Badge
                        label={strings.NOT_SET}
                        backgroundColor={theme.palette.TwClrBgSecondary}
                        borderColor={theme.palette.TwClrBrdrSecondary}
                        labelColor={theme.palette.TwClrTxtSecondary}
                      />
                    )}
                    <SpeciesDataSourceBadge
                      source={orgNativityElement?.calculatedNativitySource}
                      speciesId={species?.id}
                      fieldName='nativity'
                    />
                    {userCanEdit && !orgIsOverridden && (
                      <TooltipButton
                        id='override-org-nativity'
                        label={strings.OVERRIDE}
                        priority='secondary'
                        type='passive'
                        size='small'
                        disabled={!orgNativity}
                        tooltip={!orgNativity ? strings.OVERRIDE_STATUS_NOT_SET_TOOLTIP_ORG : undefined}
                        onClick={() => setOverrideModalOpen(true)}
                      />
                    )}
                  </Box>
                  {orgIsOverridden && (
                    <Box marginTop={theme.spacing(1)}>
                      <Link onClick={() => setStatusDetailsOpen(true)}>{strings.SEE_DETAILS}</Link>
                    </Box>
                  )}
                </Box>
              </GridItemWrapper>
            )}
            {species && orgHasParticipants && <SpeciesProjectsTable speciesId={species.id} editMode={false} />}
            {hasMultipleProjects && species && (
              <Grid item xs={12} marginTop={theme.spacing(4)}>
                <SpeciesProjectsSection
                  speciesId={species.id}
                  speciesName={species.scientificName}
                  speciesProjects={species.projects}
                />
              </Grid>
            )}
          </Grid>
        )}
      </Box>
      {species && (
        <DeleteSpeciesModal
          open={deleteSpeciesModalOpen}
          onClose={() => setDeleteSpeciesModalOpen(false)}
          onSubmit={(toDelete: number) => void deleteSelectedSpecies(toDelete)}
          speciesToDelete={species}
        />
      )}
      {overrideModalOpen && species && (
        <OverrideSpeciesModal
          onClose={() => setOverrideModalOpen(false)}
          speciesId={species.id}
          speciesName={species.scientificName}
          targetName={selectedOrganization?.name}
          countryCode={selectedOrganization?.countryCode}
          botanicalCountryCode={selectedOrganization?.botanicalCountryCode}
          currentNativity={orgNativity}
          currentJustification={orgNativityElement?.overriddenJustification}
        />
      )}
      {statusDetailsOpen && (
        <StatusDetailsModal
          onClose={() => setStatusDetailsOpen(false)}
          onEdit={
            userCanEdit
              ? () => {
                  setStatusDetailsOpen(false);
                  setOverrideModalOpen(true);
                }
              : undefined
          }
          speciesName={species?.scientificName}
          targetName={selectedOrganization?.name}
          countryCode={selectedOrganization?.countryCode}
          botanicalCountryCode={selectedOrganization?.botanicalCountryCode}
          nativity={orgNativity}
          overriddenBy={orgNativityElement?.overriddenByName}
          overriddenTime={orgNativityElement?.overriddenTime}
          justification={orgNativityElement?.overriddenJustification}
        />
      )}
    </Page>
  );
}
