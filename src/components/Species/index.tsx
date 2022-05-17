import { CircularProgress } from '@material-ui/core';
import Container from '@material-ui/core/Container';
import Grid from '@material-ui/core/Grid';
import { createStyles, makeStyles } from '@material-ui/core/styles';
import React, { useCallback, useEffect, useState } from 'react';
import { useSetRecoilState } from 'recoil';
import { deleteSpecies, getAllSpecies } from 'src/api/species/species';
import Button from 'src/components/common/button/Button';
import EmptyMessage from 'src/components/common/EmptyMessage';
import ErrorBox from 'src/components/common/ErrorBox/ErrorBox';
import Table from 'src/components/common/table';
import { TableColumnType } from 'src/components/common/table/types';
import snackbarAtom from 'src/state/snackbar';
import dictionary from 'src/strings/dictionary';
import strings from 'src/strings';
import emptyMessageStrings from 'src/strings/emptyMessageModal';
import { ServerOrganization } from 'src/types/Organization';
import { Species } from 'src/types/Species';
import TfMain from 'src/components/common/TfMain';
import PageSnackbar from 'src/components/PageSnackbar';
import AddSpeciesModal from './AddSpeciesModal';
import DeleteSpeciesModal from './DeleteSpeciesModal';
import TextField from '../common/Textfield/Textfield';
import { FieldNodePayload, search, SearchNodePayload } from 'src/api/seeds/search';
import SpeciesFilters from './SpeciesFiltersPopover';
import useForm from 'src/utils/useForm';

type SpeciesListProps = {
  organization: ServerOrganization;
};

const useStyles = makeStyles((theme) =>
  createStyles({
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
    createSpeciesMessage: {
      margin: '0 auto',
      width: '50%',
      marginTop: '10%',
    },
    spinner: {
      display: 'flex',
      margin: 'auto',
      minHeight: '50%',
    },
    errorBox: {
      width: '400px',
      marginTop: '120px',
    },
    searchField: {
      width: '300px',
    },
    searchBar: {
      display: 'flex',
      marginBottom: '16px',
    },
  })
);

const columns: TableColumnType[] = [
  { key: 'scientificName', name: strings.SCIENTIFIC_NAME, type: 'string' },
  { key: 'commonName', name: strings.COMMON_NAME, type: 'string' },
  { key: 'familyName', name: strings.FAMILY, type: 'string' },
  { key: 'growthForm', name: strings.GROWTH_FORM, type: 'string' },
  { key: 'seedStorageBehavior', name: strings.SEED_STORAGE_BEHAVIOR, type: 'string' },
];

export type SpeciesFiltersType = {
  growthForm?: 'Tree' | 'Shrub' | 'Forb' | 'Graminoid' | 'Fern';
  seedStorageBehavior?: 'Orthodox' | 'Recalcitrant' | 'Intermediate' | 'Unknown';
  rare?: boolean;
  endangered?: boolean;
};

export default function SpeciesList({ organization }: SpeciesListProps): JSX.Element {
  const classes = useStyles();
  const [species, setSpecies] = useState<Species[]>();
  const [speciesAPIRequest, setSpeciesAPIRequest] = useState<'AWAITING' | 'SUCCEEDED' | 'FAILED'>('AWAITING');
  const [selectedSpecies, setSelectedSpecies] = useState<Species>();
  const [selectedSpeciesRows, setSelectedSpeciesRows] = useState<Species[]>([]);
  const [editSpeciesModalOpen, setEditSpeciesModalOpen] = useState(false);
  const [deleteSpeciesModalOpen, setDeleteSpeciesModalOpen] = useState(false);
  const setSnackbar = useSetRecoilState(snackbarAtom);
  const [searchValue, setSearchValue] = useState('');
  const [results, setResults] = useState<Species[]>();
  const [record, setRecord, onChange] = useForm<SpeciesFiltersType>({});

  const populateSpecies = useCallback(async () => {
    const response = await getAllSpecies(organization.id);
    if (response.requestSucceeded) {
      setSpeciesAPIRequest('SUCCEEDED');
      setSpecies(response.species);
      setResults(response.species);
    } else {
      setSpeciesAPIRequest('FAILED');
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
        type: 'toast',
        priority: 'success',
        msg: snackbarMessage,
      });
    }
  };
  const onNewSpecies = () => {
    setSelectedSpecies(undefined);
    setEditSpeciesModalOpen(true);
  };

  const setErrorSnackbar = (snackbarMessage: string) => {
    setSnackbar({
      priority: 'critical',
      type: 'toast',
      msg: snackbarMessage,
    });
  };

  if (speciesAPIRequest === 'AWAITING') {
    return <CircularProgress id='species-spinner' className={classes.spinner} />;
  }

  if (speciesAPIRequest === 'FAILED') {
    return (
      <ErrorBox
        title={strings.SPECIES_DATA_NOT_AVAILABLE}
        text={strings.CONTACT_US_TO_RESOLVE_ISSUE}
        className={classes.errorBox}
      />
    );
  }

  const OnEditSpecies = () => {
    setSelectedSpecies(selectedSpeciesRows[0]);
    setEditSpeciesModalOpen(true);
  };

  const OnDeleteSpecies = () => {
    setDeleteSpeciesModalOpen(true);
  };

  const onChangeSearch = (id: string, value: unknown) => {
    setSearchValue(value as string);
  };
  const onKeyDownHandler = (key: string) => {
    if (key === 'Enter') {
      onApplyFilters();
    }
  };

  const onApplyFilters = async () => {
    const params: SearchNodePayload = {
      prefix: 'species',
      fields: [
        'id',
        'scientificName',
        'commonName',
        'familyName',
        'endangered',
        'rare',
        'growthForm',
        'seedStorageBehavior',
      ],
      search: {
        operation: 'or',
        children: [],
      },
      count: 0,
    };

    if (searchValue) {
      const nameNode: FieldNodePayload = {
        operation: 'field',
        field: 'scientificName',
        type: 'Fuzzy',
        values: [searchValue],
      };
      params.search.children.push(nameNode);

      const familyNode: FieldNodePayload = {
        operation: 'field',
        field: 'familyName',
        type: 'Fuzzy',
        values: [searchValue],
      };
      params.search.children.push(familyNode);
    }

    if (record.endangered !== undefined) {
      const newNode: FieldNodePayload = {
        operation: 'field',
        field: 'endangered',
        type: 'Exact',
        values: [record.endangered],
      };
      params.search.children.push(newNode);
    }

    if (record.rare !== undefined) {
      const newNode: FieldNodePayload = {
        operation: 'field',
        field: 'rare',
        type: 'Exact',
        values: [record.rare],
      };
      params.search.children.push(newNode);
    }

    if (record.seedStorageBehavior !== undefined) {
      const newNode: FieldNodePayload = {
        operation: 'field',
        field: 'seedStorageBehavior',
        type: 'Exact',
        values: [record.seedStorageBehavior],
      };
      params.search.children.push(newNode);
    }

    if (record.growthForm !== undefined) {
      const newNode: FieldNodePayload = {
        operation: 'field',
        field: 'growthForm',
        type: 'Exact',
        values: [record.growthForm],
      };
      params.search.children.push(newNode);
    }
    if (params.search.children.length) {
      const searchResults = await search(params);
      const speciesResults: Species[] = [];
      searchResults?.forEach((result) => {
        speciesResults.push({
          id: result.id as number,
          scientificName: result.scientificName as string,
          commonName: result.commonName as string,
          familyName: result.familyName as string,
          growthForm: result.growthForm as any,
          seedStorageBehavior: result.seedStorageBehavior as any,
        });
      });
      setResults(speciesResults);
    } else {
      setResults(species);
    }
  };

  const deleteSelectedSpecies = () => {
    if (selectedSpeciesRows.length > 0) {
      selectedSpeciesRows.forEach(async (iSelectedSpecies) => {
        await deleteSpecies(iSelectedSpecies.id, organization.id);
      });
      setDeleteSpeciesModalOpen(false);
      populateSpecies();
    }
  };

  return (
    <TfMain>
      <DeleteSpeciesModal
        open={deleteSpeciesModalOpen}
        onClose={() => setDeleteSpeciesModalOpen(false)}
        onSubmit={deleteSelectedSpecies}
      />
      <AddSpeciesModal
        open={editSpeciesModalOpen}
        onClose={onCloseEditSpeciesModal}
        initialSpecies={selectedSpecies}
        organization={organization}
        onError={setErrorSnackbar}
      />
      <Grid container>
        <Grid item xs={12} className={classes.titleContainer}>
          <h1 className={classes.pageTitle}>{strings.SPECIES}</h1>
          {species && species.length > 0 && (
            <Button id='new-species' label={strings.ADD_SPECIES} onClick={onNewSpecies} size='medium' />
          )}
        </Grid>
        <p>{strings.SPECIES_DESCRIPTION}</p>
        <PageSnackbar />
        <Container maxWidth={false} className={classes.mainContainer}>
          <Grid item xs={12} className={classes.searchBar}>
            <TextField
              placeholder={strings.SEARCH_BY_NAME_OR_FAMILY}
              iconLeft='search'
              label=''
              id='search'
              type='text'
              className={classes.searchField}
              onChange={onChangeSearch}
              onKeyDown={onKeyDownHandler}
            />
            <SpeciesFilters
              filters={record}
              setFilters={setRecord}
              onChangeFilters={onChange}
              onApplyFilters={onApplyFilters}
            />
          </Grid>
          {species && species.length ? (
            <Grid item xs={12}>
              {results && (
                <Table
                  id='species-table'
                  columns={columns}
                  rows={results}
                  orderBy='name'
                  showCheckbox={true}
                  selectedRows={selectedSpeciesRows}
                  setSelectedRows={setSelectedSpeciesRows}
                  showTopBar={true}
                  topBarButtons={
                    selectedSpeciesRows.length === 1
                      ? [
                          {
                            buttonType: 'passive',
                            buttonText: strings.DELETE,
                            onButtonClick: OnDeleteSpecies,
                          },
                          {
                            buttonType: 'passive',
                            buttonText: strings.EDIT,
                            onButtonClick: OnEditSpecies,
                          },
                        ]
                      : [
                          {
                            buttonType: 'passive',
                            buttonText: strings.DELETE,
                            onButtonClick: OnDeleteSpecies,
                          },
                        ]
                  }
                />
              )}
            </Grid>
          ) : (
            <EmptyMessage
              className={classes.createSpeciesMessage}
              title={dictionary.ADD_A_SPECIES}
              text={emptyMessageStrings.SPECIES_EMPTY_MSG_BODY}
              buttonText={strings.ADD_SPECIES}
              onClick={onNewSpecies}
            />
          )}
        </Container>
      </Grid>
    </TfMain>
  );
}
