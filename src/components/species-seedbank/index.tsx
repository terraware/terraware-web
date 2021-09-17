import { Chip, Container, Grid, Paper } from '@material-ui/core';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import AddIcon from '@material-ui/icons/Add';
import React from 'react';
import { useRecoilValueLoadable, useResetRecoilState } from 'recoil';
import { postSpecies, updateSpecies } from '../../api/species-seedbank';
import { NewSpecieType, SpeciesDetail } from '../../api/types/species-seedbank';
import speciesSelector from '../../state/selectors/species';
import Table from '../common/table';
import { TableColumnType } from '../common/table/types';
import PageHeader from '../PageHeader';
import EditSpecie from './EditSpecieModal';
import NewSpecie from './NewSpecieModal';

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
  const [newSpecieModalOpen, setNewSpecieModalOpen] = React.useState(false);
  const [editSpecieModalOpen, setEditSpecieModalOpen] = React.useState(false);
  const [selectedSpecie, setSelectedSpecie] = React.useState<SpeciesDetail>({
    name: '',
    id: 0,
  });
  const resetSpecies = useResetRecoilState(speciesSelector);
  const resultsLodable = useRecoilValueLoadable(speciesSelector);
  const results =
    resultsLodable.state === 'hasValue' ? resultsLodable.contents : undefined;

  const columns: TableColumnType[] = [
    { key: 'name', name: 'Species', type: 'string' },
  ];

  const onSelect = (specieDetail: SpeciesDetail) => {
    setSelectedSpecie(specieDetail);
    setEditSpecieModalOpen(true);
  };

  const onOpenNewSpecieModal = () => {
    setNewSpecieModalOpen(true);
  };

  const onCloseEditSpecieModal = async (specie?: SpeciesDetail) => {
    if (specie) {
      await updateSpecies(specie.id, { name: specie.name });
      resetSpecies();
    }
    setEditSpecieModalOpen(false);
  };

  const onCloseNewSpecieModal = async (newSpecie?: NewSpecieType) => {
    if (newSpecie) {
      await postSpecies(newSpecie);
      resetSpecies();
    }
    setNewSpecieModalOpen(false);
  };

  const getSubtitle = () => {
    if (results) {
      return `${results.length} total`;
    }
  };

  return (
    <main>
      <NewSpecie open={newSpecieModalOpen} onClose={onCloseNewSpecieModal} />
      <EditSpecie
        open={editSpecieModalOpen}
        onClose={onCloseEditSpecieModal}
        value={selectedSpecie}
      />
      <PageHeader
        title='Species'
        subtitle={getSubtitle()}
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
