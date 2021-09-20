import { Chip, Container, Grid, Paper } from '@material-ui/core';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import AddIcon from '@material-ui/icons/Add';
import React from 'react';
import { useRecoilValueLoadable, useResetRecoilState } from 'recoil';
import { postSpecies, updateSpecies } from '../../api/species-seedbank';
import speciesSelector from '../../state/selectors/species';
import { SpeciesType } from '../../types/SpeciesType';
import Table from '../common/table';
import { TableColumnType } from '../common/table/types';
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

export default function Species(): JSX.Element {
  const classes = useStyles();
  const [isNewSpeciesModalOpen, setIsNewSpeciesModalOpen] =
    React.useState(false);
  const [isEditSpeciesModalOpen, setIsEditSpeciesModalOpen] =
    React.useState(false);
  const [selectedSpecies, setSelectedSpecies] = React.useState<SpeciesType>({
    name: '',
    id: 0,
  });
  const resetSpecies = useResetRecoilState(speciesSelector);
  const resultsLoadable = useRecoilValueLoadable(speciesSelector);
  const results =
    resultsLoadable.state === 'hasValue' ? resultsLoadable.contents : undefined;

  const columns: TableColumnType[] = [
    { key: 'name', name: 'Species', type: 'string' },
  ];

  const onSelect = (species: SpeciesType) => {
    setSelectedSpecies(species);
    setIsEditSpeciesModalOpen(true);
  };

  const onOpenNewSpecieModal = () => {
    setIsNewSpeciesModalOpen(true);
  };

  const onCloseEditSpeciesModal = async (species?: SpeciesType) => {
    if (species) {
      await updateSpecies(species);
      resetSpecies();
    }
    setIsEditSpeciesModalOpen(false);
  };

  const onCloseNewSpeciesModal = async (newSpecies?: SpeciesType) => {
    if (newSpecies) {
      await postSpecies(newSpecies);
      resetSpecies();
    }
    setIsNewSpeciesModalOpen(false);
  };

  const getTotalSpeciesCount = () => {
    if (results) {
      return `${results.length} total`;
    }
  };

  return (
    <main>
      <NewSpecies
        open={isNewSpeciesModalOpen}
        onClose={onCloseNewSpeciesModal}
      />
      <EditSpecies
        open={isEditSpeciesModalOpen}
        onClose={onCloseEditSpeciesModal}
        value={selectedSpecies}
      />
      <PageHeader
        title='Species'
        subtitle={getTotalSpeciesCount()}
        rightComponent={
          <div>
            <Chip
              id='new-species'
              size='medium'
              label='New Species'
              onClick={onOpenNewSpecieModal}
              className={classes.newSpecies}
              deleteIcon={<AddIcon classes={chipStyles()} />}
              onDelete={() => true}
            />
          </div>
        }
      ></PageHeader>
      <Container maxWidth={false} className={classes.mainContainer}>
        <Grid container spacing={3}>
          <Grid item xs={1} />
          <Grid item xs={10}>
            <Paper>
              <Grid container spacing={4}>
                <Grid item xs={12}>
                  {results && (
                    <Table
                      columns={columns}
                      rows={results}
                      orderBy='name'
                      onSelect={onSelect}
                    />
                  )}
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
