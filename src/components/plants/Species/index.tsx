import Container from '@material-ui/core/Container';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import { createStyles, makeStyles } from '@material-ui/core/styles';
import React from 'react';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import { SpeciesType } from 'src/types/SpeciesType';
import snackbarAtom from '../../../state/atoms/snackbar';
import speciesSelector from '../../../state/selectors/species';
import strings from '../../../strings';
import Button from '../../common/button/Button';
import Table from '../../common/table';
import { TableColumnType } from '../../common/table/types';
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
      backgroundColor: theme.palette.primary.main,
      color: theme.palette.common.white,
      '&:focus': {
        backgroundColor: theme.palette.primary.main,
      },
    },
    mainContent: {
      paddingTop: theme.spacing(4),
    },
    centered: {
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'flex-end',
    },
  })
);

export default function Species(): JSX.Element {
  const setSnackbar = useSetRecoilState(snackbarAtom);

  const classes = useStyles();

  const [editSpecieModalOpen, setEditSpecieModalOpen] = React.useState(false);

  const [selectedSpecie, setSelectedSpecie] = React.useState<SpeciesType>();

  const onCloseEditSpecieModal = (snackbarMessage?: string) => {
    setEditSpecieModalOpen(false);
    if (snackbarMessage) {
      setSnackbar({
        type: 'success',
        msg: snackbarMessage,
      });
    }
  };
  const onSelect = (specie: SpeciesType) => {
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
            <h1>{strings.SPECIES}</h1>
          </Grid>
          <Grid item xs={6} />
          <Grid item xs={2} className={classes.centered}>
            <Button
              id='new-species'
              label={strings.NEW_SPECIES}
              onClick={onNewSpecie}
              icon='plus'
            />
          </Grid>
          <Grid item xs={1} />
          <Grid item xs={1} />
          <Grid item xs={10}>
            <Paper className={classes.mainContent}>
              <Grid container spacing={4}>
                <React.Suspense fallback={strings.LOADING}>
                  <SpeciesContent onSelect={onSelect} />
                </React.Suspense>
              </Grid>
            </Paper>
          </Grid>
          <Grid item xs={1} />
        </Grid>
      </Container>
    </main>
  );
}

interface SpeciesContentProps {
  onSelect: (species: SpeciesType) => void;
}

function SpeciesContent({ onSelect }: SpeciesContentProps): JSX.Element {
  const species = useRecoilValue(speciesSelector);

  const columns: TableColumnType[] = [
    { key: 'name', name: 'Name', type: 'string' },
  ];

  return (
    <Grid item xs={12}>
      {species && (
        <Table
          id='species-table'
          columns={columns}
          rows={species}
          orderBy='name'
          onSelect={onSelect}
        />
      )}
    </Grid>
  );
}
