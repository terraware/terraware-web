import { Box, Container, Grid, IconButton, Theme } from '@mui/material';
import { makeStyles } from '@mui/styles';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useRecoilState } from 'recoil';
import { deleteSpecies, getSpecies } from 'src/api/species/species';
import Button from 'src/components/common/button/Button';
import EmptyMessage from 'src/components/common/EmptyMessage';
import Table from 'src/components/common/table';
import { TableColumnType } from 'src/components/common/table/types';
import speciesAtom from 'src/state/species';
import strings from 'src/strings';
import {
  EcosystemType,
  getEcosystemTypesString,
  getGrowthFormString,
  getSeedStorageBehaviorString,
  Species,
  SpeciesProblemElement,
} from 'src/types/Species';
import TfMain from 'src/components/common/TfMain';
import PageSnackbar from 'src/components/PageSnackbar';
import AddSpeciesModal from './AddSpeciesModal';
import DeleteSpeciesModal from './DeleteSpeciesModal';
import TextField from '../common/Textfield/Textfield';
import { FieldNodePayload, search, searchCsv, SearchNodePayload, SearchSortOrder } from 'src/api/search';
import SpeciesFilters from './SpeciesFiltersPopover';
import useForm from 'src/utils/useForm';
import Icon from '../common/icon/Icon';
import ImportSpeciesModal from './ImportSpeciesModal';
import CheckDataModal from './CheckDataModal';
import SpeciesCellRenderer from './TableCellRenderer';
import useDebounce from 'src/utils/useDebounce';
import { getRequestId, setRequestId } from 'src/utils/requestsId';
import useDeviceInfo from 'src/utils/useDeviceInfo';
import useSnackbar from 'src/utils/useSnackbar';
import { isContributor } from 'src/utils/organization';
import TooltipLearnMoreModal, {
  LearnMoreModalContentConservationStatus,
  LearnMoreModalContentGrowthForm,
  LearnMoreModalContentSeedStorageBehavior,
  LearnMoreLink,
  TooltipLearnMoreModalData,
} from 'src/components/TooltipLearnMoreModal';
import PageHeaderWrapper from 'src/components/common/PageHeaderWrapper';
import PopoverMenu from '../common/PopoverMenu';
import { DropdownItem, SortOrder } from '@terraware/web-components';
import { useLocalization, useOrganization } from 'src/providers/hooks';
import { PillList, PillListItem } from '@terraware/web-components';
import { isTrue } from 'src/utils/boolean';

type SpeciesListProps = {
  reloadData: () => void;
  species: Species[];
};

const useStyles = makeStyles((theme: Theme) => ({
  mainContainer: {
    padding: theme.spacing(3),
    backgroundColor: theme.palette.TwClrBg,
    borderRadius: '32px',
    minWidth: 'fit-content',
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
    paddingBottom: theme.spacing(4),
    paddingLeft: theme.spacing(3),
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
    fill: theme.palette.TwClrIcnSecondary,
  },
  headerIconContainer: {
    marginLeft: '12px',
  },
}));

export type SpeciesFiltersType = {
  growthForm?: 'Tree' | 'Shrub' | 'Forb' | 'Graminoid' | 'Fern';
  seedStorageBehavior?: 'Orthodox' | 'Recalcitrant' | 'Intermediate' | 'Unknown';
  ecosystemType?: EcosystemType;
  rare?: boolean;
  endangered?: boolean;
};

type SpeciesSearchResultRow = Omit<Species, 'growthForm' | 'seedStorageBehavior' | 'ecosystemTypes'> & {
  conservationStatus?: string;
  growthForm?: string;
  seedStorageBehavior?: string;
  ecosystemTypes?: string[];
};

export default function SpeciesList({ reloadData, species }: SpeciesListProps): JSX.Element {
  const { selectedOrganization } = useOrganization();
  const classes = useStyles();
  const [selectedSpecies, setSelectedSpecies] = useState<Species>();
  const [selectedSpeciesRows, setSelectedSpeciesRows] = useState<SpeciesSearchResultRow[]>([]);
  const [editSpeciesModalOpen, setEditSpeciesModalOpen] = useState(false);
  const [deleteSpeciesModalOpen, setDeleteSpeciesModalOpen] = useState(false);
  const [importSpeciesModalOpen, setImportSpeciesModalOpen] = useState(false);
  const [checkDataModalOpen, setCheckDataModalOpen] = useState(false);
  const snackbar = useSnackbar();
  const [speciesState, setSpeciesState] = useRecoilState(speciesAtom);
  const [searchValue, setSearchValue] = useState('');
  const debouncedSearchTerm = useDebounce(searchValue, 250);
  const [results, setResults] = useState<SpeciesSearchResultRow[]>();
  const [record, setRecord] = useForm<SpeciesFiltersType>({});
  const contentRef = useRef(null);
  const { loadedStringsForLocale } = useLocalization();
  const [searchSortOrder, setSearchSortOrder] = useState<SearchSortOrder | undefined>({
    field: 'scientificName',
    direction: 'Descending',
  } as SearchSortOrder);

  const [tooltipLearnMoreModalOpen, setTooltipLearnMoreModalOpen] = useState(false);
  const [tooltipLearnMoreModalData, setTooltipLearnMoreModalData] = useState<TooltipLearnMoreModalData | undefined>(
    undefined
  );
  const openTooltipLearnMoreModal = (data: TooltipLearnMoreModalData) => {
    setTooltipLearnMoreModalData(data);
    setTooltipLearnMoreModalOpen(true);
  };
  const handleTooltipLearnMoreModalClose = () => {
    setTooltipLearnMoreModalOpen(false);
  };

  const getConservationStatusString = (result: { [key: string]: unknown }) => {
    const endangered = isTrue(result.endangered);
    const rare = isTrue(result.rare);

    if (endangered && rare) {
      return strings.RARE_ENDANGERED;
    } else if (endangered) {
      return strings.ENDANGERED;
    } else if (rare) {
      return strings.RARE;
    } else {
      return '';
    }
  };

  const columns: TableColumnType[] = React.useMemo(() => {
    // No-op to make lint happy so it doesn't think the dependency is unused.
    if (!loadedStringsForLocale) {
      return [];
    }

    return [
      {
        key: 'scientificName',
        name: strings.SCIENTIFIC_NAME,
        type: 'string',
        tooltipTitle: strings.TOOLTIP_SCIENTIFIC_NAME,
      },
      {
        key: 'commonName',
        name: strings.COMMON_NAME,
        type: 'string',
        tooltipTitle: strings.TOOLTIP_COMMON_NAME,
      },
      {
        key: 'familyName',
        name: strings.FAMILY,
        type: 'string',
        tooltipTitle: strings.TOOLTIP_SPECIES_FAMILY,
      },
      {
        key: 'growthForm',
        name: strings.GROWTH_FORM,
        type: 'string',
        tooltipTitle: (
          <>
            {strings.TOOLTIP_SPECIES_GROWTH_FORM}
            <LearnMoreLink
              onClick={() =>
                openTooltipLearnMoreModal({
                  title: strings.GROWTH_FORM,
                  content: <LearnMoreModalContentGrowthForm />,
                })
              }
            />
          </>
        ),
      },
      {
        key: 'conservationStatus',
        name: strings.CONSERVATION_STATUS,
        type: 'string',
        tooltipTitle: (
          <>
            {strings.TOOLTIP_SPECIES_CONSERVATION_STATUS}
            <LearnMoreLink
              onClick={() =>
                openTooltipLearnMoreModal({
                  title: strings.CONSERVATION_STATUS,
                  content: <LearnMoreModalContentConservationStatus />,
                })
              }
            />
          </>
        ),
      },
      {
        key: 'seedStorageBehavior',
        name: strings.SEED_STORAGE_BEHAVIOR,
        type: 'string',
        tooltipTitle: (
          <>
            {strings.TOOLTIP_SPECIES_SEED_STORAGE_BEHAVIOR}
            <LearnMoreLink
              onClick={() =>
                openTooltipLearnMoreModal({
                  title: strings.SEED_STORAGE_BEHAVIOR,
                  content: <LearnMoreModalContentSeedStorageBehavior />,
                })
              }
            />
          </>
        ),
      },
      {
        key: 'ecosystemTypes',
        name: strings.ECOSYSTEM_TYPE,
        type: 'string',
        tooltipTitle: (
          <>
            {`${strings.TOOLTIP_ECOSYSTEM_TYPE} `}
            <a
              target='_blank'
              rel='noopener noreferrer'
              href='https://www.worldwildlife.org/publications/terrestrial-ecoregions-of-the-world'
            >
              {strings.LEARN_MORE}
            </a>
          </>
        ),
      },
    ];
  }, [loadedStringsForLocale]);

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
  const userCanEdit = !isContributor(selectedOrganization);
  const { isMobile } = useDeviceInfo();

  const BE_SORTED_FIELDS = ['scientificName', 'commonName', 'familyName', 'growthForm', 'seedStorageBehavior'];

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
        'ecosystemTypes.ecosystemType',
        'organization_id',
      ],
      search: {
        operation: 'and',
        children: [
          {
            operation: 'field',
            field: 'organization_id',
            type: 'Exact',
            values: [selectedOrganization.id],
          },
        ],
      },
      count: 0,
    };

    if (searchSortOrder) {
      params.sortOrder = [searchSortOrder];
    }

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
        values: [record.endangered ? strings.BOOLEAN_TRUE : strings.BOOLEAN_FALSE],
      };
      params.search.children.push(newNode);
    }

    if (record.rare !== undefined) {
      const newNode: FieldNodePayload = {
        operation: 'field',
        field: 'rare',
        type: 'Exact',
        values: [record.rare ? strings.BOOLEAN_TRUE : strings.BOOLEAN_FALSE],
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

    if (record.ecosystemType !== undefined) {
      const newNode: FieldNodePayload = {
        operation: 'field',
        field: 'ecosystemTypes.ecosystemType',
        type: 'Exact',
        values: [record.ecosystemType],
      };
      params.search.children.push(newNode);
    }

    return params;
  }, [record, debouncedSearchTerm, selectedOrganization, searchSortOrder]);

  const onApplyFilters = useCallback(
    async (reviewErrors?: boolean) => {
      const params: SearchNodePayload = getParams();

      if (species) {
        // organization id filter will always exist
        const requestId = Math.random().toString();
        setRequestId('searchSpecies', requestId);
        const searchResults = await search(params);
        if (getRequestId('searchSpecies') === requestId) {
          const speciesResults: SpeciesSearchResultRow[] = [];
          searchResults?.forEach((result) => {
            speciesResults.push({
              id: result.id as number,
              problems: result.problems as SpeciesProblemElement[],
              scientificName: result.scientificName as string,
              commonName: result.commonName as string,
              familyName: result.familyName as string,
              growthForm: getGrowthFormString(result as Species),
              seedStorageBehavior: getSeedStorageBehaviorString(result as Species),
              ecosystemTypes: getEcosystemTypesString({
                ...result,
                ecosystemTypes: (result.ecosystemTypes as Record<string, EcosystemType>[])?.map((r) => r.ecosystemType),
              } as Species),
              rare: isTrue(result.rare),
              endangered: isTrue(result.endangered),
              conservationStatus: getConservationStatusString(result),
            });
          });

          setResults(speciesResults);
        }
      }
    },
    [getParams, species]
  );

  // When the user switches locales, we need to update the state value that contains the list of
  // column definitions as well as reset the search filters.
  useEffect(() => {
    if (loadedStringsForLocale) {
      setRecord({});
      setSelectedColumns(columns);
    }
  }, [columns, setRecord, setSelectedColumns, loadedStringsForLocale]);

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

  const openEditSpeciesModal = async (speciesId: number) => {
    const speciesResponse = await getSpecies(speciesId, selectedOrganization.id.toString());
    if (speciesResponse.requestSucceeded) {
      setSelectedSpecies(speciesResponse.species);
      setEditSpeciesModalOpen(true);
    } else {
      setErrorSnackbar(strings.GENERIC_ERROR);
    }
  };

  const OnEditSpecies = () => {
    openEditSpeciesModal(selectedSpeciesRows[0].id);
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
          await deleteSpecies(iSelectedSpecies.id, selectedOrganization.id);
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

  const noFilters =
    record.endangered === undefined &&
    record.rare === undefined &&
    record.growthForm === undefined &&
    record.seedStorageBehavior === undefined;

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
  }, [
    handleProblemsColumn,
    problemsColumn,
    results,
    selectedColumns,
    setSelectedColumns,
    hasNewData,
    setHasNewData,
    columns,
  ]);

  const [actionMenuAnchorEl, setActionMenuAnchorEl] = React.useState<HTMLElement | null>(null);

  const handleClickActionMenuButton = (event: React.MouseEvent<HTMLElement>) => {
    setActionMenuAnchorEl(event.currentTarget);
  };

  const handleCloseActionMenu = () => {
    setActionMenuAnchorEl(null);
  };

  const onItemClick = (selectedItem: DropdownItem) => {
    switch (selectedItem.value) {
      case 'checkData': {
        handleCloseActionMenu();
        onCheckData();
        break;
      }
      case 'import': {
        handleCloseActionMenu();
        onImportSpecies();
        break;
      }
      default: {
        handleCloseActionMenu();
      }
    }
  };

  const getFilterPillData = (): PillListItem<string>[] => {
    const result = [];
    if (record.growthForm) {
      result.push({
        id: 'growthForm',
        label: strings.GROWTH_FORM,
        value: record.growthForm,
        onRemove: onRemoveFilterHandler('growthForm'),
      });
    }
    if (record.rare || record.endangered) {
      result.push({
        id: 'rare',
        label: strings.CONSERVATION_STATUS,
        value: record.rare ? strings.RARE : strings.ENDANGERED,
        onRemove: record.rare ? onRemoveFilterHandler('rare') : onRemoveFilterHandler('endangered'),
      });
    }
    if (record.seedStorageBehavior) {
      result.push({
        id: 'seedStorageBehavior',
        label: strings.SEED_STORAGE_BEHAVIOR,
        value: record.seedStorageBehavior,
        onRemove: onRemoveFilterHandler('seedStorageBehavior'),
      });
    }
    if (record.ecosystemType) {
      result.push({
        id: 'ecosystemType',
        label: strings.ECOSYSTEM_TYPE,
        value: record.ecosystemType,
        onRemove: onRemoveFilterHandler('ecosystemType'),
      });
    }

    return result;
  };

  const getHeaderButtons = () => (
    <>
      <Box marginLeft={1} display='inline'>
        <Button
          id='more-options'
          icon='menuVertical'
          onClick={(event) => event && handleClickActionMenuButton(event)}
          priority='secondary'
          size='medium'
        />
      </Box>
      <PopoverMenu
        sections={[
          [
            { label: strings.CHECK_DATA, value: 'checkData' },
            { label: strings.IMPORT, value: 'import' },
          ],
        ]}
        handleClick={onItemClick}
        anchorElement={actionMenuAnchorEl}
        setAnchorElement={setActionMenuAnchorEl}
      />
    </>
  );

  const onSortChange = (order: SortOrder, orderBy: string) => {
    const isClientSorted = BE_SORTED_FIELDS.indexOf(orderBy) === -1;
    setSearchSortOrder(
      isClientSorted
        ? undefined
        : {
            field: orderBy as string,
            direction: order === 'asc' ? 'Ascending' : 'Descending',
          }
    );
  };

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
      <AddSpeciesModal open={editSpeciesModalOpen} onClose={onCloseEditSpeciesModal} initialSpecies={selectedSpecies} />
      <ImportSpeciesModal
        open={importSpeciesModalOpen}
        onClose={onCloseImportSpeciesModal}
        setCheckDataModalOpen={setCheckDataModalOpen}
      />
      <TooltipLearnMoreModal
        content={tooltipLearnMoreModalData?.content}
        onClose={handleTooltipLearnMoreModalClose}
        open={tooltipLearnMoreModalOpen}
        title={tooltipLearnMoreModalData?.title}
      />
      <Grid container>
        <PageHeaderWrapper nextElement={contentRef.current}>
          <Grid item xs={12} className={classes.titleContainer}>
            <h1 className={classes.pageTitle}>{strings.SPECIES}</h1>
            {species && species.length > 0 && !isMobile && userCanEdit && (
              <div>
                <Button id='add-species' label={strings.ADD_SPECIES} icon='plus' onClick={onNewSpecies} size='medium' />
                {getHeaderButtons()}
              </div>
            )}
            {isMobile && userCanEdit && <Button id='add-species' onClick={onNewSpecies} size='medium' icon='plus' />}
          </Grid>
          <PageSnackbar />
        </PageHeaderWrapper>
        <Container ref={contentRef} maxWidth={false} className={classes.mainContainer}>
          <Grid item xs={12} className={classes.searchBar}>
            <TextField
              placeholder={strings.SEARCH_BY_NAME_OR_FAMILY}
              iconLeft='search'
              label=''
              id='search'
              type='text'
              className={classes.searchField}
              onChange={(value) => onChangeSearch('search', value)}
              value={searchValue}
              iconRight='cancel'
              onClickRightIcon={clearSearch}
            />
            <SpeciesFilters filters={record} setFilters={setRecord} />
            <IconButton onClick={downloadReportHandler} size='small' className={classes.iconContainer}>
              <Icon name='iconExport' size='medium' className={classes.icon} />
            </IconButton>
          </Grid>
          <Grid item xs={12} className={noFilters ? '' : classes.searchBar}>
            <PillList data={getFilterPillData()} />
          </Grid>
          {species && species.length ? (
            <Grid item xs={12}>
              {results && (
                <Table
                  id='species-table'
                  columns={selectedColumns}
                  rows={results}
                  orderBy={'scientificName'}
                  showCheckbox={userCanEdit}
                  selectedRows={selectedSpeciesRows}
                  setSelectedRows={userCanEdit ? setSelectedSpeciesRows : undefined}
                  showTopBar={true}
                  Renderer={SpeciesCellRenderer}
                  controlledOnSelect={true}
                  reloadData={reloadDataProblemsHandler}
                  sortHandler={onSortChange}
                  isPresorted={!!searchSortOrder}
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
              title={strings.ADD_A_SPECIES}
              text={strings.SPECIES_EMPTY_MSG_BODY}
              buttonText={strings.ADD_SPECIES}
              onClick={onNewSpecies}
            />
          )}
        </Container>
      </Grid>
    </TfMain>
  );
}
