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
import { useSyncNavigate } from 'src/hooks/useSyncNavigate';
import { useParticipantData } from 'src/providers/Participant/ParticipantContext';
import { useOrganization } from 'src/providers/hooks';
import { SpeciesService } from 'src/services';
import strings from 'src/strings';
import {
  Species,
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
import SpeciesProjectsTable from './SpeciesProjectsTable';

type SpeciesDetailViewProps = {
  reloadData: () => void;
};

export default function SpeciesDetailView({ reloadData }: SpeciesDetailViewProps): JSX.Element {
  const theme = useTheme();
  const [species, setSpecies] = useState<Species>();
  const navigate = useSyncNavigate();
  const { isMobile } = useDeviceInfo();
  const { selectedOrganization } = useOrganization();
  const { speciesId } = useParams<{ speciesId: string }>();
  const userCanEdit = !isContributor(selectedOrganization);
  const [deleteSpeciesModalOpen, setDeleteSpeciesModalOpen] = useState(false);
  const [isBusy, setIsBusy] = useState<boolean>(false);
  const snackbar = useSnackbar();
  const { orgHasParticipants } = useParticipantData();

  const gridSize = useMemo(() => {
    if (isMobile) {
      return 12;
    }
    return 4;
  }, [isMobile]);

  useEffect(() => {
    if (selectedOrganization) {
      const getSpecies = async () => {
        const speciesResponse = await SpeciesService.getSpecies(Number(speciesId), selectedOrganization.id);
        if (speciesResponse.requestSucceeded) {
          setSpecies(speciesResponse.species);
        } else {
          navigate(APP_PATHS.SPECIES);
        }
      };
      void getSpecies();
    }
  }, [speciesId, selectedOrganization, navigate]);

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
    if (selectedOrganization) {
      setIsBusy(true);
      const success = await SpeciesService.deleteSpecies(id, selectedOrganization.id);
      setIsBusy(false);
      if (!success) {
        snackbar.toastError(strings.GENERIC_ERROR);
      } else {
        reloadData();
      }
      setDeleteSpeciesModalOpen(false);
      navigate(APP_PATHS.SPECIES);
    }
  };

  const GridItemWrapper = useCallback(
    ({ children, props }: { children: JSX.Element; props?: GridProps }) => (
      <Grid item xs={gridSize} {...props} minHeight={'64px'} paddingBottom={theme.spacing(2)}>
        {children}
      </Grid>
    ),
    [gridSize, theme]
  );

  return (
    <TfMain>
      {isBusy && <BusySpinner withSkrim={true} />}
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
            marginBottom: theme.spacing(4),
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
            <TextField
              label={strings.COMMON_NAME}
              id='commonName'
              type='text'
              value={species?.commonName}
              tooltipTitle={strings.TOOLTIP_TIME_ZONE_NURSERY}
              display={true}
            />
          </GridItemWrapper>
          <GridItemWrapper>
            <TextField id={'family'} label={strings.FAMILY} value={species?.familyName} type='text' display={true} />
          </GridItemWrapper>
          <GridItemWrapper>
            <TextField
              id={'conservationCategory'}
              label={strings.CONSERVATION_CATEGORY}
              value={species?.conservationCategory}
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
          {/* TODO this will eventually come from the participant project species, not the org species */}
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
          <GridItemWrapper props={{ xs: isMobile ? 12 : 8 }}>
            <TextField
              id={'otherFacts'}
              label={strings.OTHER_FACTS}
              value={species?.otherFacts}
              type='textarea'
              display={true}
            />
          </GridItemWrapper>
          {species && orgHasParticipants && <SpeciesProjectsTable speciesId={species.id} editMode={false} />}
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
    </TfMain>
  );
}
