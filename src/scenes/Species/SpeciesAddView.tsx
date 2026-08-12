import React, { type JSX, useCallback, useState } from 'react';

import { Box, Container, Grid, Typography, useTheme } from '@mui/material';
import { BusySpinner } from '@terraware/web-components';
import { DateTime } from 'luxon';

import PageForm from 'src/components/common/PageForm';
import TfMain from 'src/components/common/TfMain';
import { APP_PATHS } from 'src/constants';
import isEnabled from 'src/features';
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
  const [createSpecies, { isLoading: isBusy }] = useCreateSpeciesMutation();
  const [assignSpeciesToProjects] = useAssignSpeciesToProjectsMutation();
  const navigate = useSyncNavigate();
  const { isMobile } = useDeviceInfo();
  const theme = useTheme();

  const speciesIntelligenceEnabled = isEnabled('Species Intelligence');
  const [addedProjectIds, setAddedProjectIds] = useState<number[]>([]);

  const onAddProjectIds = useCallback((projectIds: number[]) => {
    setAddedProjectIds((previous) => [...previous, ...projectIds.filter((id) => !previous.includes(id))]);
  }, []);

  const onRemoveProjectIds = useCallback((projectIds: number[]) => {
    setAddedProjectIds((previous) => previous.filter((id) => !projectIds.includes(id)));
  }, []);

  const newGridSize = isMobile ? 12 : 4;

  const createNewSpecies = async () => {
    if (organizationId === -1) {
      return;
    }
    if (!record.scientificName) {
      setNameFormatError(strings.REQUIRED_FIELD);
      return;
    }

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
      if (speciesIntelligenceEnabled && addedProjectIds.length) {
        await assignSpeciesToProjects({ species: [{ speciesId: id, projectIds: addedProjectIds }] }).unwrap();
      }
      reloadData();
      navigate(APP_PATHS.SPECIES_DETAILS.replace(':speciesId', id.toString()));
    } catch (e) {
      const errorMessage = (e as { data?: { error?: { message?: string } } })?.data?.error?.message;
      if (errorMessage === SpeciesRequestError.PreexistingSpecies) {
        setNameFormatError(strings.formatString(strings.EXISTING_SPECIES_MSG, record.scientificName));
      }
    }
  };

  return (
    <TfMain>
      {isBusy && <BusySpinner withSkrim={true} />}
      <PageForm
        cancelID='cancelAddSpecies'
        saveID='saveAddSpecies'
        onCancel={() => navigate(APP_PATHS.SPECIES)}
        onSave={() => void createNewSpecies()}
      >
        <Typography variant='h2' sx={{ fontSize: '24px', fontWeight: 'bold', paddingLeft: theme.spacing(3) }}>
          {strings.ADD_SPECIES}
        </Typography>
        <Container
          maxWidth={false}
          sx={{
            display: 'flex',
            margin: '0 auto',
            width: '100%',
            paddingLeft: theme.spacing(isMobile ? 0 : 4),
            paddingRight: theme.spacing(isMobile ? 0 : 4),
            paddingTop: theme.spacing(2),
          }}
        >
          <Grid
            container
            width={'100%'}
            sx={{
              backgroundColor: theme.palette.TwClrBg,
              borderRadius: theme.spacing(4),
              padding: theme.spacing(3),
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
            {speciesIntelligenceEnabled && hasMultipleProjects && (
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
          </Grid>
        </Container>
      </PageForm>
    </TfMain>
  );
}
