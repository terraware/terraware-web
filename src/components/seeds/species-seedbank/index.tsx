import { Chip, Container, Grid, Paper } from '@material-ui/core';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import AddIcon from '@material-ui/icons/Add';
import React, { useCallback, useEffect, useState } from 'react';
import { createSpecies, getAllSpecies, updateSpecies } from 'src/api/species/species';
import { Species } from 'src/types/Species';
import Table from '../../common/table';
import { TableColumnType } from '../../common/table/types';
import PageHeader from '../PageHeader';
import EditSpecies from './EditSpeciesModal';
import NewSpecies from './NewSpeciesModal';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    mainContainer: {
      paddingTop: theme.spacing(8),
      paddingBottom: theme.spacing(4),
    },
    newSpecies: {
      backgroundColor: theme.palette.grey[600],
      color: theme.palette.common.white,
    },
  })
);

const chipStyles = makeStyles((theme) => ({
  root: {
    color: theme.palette.common.white,
  },
}));

const columns: TableColumnType[] = [{ key: 'name', name: 'Species', type: 'string' }];

export default function Species(): JSX.Element {
  const classes = useStyles();
  const [isNewSpeciesModalOpen, setIsNewSpeciesModalOpen] = useState(false);
  const [isEditSpeciesModalOpen, setIsEditSpeciesModalOpen] = useState(false);
  const [selectedSpecies, setSelectedSpecies] = useState<Species>({
    name: '',
    id: 0,
  });
  const [speciesList, setSpeciesList] = useState<Species[]>([]);

  const populateSpecies = useCallback(async () => {
    const response = await getAllSpecies();
    // TODO: what if we cannot fetch the species list?
    if (response.requestSucceeded) {
      setSpeciesList(Array.from(response.speciesById.values()));
    }
  }, []);

  useEffect(() => {
    populateSpecies();
  }, [populateSpecies]);

  const onSelect = (selected: Species) => {
    setSelectedSpecies(selected);
    setIsEditSpeciesModalOpen(true);
  };

  const onOpenNewSpeciesModal = () => {
    setIsNewSpeciesModalOpen(true);
  };

  const onCloseEditSpeciesModal = async (species?: Species) => {
    if (species) {
      await updateSpecies(species);
      populateSpecies();
    }
    setIsEditSpeciesModalOpen(false);
  };

  const onCloseNewSpeciesModal = async (name?: string) => {
    if (name) {
      await createSpecies(name);
      populateSpecies();
    }
    setIsNewSpeciesModalOpen(false);
  };

  const getTotalSpeciesCount = () => {
    if (speciesList) {
      return `${speciesList.length} total`;
    }
  };

  return (
    <main>
      <NewSpecies open={isNewSpeciesModalOpen} onClose={onCloseNewSpeciesModal} />
      <EditSpecies open={isEditSpeciesModalOpen} onClose={onCloseEditSpeciesModal} value={selectedSpecies} />
      <PageHeader
        title='Species'
        subtitle={getTotalSpeciesCount()}
        rightComponent={
          <div>
            <Chip
              id='new-species'
              size='medium'
              label='New Species'
              onClick={onOpenNewSpeciesModal}
              className={classes.newSpecies}
              deleteIcon={<AddIcon classes={chipStyles()} />}
              onDelete={() => true}
            />
          </div>
        }
      />
      <Container maxWidth={false} className={classes.mainContainer}>
        <Grid container spacing={3}>
          <Grid item xs={1} />
          <Grid item xs={10}>
            <Paper>
              <Grid container spacing={4}>
                <Grid item xs={12}>
                  {speciesList && <Table columns={columns} rows={speciesList} orderBy='name' onSelect={onSelect} />}
                </Grid>
              </Grid>
            </Paper>
          </Grid>
          <Grid item xs={1} />
        </Grid>
      </Container>
    </main>
  );
}
