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
import { Species, SpeciesWithScientificName } from 'src/types/Species';
import SimpleSpeciesModal from './SimpleSpeciesModal';

type SpeciesListProps = {
  organization: ServerOrganization;
};

const useStyles = makeStyles((theme) =>
  createStyles({
    main: {
      background: '#ffffff',
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      padding: '24px',
    },
    mainContainer: {
      padding: '32px 0',
    },
    pageTitle: {
      fontSize: '24px',
      lineHeight: '32px',
      fontWeight: 600,
      margin: 0,
    },
    titleContainer: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
  })
);

const columns: TableColumnType[] = [
  { key: 'name', name: 'Common  Name', type: 'string' },
  { key: 'scientificName', name: 'Sicientific Name', type: 'string' },
];

export default function SpeciesList({ organization }: SpeciesListProps): JSX.Element {
  const classes = useStyles();
  const [species, setSpecies] = useState<SpeciesWithScientificName[]>();
  const [selectedSpecies, setSelectedSpecies] = useState<SpeciesWithScientificName>();
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
    <main className={classes.main}>
      <SimpleSpeciesModal
        open={editSpeciesModalOpen}
        onClose={onCloseEditSpeciesModal}
        initialSpecies={selectedSpecies}
        organization={organization}
        onError={setErrorSnackbar}
      />
      <Grid container>
        <Grid item xs={12} className={classes.titleContainer}>
          <h1 className={classes.pageTitle}>{strings.SPECIES}</h1>
          <Button id='new-species' label={strings.NEW_SPECIES} onClick={onNewSpecies} icon='plus' size='medium' />
        </Grid>
        <Container maxWidth={false} className={classes.mainContainer}>
          <Grid item xs={12}>
            <Paper>
              {species && (
                <Table id='species-table' columns={columns} rows={species} orderBy='name' onSelect={onSelect} />
              )}
            </Paper>
          </Grid>
        </Container>
      </Grid>
    </main>
  );
}
