import { Container, Grid, IconButton } from '@mui/material';
import { makeStyles } from '@mui/styles';
import React, { useCallback, useEffect, useState } from 'react';
import { useRecoilState } from 'recoil';
import { deleteSpecies } from 'src/api/species/species';
import Button from 'src/components/common/button/Button';
import EmptyMessage from 'src/components/common/EmptyMessage';
import Table from 'src/components/common/table';
import { TableColumnType } from 'src/components/common/table/types';
import speciesAtom from 'src/state/species';
import dictionary from 'src/strings/dictionary';
import strings from 'src/strings';
import emptyMessageStrings from 'src/strings/emptyMessageModal';
import { ServerOrganization } from 'src/types/Organization';
import { Species, SpeciesProblemElement } from 'src/types/Species';
import TfMain from 'src/components/common/TfMain';
import PageSnackbar from 'src/components/PageSnackbar';
import AddSpeciesModal from './AddSpeciesModal';
import DeleteSpeciesModal from './DeleteSpeciesModal';
import TextField from '../common/Textfield/Textfield';
import { FieldNodePayload, search, searchCsv, SearchNodePayload } from 'src/api/seeds/search';
import SpeciesFilters from './SpeciesFiltersPopover';
import useForm from 'src/utils/useForm';
import Icon from '../common/icon/Icon';
import Pill from './Pill';
import ImportSpeciesModal from './ImportSpeciesModal';
import CheckDataModal from './CheckDataModal';
import SpeciesCellRenderer from './TableCellRenderer';
import useDebounce from 'src/utils/useDebounce';
import { getRequestId, setRequestId } from 'src/utils/requestsId';
import useDeviceInfo from 'src/utils/useDeviceInfo';
import useSnackbar from 'src/utils/useSnackbar';
import { isContributor } from 'src/utils/organization';

type SpeciesListProps = {
  organization: ServerOrganization;
  reloadData: () => void;
  species: Species[];
};

const useStyles = makeStyles(() => ({
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
  iconContainer: {
    borderRadius: 0,
    fontSize: '16px',
    height: '48px',
    marginLeft: '8px',
  },
  buttonSpace: {
    marginRight: '8px',
  },
  icon: {
    fill: '#3A4445',
  },
  headerIconContainer: {
    marginLeft: '12px',
  },
}));

const columns: TableColumnType[] = [
  { key: 'scientificName', name: strings.SCIENTIFIC_NAME, type: 'string' },
  { key: 'commonName', name: strings.COMMON_NAME, type: 'string' },
  { key: 'familyName', name: strings.FAMILY, type: 'string' },
  { key: 'growthForm', name: strings.GROWTH_FORM, type: 'string' },
  { key: 'conservationStatus', name: strings.CONSERVATION_STATUS, type: 'string' },
  { key: 'seedStorageBehavior', name: strings.SEED_STORAGE_BEHAVIOR, type: 'string' },
];

export type SpeciesFiltersType = {
  growthForm?: 'Tree' | 'Shrub' | 'Forb' | 'Graminoid' | 'Fern';
  seedStorageBehavior?: 'Orthodox' | 'Recalcitrant' | 'Intermediate' | 'Unknown';
  rare?: boolean;
  endangered?: boolean;
};

export default function SpeciesList({ organization, reloadData, species }: SpeciesListProps): JSX.Element {
  const classes = useStyles();
  const [selectedSpecies, setSelectedSpecies] = useState<Species>();
  const [selectedSpeciesRows, setSelectedSpeciesRows] = useState<Species[]>([]);
  const [editSpeciesModalOpen, setEditSpeciesModalOpen] = useState(false);
  const [deleteSpeciesModalOpen, setDeleteSpeciesModalOpen] = useState(false);
  const [importSpeciesModalOpen, setImportSpeciesModalOpen] = useState(false);
  const [checkDataModalOpen, setCheckDataModalOpen] = useState(false);
  const snackbar = useSnackbar();
  const [speciesState, setSpeciesState] = useRecoilState(speciesAtom);
  const [searchValue, setSearchValue] = useState('');
  const debouncedSearchTerm = useDebounce(searchValue, 250);
  const [results, setResults] = useState<Species[]>();
  const [record, setRecord] = useForm<SpeciesFiltersType>({});
  const [selectedColumns, setSelectedColumns] = useForm(columns);
  const [handleProblemsColumn, setHandleProblemsColumn] = useState<boolean>(false);
  const [hasNewData, setHasNewData] = useState<boolean>(false);
  const [problemsColumn] = useState<TableColumnType>({
    key: 'problems',
    name: (
      <span className={classes.headerIconContainer}>
        <Icon name='warning' className={classes.icon} />
      </span>
    ),
    type: 'string',
  });
  const isUserContributor = isContributor(organization);
  const { isMobile } = useDeviceInfo();

  const getParams = useCallback(() => {
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
        'organization_id',
      ],
      search: {
        operation: 'and',
        children: [
          {
            operation: 'field',
            field: 'organization_id',
            type: 'Exact',
            values: [organization.id],
          },
        ],
      },
      count: 0,
    };

    if (debouncedSearchTerm) {
      const searchValueChildren: FieldNodePayload[] = [];
      const nameNode: FieldNodePayload = {
        operation: 'field',
        field: 'scientificName',
        type: 'Fuzzy',
        values: [debouncedSearchTerm],
      };
      searchValueChildren.push(nameNode);

      const familyNode: FieldNodePayload = {
        operation: 'field',
        field: 'familyName',
        type: 'Fuzzy',
        values: [debouncedSearchTerm],
      };
      searchValueChildren.push(familyNode);
      params.search.children.push({
        operation: 'or',
        children: searchValueChildren,
      });
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

    return params;
  }, [record, debouncedSearchTerm, organization.id]);

  const onApplyFilters = useCallback(
    async (reviewErrors?: boolean) => {
      const params: SearchNodePayload = getParams();
      if (params.search.children.length > 1) {
        // organization id filter will always exist
        const requestId = Math.random().toString();
        setRequestId('searchSpecies', requestId);
        const searchResults = await search(params);
        if (getRequestId('searchSpecies') === requestId) {
          const speciesResults: Species[] = [];
          searchResults?.forEach((result) => {
            speciesResults.push({
              id: result.id as number,
              problems: result.problems as SpeciesProblemElement[],
              scientificName: result.scientificName as string,
              commonName: result.commonName as string,
              familyName: result.familyName as string,
              growthForm: result.growthForm as any,
              seedStorageBehavior: result.seedStorageBehavior as any,
              rare: result.rare as boolean,
              endangered: result.endangered as boolean,
            });
          });
          setResults(speciesResults);
        }
      } else {
        setResults(species);
      }
    },
    [getParams, species]
  );

  useEffect(() => {
    if (speciesState?.checkData) {
      setSpeciesState({ checkData: false });
      setCheckDataModalOpen(true);
    }
  }, [setCheckDataModalOpen, speciesState, setSpeciesState]);

  useEffect(() => {
    onApplyFilters();
  }, [record, onApplyFilters]);

  const onCloseEditSpeciesModal = (saved: boolean, snackbarMessage?: string) => {
    if (saved) {
      reloadData();
    }
    setEditSpeciesModalOpen(false);
    if (snackbarMessage) {
      snackbar.toastSuccess(snackbarMessage);
    }
  };
  const onNewSpecies = () => {
    setSelectedSpecies(undefined);
    setEditSpeciesModalOpen(true);
  };

  const setErrorSnackbar = (snackbarMessage: string) => {
    snackbar.toastError(snackbarMessage);
  };

  const OnEditSpecies = () => {
    setSelectedSpecies(selectedSpeciesRows[0]);
    setEditSpeciesModalOpen(true);
  };

  const selectAndEditSpecies = (value: Species) => {
    setSelectedSpeciesRows([value]);
    setEditSpeciesModalOpen(true);
  };

  const OnDeleteSpecies = () => {
    setDeleteSpeciesModalOpen(true);
  };

  const clearSearch = () => {
    setSearchValue('');
  };

  const onChangeSearch = (id: string, value: unknown) => {
    setSearchValue(value as string);
  };

  const deleteSelectedSpecies = async () => {
    if (selectedSpeciesRows.length > 0) {
      await Promise.all(
        selectedSpeciesRows.map(async (iSelectedSpecies) => {
          await deleteSpecies(iSelectedSpecies.id, organization.id);
        })
      );
      setDeleteSpeciesModalOpen(false);
      reloadData();
    }
  };

  const downloadReportHandler = async () => {
    const params = getParams();
    if (!params.search.children.length) {
      params.search = null;
    }
    const apiResponse = await searchCsv(params);

    if (apiResponse !== null) {
      const csvContent = 'data:text/csv;charset=utf-8,' + apiResponse;
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', `species.csv`);
      link.click();
    }
  };

  const onRemoveFilterHandler = (filterRemoved: keyof SpeciesFiltersType) => {
    return () =>
      setRecord((previousRecord: SpeciesFiltersType): SpeciesFiltersType => {
        return { ...previousRecord, [filterRemoved]: undefined };
      });
  };

  const onImportSpecies = () => {
    setImportSpeciesModalOpen(true);
  };

  const onCloseImportSpeciesModal = (completed: boolean) => {
    if (completed && reloadData) {
      reloadData();
      setCheckDataModalOpen(true);
    }
    setImportSpeciesModalOpen(false);
  };

  const onCheckData = () => {
    setCheckDataModalOpen(true);
  };

  const reviewErrorsHandler = (hasErrors: boolean) => {
    setCheckDataModalOpen(false);
    if (hasErrors) {
      setSelectedColumns([problemsColumn, ...columns]);
    } else {
      setSelectedColumns(columns);
    }
    onApplyFilters(true);
  };

  const reloadDataProblemsHandler = async () => {
    setHasNewData(false);
    await reloadData();
    setHandleProblemsColumn(true);
  };

  useEffect(() => {
    setHasNewData(true);
  }, [results, setHasNewData]);

  useEffect(() => {
    if (handleProblemsColumn && hasNewData) {
      const hasErrors = results && results.filter((result) => result.problems && result.problems.length);
      let newColumns = columns;
      if (hasErrors?.length) {
        newColumns = [problemsColumn, ...columns];
      }
      if (selectedColumns[0].key !== newColumns[0].key) {
        setSelectedColumns(newColumns);
      }
      setHandleProblemsColumn(false);
      setHasNewData(false);
    }
  }, [handleProblemsColumn, problemsColumn, results, selectedColumns, setSelectedColumns, hasNewData, setHasNewData]);

  return (
    <TfMain>
      <CheckDataModal
        open={checkDataModalOpen}
        onClose={() => setCheckDataModalOpen(false)}
        species={species}
        reviewErrors={reviewErrorsHandler}
        reloadData={reloadData}
      />
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
      <ImportSpeciesModal
        open={importSpeciesModalOpen}
        onClose={onCloseImportSpeciesModal}
        organization={organization}
        setCheckDataModalOpen={setCheckDataModalOpen}
      />
      <Grid container>
        <Grid item xs={12} className={classes.titleContainer}>
          <h1 className={classes.pageTitle}>{strings.SPECIES}</h1>
          {species && species.length > 0 && !isMobile && !isUserContributor && (
            <div>
              <Button
                id='check-data'
                label={strings.CHECK_DATA}
                onClick={onCheckData}
                priority='secondary'
                size='medium'
                className={classes.buttonSpace}
              />
              <Button
                id='import-species'
                label={strings.IMPORT_SPECIES}
                onClick={onImportSpecies}
                priority='secondary'
                size='medium'
                className={classes.buttonSpace}
              />
              <Button id='add-species' label={strings.ADD_SPECIES} icon='plus' onClick={onNewSpecies} size='medium' />
            </div>
          )}
          {isMobile && !isUserContributor && (
            <Button id='add-species' onClick={onNewSpecies} size='medium' icon='plus' />
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
              value={searchValue}
              iconRight='cancel'
              onClickRightIcon={clearSearch}
            />
            <SpeciesFilters filters={record} setFilters={setRecord} />
            <IconButton onClick={downloadReportHandler} size='small' className={classes.iconContainer}>
              <Icon name='export' />
            </IconButton>
          </Grid>
          <Grid item xs={12} className={classes.searchBar}>
            {record.growthForm && (
              <Pill
                filter={strings.GROWTH_FORM}
                value={record.growthForm}
                onRemoveFilter={onRemoveFilterHandler('growthForm')}
              />
            )}
            {(record.rare || record.endangered) && (
              <Pill
                filter={strings.CONSERVATION_STATUS}
                value={record.rare ? strings.RARE : strings.ENDANGERED}
                onRemoveFilter={record.rare ? onRemoveFilterHandler('rare') : onRemoveFilterHandler('endangered')}
              />
            )}
            {record.seedStorageBehavior && (
              <Pill
                filter={strings.SEED_STORAGE_BEHAVIOR}
                value={record.seedStorageBehavior}
                onRemoveFilter={onRemoveFilterHandler('seedStorageBehavior')}
              />
            )}
          </Grid>
          {species && species.length ? (
            <Grid item xs={12}>
              {results && (
                <Table
                  id='species-table'
                  columns={selectedColumns}
                  rows={results}
                  orderBy='name'
                  showCheckbox={!isUserContributor}
                  selectedRows={selectedSpeciesRows}
                  setSelectedRows={isUserContributor ? undefined : setSelectedSpeciesRows}
                  showTopBar={true}
                  Renderer={SpeciesCellRenderer}
                  onSelect={selectAndEditSpecies}
                  controlledOnSelect={true}
                  reloadData={reloadDataProblemsHandler}
                  topBarButtons={
                    selectedSpeciesRows.length === 1
                      ? [
                          {
                            buttonType: 'passive',
                            ...(!isMobile && { buttonText: strings.DELETE }),
                            onButtonClick: OnDeleteSpecies,
                            icon: 'iconTrashCan',
                          },
                          {
                            buttonType: 'passive',
                            ...(!isMobile && { buttonText: strings.EDIT }),
                            onButtonClick: OnEditSpecies,
                            icon: 'iconEdit',
                          },
                        ]
                      : [
                          {
                            buttonType: 'passive',
                            ...(!isMobile && { buttonText: strings.DELETE }),
                            onButtonClick: OnDeleteSpecies,
                            icon: 'iconTrashCan',
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
