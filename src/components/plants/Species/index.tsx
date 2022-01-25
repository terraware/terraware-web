import Container from '@material-ui/core/Container';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import { createStyles, makeStyles } from '@material-ui/core/styles';
import React, { useCallback, useEffect, useState } from 'react';
import { useSetRecoilState } from 'recoil';
import { getAllSpecies } from 'src/api/species/species';
import Button from 'src/components/common/button/Button';
import Table from 'src/components/common/table';
import { TableColumnType } from 'src/components/common/table/types';
import snackbarAtom from 'src/state/snackbar';
import strings from 'src/strings';
import { ServerOrganization } from 'src/types/Organization';
import { Species } from 'src/types/Species';
import SimpleSpeciesModal from './SimpleSpeciesModal';

type SpeciesListProps = {
  organization: ServerOrganization;
};

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

const columns: TableColumnType[] = [{ key: 'name', name: 'Name', type: 'string' }];

export default function SpeciesList({ organization }: SpeciesListProps): JSX.Element {
  const classes = useStyles();
  const [species, setSpecies] = useState<Species[]>();
  const [selectedSpecies, setSelectedSpecies] = useState<Species>();
  const [editSpeciesModalOpen, setEditSpeciesModalOpen] = useState(false);
  const setSnackbar = useSetRecoilState(snackbarAtom);

  const populateSpecies = useCallback(async () => {
    const response = await getAllSpecies(organization.id);
    // TODO: what if we cannot fetch the species list?
    if (response.requestSucceeded) {
      setSpecies(Array.from(response.speciesById.values()));
    }
  }, [organization]);

  useEffect(() => {
    populateSpecies();
  }, [populateSpecies]);

  const onCloseEditSpeciesModal = (saved: boolean, snackbarMessage?: string) => {
    if (saved) {
      populateSpecies();
    }
    setEditSpeciesModalOpen(false);
    if (snackbarMessage) {
      setSnackbar({
        type: 'success',
        msg: snackbarMessage,
      });
    }
  };
  const onSelect = (selected: Species) => {
    setSelectedSpecies(selected);
    setEditSpeciesModalOpen(true);
  };
  const onNewSpecies = () => {
    setSelectedSpecies(undefined);
    setEditSpeciesModalOpen(true);
  };

  const setErrorSnackbar = (snackbarMessage: string) => {
    setSnackbar({
      type: 'delete',
      msg: snackbarMessage,
    });
  };

  return (
    <main>
      <SimpleSpeciesModal
        open={editSpeciesModalOpen}
        onClose={onCloseEditSpeciesModal}
        initialSpecies={selectedSpecies}
        organization={organization}
        onError={setErrorSnackbar}
      />
      <Container maxWidth={false} className={classes.mainContainer}>
        <Grid container spacing={3}>
          <Grid item xs={1} />
          <Grid item xs={2}>
            <h1>{strings.SPECIES}</h1>
          </Grid>
          <Grid item xs={6} />
          <Grid item xs={2} className={classes.centered}>
            <Button id='new-species' label={strings.NEW_SPECIES} onClick={onNewSpecies} icon='plus' />
          </Grid>
          <Grid item xs={1} />
          <Grid item xs={1} />
          <Grid item xs={10}>
            <Paper className={classes.mainContent}>
              <Grid container spacing={4}>
                <Grid item xs={12}>
                  {species && (
                    <Table id='species-table' columns={columns} rows={species} orderBy='name' onSelect={onSelect} />
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
