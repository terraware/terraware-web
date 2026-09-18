import React, { type JSX, useCallback, useMemo, useState } from 'react';

import { Box, Typography, useTheme } from '@mui/material';
import { BusySpinner, Button } from '@terraware/web-components';
import { DateTime } from 'luxon';

import Page from 'src/components/Page';
import UnsavedChangesBadge from 'src/components/common/UnsavedChangesBadge';
import { APP_PATHS } from 'src/constants';
import { useProjects } from 'src/hooks/useProjects';
import { useSyncNavigate } from 'src/hooks/useSyncNavigate';
import { useOrganization } from 'src/providers/hooks';
import { useAssignSpeciesToProjectsMutation, useCreateSpeciesMutation } from 'src/queries/generated/species';
import SpeciesDetailsForm from 'src/scenes/Species/SpeciesDetailsForm';
import SpeciesProjectsSection from 'src/scenes/Species/SpeciesProjectsSection';
import strings from 'src/strings';
import { Species, SpeciesRequestError } from 'src/types/Species';
import useDeviceInfo from 'src/utils/useDeviceInfo';
import useForm from 'src/utils/useForm';

function initSpecies(species?: Species): Species {
  const now = DateTime.now().toISO();
  return (
    species ?? {
      createdTime: now,
      modifiedTime: now,
      scientificName: '',
      id: -1,
    }
  );
}

const getComparableSpecies = (species?: Species): string =>
  JSON.stringify({
    commonName: species?.commonName ?? '',
    conservationCategory: species?.conservationCategory ?? null,
    ecologicalRoleKnown: species?.ecologicalRoleKnown ?? '',
    ecosystemTypes: species?.ecosystemTypes ?? [],
    familyName: species?.familyName ?? '',
    growthForms: species?.growthForms ?? [],
    localUsesKnown: species?.localUsesKnown ?? '',
    nativeEcosystem: species?.nativeEcosystem ?? '',
    otherFacts: species?.otherFacts ?? '',
    plantMaterialSourcingMethods: species?.plantMaterialSourcingMethods ?? [],
    rare: species?.rare ?? false,
    scientificName: species?.scientificName ?? '',
    seedStorageBehavior: species?.seedStorageBehavior ?? null,
    successionalGroups: species?.successionalGroups ?? [],
  });

const EMPTY_SPECIES = getComparableSpecies();

type SpeciesAddViewProps = {
  reloadData: () => void;
};

export default function SpeciesAddView({ reloadData }: SpeciesAddViewProps): JSX.Element {
  const { selectedOrganization } = useOrganization();
  const { availableProjects } = useProjects();
  const hasMultipleProjects = (availableProjects?.length ?? 0) > 1;
  const organizationId = selectedOrganization?.id || -1; // TODO: Add null check for selectedOrganization
  const [record, setRecord, , onChangeCallback] = useForm<Species>(initSpecies());
  const [nameFormatError, setNameFormatError] = useState<string | string[]>('');
  const [createSpecies] = useCreateSpeciesMutation();
  const [assignSpeciesToProjects] = useAssignSpeciesToProjectsMutation();
  const [saving, setSaving] = useState(false);
  const navigate = useSyncNavigate();
  const { isMobile } = useDeviceInfo();
  const theme = useTheme();

  const [addedProjectIds, setAddedProjectIds] = useState<number[]>([]);

  const onAddProjectIds = useCallback((projectIds: number[]) => {
    setAddedProjectIds((previous) => [...previous, ...projectIds.filter((id) => !previous.includes(id))]);
  }, []);

  const onRemoveProjectIds = useCallback((projectIds: number[]) => {
    setAddedProjectIds((previous) => previous.filter((id) => !projectIds.includes(id)));
  }, []);

  const newGridSize = isMobile ? 12 : 4;

  const isDirty = useMemo(
    () => getComparableSpecies(record) !== EMPTY_SPECIES || addedProjectIds.length > 0,
    [record, addedProjectIds]
  );

  const createNewSpecies = async () => {
    if (organizationId === -1) {
      return;
    }
    if (!record.scientificName) {
      setNameFormatError(strings.REQUIRED_FIELD);
      return;
    }

    setSaving(true);
    try {
      const { id } = await createSpecies({
        organizationId,
        scientificName: record.scientificName,
        commonName: record.commonName,
        conservationCategory: record.conservationCategory,
        ecologicalRoleKnown: record.ecologicalRoleKnown,
        ecosystemTypes: record.ecosystemTypes,
        familyName: record.familyName,
        growthForms: record.growthForms,
        localUsesKnown: record.localUsesKnown,
        nativeEcosystem: record.nativeEcosystem,
        otherFacts: record.otherFacts,
        plantMaterialSourcingMethods: record.plantMaterialSourcingMethods,
        rare: record.rare,
        seedStorageBehavior: record.seedStorageBehavior,
        successionalGroups: record.successionalGroups,
      }).unwrap();
      if (addedProjectIds.length) {
        await assignSpeciesToProjects({ species: [{ speciesId: id, projectIds: addedProjectIds }] }).unwrap();
      }
      reloadData();
      navigate(APP_PATHS.SPECIES_DETAILS.replace(':speciesId', id.toString()));
    } catch (e) {
      const errorMessage = (e as { data?: { error?: { message?: string } } })?.data?.error?.message;
      if (errorMessage === SpeciesRequestError.PreexistingSpecies) {
        setNameFormatError(strings.formatString(strings.EXISTING_SPECIES_MSG, record.scientificName));
      }
    } finally {
      setSaving(false);
    }
  };

  const title = (
    <Box
      alignItems='center'
      display='flex'
      flexWrap='wrap'
      gap={theme.spacing(1.5)}
      sx={{ paddingLeft: theme.spacing(3) }}
    >
      <Typography component='h2' fontSize='24px' fontWeight={600} margin={0}>
        {strings.ADD_SPECIES}
      </Typography>
      {isDirty && <UnsavedChangesBadge />}
    </Box>
  );

  const rightComponent = (
    <Box alignItems='center' display='flex' gap={theme.spacing(1)} justifyContent='flex-end'>
      <Button
        disabled={saving}
        id='cancelAddSpecies'
        label={strings.CANCEL}
        onClick={() => navigate(APP_PATHS.SPECIES)}
        priority='secondary'
        size='medium'
        type='passive'
      />
      <Button
        disabled={!isDirty || saving}
        id='saveAddSpecies'
        label={strings.SAVE}
        onClick={() => void createNewSpecies()}
        size='medium'
      />
    </Box>
  );

  return (
    <Page rightComponent={rightComponent} stickyHeader stickyHeaderElevated={isDirty} title={title}>
      {saving && <BusySpinner withSkrim={true} />}
      <Box
        sx={{
          backgroundColor: theme.palette.TwClrBg,
          borderRadius: '32px',
          margin: 0,
          padding: theme.spacing(3),
          width: '100%',
        }}
      >
        <SpeciesDetailsForm
          gridSize={newGridSize}
          record={record}
          onChange={onChangeCallback}
          setRecord={setRecord}
          nameFormatError={nameFormatError}
          setNameFormatError={setNameFormatError}
        />
        {hasMultipleProjects && (
          <Box marginTop={theme.spacing(4)} width='100%'>
            <SpeciesProjectsSection
              speciesId={record.id}
              speciesName={record.scientificName}
              editMode
              addedProjectIds={addedProjectIds}
              onAddProjectIds={onAddProjectIds}
              onRemoveProjectIds={onRemoveProjectIds}
            />
          </Box>
        )}
      </Box>
    </Page>
  );
}
