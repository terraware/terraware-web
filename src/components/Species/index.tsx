import { Chip, Typography } from '@material-ui/core';
import Container from '@material-ui/core/Container';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import { createStyles, makeStyles } from '@material-ui/core/styles';
import AddIcon from '@material-ui/icons/Add';
import React from 'react';
import {
  useRecoilValue,
  useRecoilValueLoadable,
  useResetRecoilState,
} from 'recoil';
import { postSpeciesName, putSpeciesName } from '../../api/speciesNames';
import { SpeciesName } from '../../api/types/species';
import sessionSelector from '../../state/selectors/session';
import speciesNamesSelector from '../../state/selectors/speciesNames';
import Table from '../common/table';
import { TableColumnType } from '../common/table/types';
import EditSpecieModal from './EditSpecieModal';

const useStyles = makeStyles((theme) =>
  createStyles({
    mainContainer: {
      paddingTop: theme.spacing(4),
      paddingBottom: theme.spacing(4),
    },
    paper: {
      padding: theme.spacing(2),
      display: 'flex',
      overflow: 'auto',
      flexDirection: 'column',
    },
    fixedHeight: {
      height: '100%',
    },
    newSpecies: {
      backgroundColor: '#0063C2',
      color: theme.palette.common.white,
      '&:focus': {
        backgroundColor: '#0063C2',
      },
    },
    mainContent: {
      paddingTop: theme.spacing(4),
    },
  })
);

const chipStyles = makeStyles((theme) => ({
  root: {
    color: theme.palette.common.white,
  },
}));

export default function Species(): JSX.Element {
  // const resetSpecies = useResetRecoilState(speciesSelector);
  const resultsLodable = useRecoilValueLoadable(speciesNamesSelector);
  const results =
    resultsLodable.state === 'hasValue' ? resultsLodable.contents : undefined;

  const classes = useStyles();

  const [editSpecieModalOpen, setEditSpecieModalOpen] = React.useState(false);

  const [selectedSpecie, setSelectedSpecie] = React.useState<SpeciesName>();

  const columns: TableColumnType[] = [
    { key: 'name', name: 'Name', type: 'string' },
  ];

  const getSession = useRecoilValue(sessionSelector);
  const resetSpecies = useResetRecoilState(speciesNamesSelector);

  const onCloseEditSpecieModal = async (
    speciesName?: SpeciesName,
    newSpecies?: boolean
  ) => {
    if (getSession && speciesName) {
      if (newSpecies) {
        await postSpeciesName(speciesName, getSession);
      } else {
        await putSpeciesName(speciesName, getSession);
      }
      resetSpecies();
    }
    setEditSpecieModalOpen(false);
  };

  const onSelect = (specie: SpeciesName) => {
    setSelectedSpecie(specie);
    setEditSpecieModalOpen(true);
  };

  const onNewSpecie = () => {
    setSelectedSpecie(undefined);
    setEditSpecieModalOpen(true);
  };

  return (
    <main>
      <EditSpecieModal
        open={editSpecieModalOpen}
        onClose={onCloseEditSpecieModal}
        value={selectedSpecie}
      />
      <Container maxWidth={false} className={classes.mainContainer}>
        <Grid container spacing={3}>
          <Grid item xs={1} />
          <Grid item xs={2}>
            <h1>Species</h1>
            <Typography component='h4' variant='subtitle1'>
              {(results && results.length) ?? '0'} Total
            </Typography>
          </Grid>
          <Grid item xs={6} />
          <Grid item xs={2}>
            <Chip
              id='new-species'
              size='medium'
              label='New Species'
              onClick={onNewSpecie}
              icon={<AddIcon classes={chipStyles()} />}
              className={classes.newSpecies}
            />
          </Grid>
          <Grid item xs={1} />
          <Grid item xs={1} />
          <Grid item xs={10}>
            <Paper className={classes.mainContent}>
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
