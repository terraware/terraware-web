import React, { useEffect, useState } from 'react';
import { useHistory, useParams } from 'react-router-dom';

import { Box, Grid, Theme, Typography, useTheme } from '@mui/material';
import { makeStyles } from '@mui/styles';
import { BusySpinner } from '@terraware/web-components';
import { Button, DropdownItem } from '@terraware/web-components';

import PageSnackbar from 'src/components/PageSnackbar';
import BackToLink from 'src/components/common/BackToLink';
import Checkbox from 'src/components/common/Checkbox';
import OptionsMenu from 'src/components/common/OptionsMenu';
import { APP_PATHS } from 'src/constants';
import { useOrganization } from 'src/providers/hooks';
import { SpeciesService } from 'src/services';
import strings from 'src/strings';
import { Species } from 'src/types/Species';
import { isContributor } from 'src/utils/organization';
import useDeviceInfo from 'src/utils/useDeviceInfo';
import useSnackbar from 'src/utils/useSnackbar';

import TextField from '../../components/common/Textfield/Textfield';
import TfMain from '../../components/common/TfMain';
import DeleteSpeciesModal from './DeleteSpeciesModal';

const useStyles = makeStyles((theme: Theme) => ({
  titleWithButton: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing(4),
  },
  blockCheckbox: {
    display: 'block',
  },
}));

type SpeciesDetailViewProps = {
  reloadData: () => void;
};

export default function SpeciesDetailView({ reloadData }: SpeciesDetailViewProps): JSX.Element {
  const theme = useTheme();
  const classes = useStyles();
  const [species, setSpecies] = useState<Species>();
  const history = useHistory();
  const { isMobile } = useDeviceInfo();
  const { selectedOrganization } = useOrganization();
  const { speciesId } = useParams<{ speciesId: string }>();
  const userCanEdit = !isContributor(selectedOrganization);
  const [deleteSpeciesModalOpen, setDeleteSpeciesModalOpen] = useState(false);
  const [isBusy, setIsBusy] = useState<boolean>(false);
  const snackbar = useSnackbar();

  const gridSize = () => {
    if (isMobile) {
      return 12;
    }
    return 4;
  };

  useEffect(() => {
    const getSpecies = async () => {
      const speciesResponse = await SpeciesService.getSpecies(Number(speciesId), selectedOrganization.id);
      if (speciesResponse.requestSucceeded) {
        setSpecies(speciesResponse.species);
      } else {
        history.push(APP_PATHS.SPECIES);
      }
    };
    if (selectedOrganization) {
      getSpecies();
    }
  }, [speciesId, selectedOrganization, history]);

  const goToEditSpecies = () => {
    const editSpeciesLocation = {
      pathname: APP_PATHS.SPECIES_EDIT.replace(':speciesId', speciesId),
    };
    history.push(editSpeciesLocation);
  };

  const onOptionItemClick = (optionItem: DropdownItem) => {
    if (optionItem.value === 'delete') {
      setDeleteSpeciesModalOpen(true);
    }
  };

  const deleteSelectedSpecies = async (id: number) => {
    setIsBusy(true);
    const success = await SpeciesService.deleteSpecies(id, selectedOrganization.id);
    setIsBusy(false);
    if (!success) {
      snackbar.toastError(strings.GENERIC_ERROR);
    } else {
      reloadData();
    }
    setDeleteSpeciesModalOpen(false);
    history.push(APP_PATHS.SPECIES);
  };

  return (
    <TfMain>
      {isBusy && <BusySpinner withSkrim={true} />}
      <Grid container padding={theme.spacing(0, 0, 4, 0)}>
        <Grid item xs={12} marginBottom={theme.spacing(3)}>
          <BackToLink id='back' to={APP_PATHS.SPECIES} name={strings.SPECIES} />
        </Grid>
        <Grid item xs={12} padding={theme.spacing(0, 3)} className={classes.titleWithButton}>
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
          <Grid item xs={gridSize()} paddingBottom={theme.spacing(2)}>
            <TextField
              label={strings.SCIENTIFIC_NAME}
              id='scientificName'
              type='text'
              value={species?.scientificName}
              display={true}
            />
          </Grid>
          <Grid item xs={gridSize()} paddingBottom={theme.spacing(2)}>
            <TextField
              label={strings.COMMON_NAME}
              id='commonName'
              type='text'
              value={species?.commonName}
              tooltipTitle={strings.TOOLTIP_TIME_ZONE_NURSERY}
              display={true}
            />
          </Grid>
          <Grid item xs={gridSize()} paddingBottom={theme.spacing(2)}>
            <TextField id={'family'} label={strings.FAMILY} value={species?.familyName} type='text' display={true} />
          </Grid>
          <Grid item xs={gridSize()} paddingBottom={theme.spacing(2)}>
            <TextField
              id={'conservationCategory'}
              label={strings.CONSERVATION_CATEGORY}
              value={species?.conservationCategory}
              type='text'
              display={true}
            />
          </Grid>
          <Grid item xs={gridSize()} paddingBottom={theme.spacing(2)}>
            <TextField
              id={'growthForm'}
              label={strings.GROWTH_FORM}
              value={species?.growthForm}
              type='text'
              aria-label='date-picker'
              display={true}
            />
          </Grid>
          <Grid item xs={gridSize()} paddingBottom={theme.spacing(2)}>
            <Checkbox
              id='Rare'
              name='rare'
              label={strings.RARE}
              disabled={true}
              onChange={(value: boolean) => {
                return;
              }}
              value={species?.rare}
              className={classes.blockCheckbox}
            />
          </Grid>
          <Grid item xs={gridSize()} paddingBottom={theme.spacing(2)}>
            <TextField
              id={'seedStorageBehavior'}
              label={strings.SEED_STORAGE_BEHAVIOR}
              value={species?.seedStorageBehavior}
              type='text'
              display={true}
            />
          </Grid>
          <Grid item xs={gridSize()} paddingBottom={theme.spacing(2)}>
            <TextField
              id={'ecosystemType'}
              label={strings.ECOSYSTEM_TYPE}
              type='text'
              display={true}
              value={species?.ecosystemTypes?.join(', ')}
            />
          </Grid>
        </Grid>
      </Grid>
      {species && (
        <DeleteSpeciesModal
          open={deleteSpeciesModalOpen}
          onClose={() => setDeleteSpeciesModalOpen(false)}
          onSubmit={(toDelete: number) => deleteSelectedSpecies(toDelete)}
          speciesToDelete={species}
        />
      )}
    </TfMain>
  );
}
