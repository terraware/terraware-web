import React, { type JSX, useCallback, useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router';

import { Box, Grid, GridProps, Typography, useTheme } from '@mui/material';
import { BusySpinner } from '@terraware/web-components';
import { Button, DropdownItem } from '@terraware/web-components';

import PageSnackbar from 'src/components/PageSnackbar';
import BackToLink from 'src/components/common/BackToLink';
import Checkbox from 'src/components/common/Checkbox';
import OptionsMenu from 'src/components/common/OptionsMenu';
import { APP_PATHS } from 'src/constants';
import isEnabled from 'src/features';
import { useProjects } from 'src/hooks/useProjects';
import { useSyncNavigate } from 'src/hooks/useSyncNavigate';
import { useParticipantData } from 'src/providers/Participant/ParticipantContext';
import { useOrganization } from 'src/providers/hooks';
import {
  SpeciesDataSourcePayload,
  useDeleteSpeciesMutation,
  useLazyGetSpeciesQuery,
} from 'src/queries/generated/species';
import strings from 'src/strings';
import {
  getConservationCategoryString,
  getEcosystemTypesString,
  getGrowthFormsString,
  getPlantMaterialSourcingMethodsString,
  getSeedStorageBehaviorString,
  getSuccessionalGroupsString,
} from 'src/types/Species';
import { isContributor } from 'src/utils/organization';
import useDeviceInfo from 'src/utils/useDeviceInfo';
import useSnackbar from 'src/utils/useSnackbar';

import TextField from '../../components/common/Textfield/Textfield';
import TfMain from '../../components/common/TfMain';
import DeleteSpeciesModal from './DeleteSpeciesModal';
import OverrideSpeciesModal from './OverrideSpeciesModal';
import SpeciesDataSourceBadge from './SpeciesDataSourceBadge';
import SpeciesDataSourceField from './SpeciesDataSourceField';
import SpeciesNativityBadge from './SpeciesNativityBadge';
import SpeciesProjectsSection from './SpeciesProjectsSection';
import SpeciesProjectsTable from './SpeciesProjectsTable';

type SpeciesDetailViewProps = {
  reloadData: () => void;
};

export default function SpeciesDetailView({ reloadData }: SpeciesDetailViewProps): JSX.Element {
  const theme = useTheme();
  const navigate = useSyncNavigate();
  const { isMobile } = useDeviceInfo();
  const { selectedOrganization } = useOrganization();
  const { availableProjects } = useProjects();
  const hasMultipleProjects = (availableProjects?.length ?? 0) > 1;
  const { speciesId } = useParams<{ speciesId: string }>();
  const userCanEdit = !isContributor(selectedOrganization);
  const [deleteSpeciesModalOpen, setDeleteSpeciesModalOpen] = useState(false);
  const [overrideModalOpen, setOverrideModalOpen] = useState(false);
  const snackbar = useSnackbar();
  const { orgHasParticipants } = useParticipantData();
  const speciesIntelligenceEnabled = isEnabled('Species Intelligence');
  const showOrgNativity = speciesIntelligenceEnabled && !hasMultipleProjects;

  const [getSpecies, { currentData: speciesData, isError: getSpeciesError }] = useLazyGetSpeciesQuery();
  const species = speciesData?.species;

  const [deleteSpecies, { isLoading: isDeleting }] = useDeleteSpeciesMutation();

  useEffect(() => {
    if (selectedOrganization && speciesId) {
      void getSpecies({ speciesId: Number(speciesId), organizationId: selectedOrganization.id }, true);
    }
  }, [getSpecies, selectedOrganization, speciesId]);

  const gridSize = useMemo(() => {
    if (isMobile) {
      return 12;
    }
    return 4;
  }, [isMobile]);

  useEffect(() => {
    if (getSpeciesError) {
      navigate(APP_PATHS.SPECIES);
    }
  }, [getSpeciesError, navigate]);

  const goToEditSpecies = () => {
    if (speciesId) {
      const editSpeciesLocation = {
        pathname: APP_PATHS.SPECIES_EDIT.replace(':speciesId', speciesId),
      };
      navigate(editSpeciesLocation);
    }
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

  const dataSource = useCallback(
    (source?: SpeciesDataSourcePayload) => (speciesIntelligenceEnabled ? source : undefined),
    [speciesIntelligenceEnabled]
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

  return (
    <TfMain>
      {isDeleting && <BusySpinner withSkrim={true} />}
      <Grid container padding={theme.spacing(0, 0, 4, 0)}>
        <Grid item xs={12} marginBottom={theme.spacing(3)}>
          <BackToLink id='back' to={APP_PATHS.SPECIES} name={strings.SPECIES} />
        </Grid>
        <Grid
          item
          xs={12}
          padding={theme.spacing(0, 3)}
          sx={{
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: theme.spacing(2),
          }}
        >
          <Typography fontSize='20px' fontWeight={600}>
            {species?.scientificName}
          </Typography>
          {userCanEdit && (
            <Box>
              <Button
                icon='iconEdit'
                label={isMobile ? undefined : strings.EDIT_SPECIES}
                priority='primary'
                size='medium'
                onClick={goToEditSpecies}
              />
              <OptionsMenu
                onOptionItemClick={onOptionItemClick}
                optionItems={[{ label: strings.DELETE, value: 'delete', type: 'destructive' }]}
              />
            </Box>
          )}
        </Grid>
        <Grid item xs={12}>
          <PageSnackbar />
        </Grid>
        <Grid
          container
          sx={{
            backgroundColor: theme.palette.TwClrBg,
            borderRadius: '32px',
            padding: theme.spacing(3),
            margin: 0,
          }}
        >
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
              source={dataSource(species?.commonNameSource)}
              tooltipTitle={strings.TOOLTIP_COMMON_NAME}
              value={species?.commonName}
            />
          </GridItemWrapper>
          <GridItemWrapper>
            <SpeciesDataSourceField
              id='family'
              label={strings.FAMILY}
              source={dataSource(species?.familyNameSource)}
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
          {/* TODO this will eventually come from the accelerator project species, not the org species */}
          {/* <GridItemWrapper>
                <TextField
                  id={'nativeStatus'}
                  label={strings.NATIVE_NON_NATIVE}
                  value={species?.nativeStatus}
                  type='text'
                  display={true}
                  required
                />
              </Grid> */}
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
                  <SpeciesNativityBadge nativity={orgNativity} />
                  <SpeciesDataSourceBadge source={orgNativityElement?.calculatedNativitySource} />
                  {orgNativity && userCanEdit && (
                    <Button
                      id='override-org-nativity'
                      label={strings.OVERRIDE}
                      priority='secondary'
                      type='passive'
                      size='small'
                      onClick={() => setOverrideModalOpen(true)}
                    />
                  )}
                </Box>
              </Box>
            </GridItemWrapper>
          )}
          {species && orgHasParticipants && <SpeciesProjectsTable speciesId={species.id} editMode={false} />}
          {speciesIntelligenceEnabled && hasMultipleProjects && species && (
            <Grid item xs={12} marginTop={theme.spacing(4)}>
              <SpeciesProjectsSection
                speciesId={species.id}
                speciesName={species.scientificName}
                speciesProjects={species.projects}
              />
            </Grid>
          )}
        </Grid>
      </Grid>
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
    </TfMain>
  );
}
