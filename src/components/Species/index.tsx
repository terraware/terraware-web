import { Container, Grid, Popover, Theme } from '@mui/material';
import { makeStyles } from '@mui/styles';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Button from 'src/components/common/button/Button';
import EmptyMessage from 'src/components/common/EmptyMessage';
import { OrderPreserveableTable as Table } from 'src/components/common/table';
import { TableColumnType } from 'src/components/common/table/types';
import strings from 'src/strings';
import { Species } from 'src/types/Species';
import TfMain from 'src/components/common/TfMain';
import PageSnackbar from 'src/components/PageSnackbar';
import AddSpeciesModal from './AddSpeciesModal';
import DeleteSpeciesModal from './DeleteSpeciesModal';
import TextField from '../common/Textfield/Textfield';
import SearchService, { SearchRequestPayload } from 'src/services/SearchService';
import { FieldNodePayload, FieldOptionsMap, SearchNodePayload, SearchSortOrder } from 'src/types/Search';
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
  LearnMoreModalContentGrowthForm,
  LearnMoreModalContentSeedStorageBehavior,
  LearnMoreLink,
  TooltipLearnMoreModalData,
} from 'src/components/TooltipLearnMoreModal';
import PageHeaderWrapper from 'src/components/common/PageHeaderWrapper';
import { DropdownItem, SortOrder } from '@terraware/web-components';
import { useLocalization, useOrganization } from 'src/providers/hooks';
import { PillList, PillListItem, Tooltip } from '@terraware/web-components';
import FilterGroup, { FilterField } from 'src/components/common/FilterGroup';
import { SpeciesService } from 'src/services';
import OptionsMenu from 'src/components/common/OptionsMenu';
import _ from 'lodash';
import useQuery from 'src/utils/useQuery';
import { useHistory } from 'react-router';
import { APP_PATHS } from 'src/constants';

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
    alignItems: 'center',
  },
  pillList: {
    display: 'flex',
    alightItems: 'center',
    marginTop: '16px',
  },
  icon: {
    fill: theme.palette.TwClrIcnSecondary,
  },
  headerIconContainer: {
    marginLeft: '12px',
  },
  popoverContainer: {
    '& .MuiPaper-root': {
      border: `1px solid ${theme.palette.TwClrBrdrTertiary}`,
      borderRadius: '8px',
      width: '480px',
    },
  },
}));

type SpeciesSearchResultRow = Omit<
  Species,
  'growthForm' | 'seedStorageBehavior' | 'ecosystemTypes' | 'conservationCategory' | 'rare'
> & {
  conservationCategory?: string;
  growthForm?: string;
  rare?: string;
  seedStorageBehavior?: string;
  ecosystemTypes?: string[];
};

const BE_SORTED_FIELDS = [
  'scientificName',
  'commonName',
  'conservationCategory',
  'familyName',
  'growthForm',
  'seedStorageBehavior',
];

// These need to be in the same order as in the import template.
const CSV_FIELDS = [
  'scientificName',
  'commonName',
  'familyName',
  'conservationCategory',
  'rare',
  'growthForm',
  'seedStorageBehavior',
  'ecosystemTypes.ecosystemType',
];

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
  const [searchValue, setSearchValue] = useState('');
  const debouncedSearchTerm = useDebounce(searchValue, 250);
  const [results, setResults] = useState<SpeciesSearchResultRow[]>();
  const query = useQuery();
  const history = useHistory();

  const [filterAnchorEl, setFilterAnchorEl] = useState<null | HTMLElement>(null);
  const handleFilterClick = (event: React.MouseEvent<HTMLElement>) => {
    setFilterAnchorEl(event.currentTarget);
  };
  const handleFilterClose = () => {
    setFilterAnchorEl(null);
  };

  const contentRef = useRef(null);
  const { activeLocale } = useLocalization();
  const [searchSortOrder, setSearchSortOrder] = useState<SearchSortOrder | undefined>({
    field: 'scientificName',
    direction: 'Ascending',
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

  const columns: TableColumnType[] = React.useMemo(() => {
    // No-op to make lint happy so it doesn't think the dependency is unused.
    if (!activeLocale) {
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
        key: 'conservationCategory',
        name: strings.CONSERVATION_CATEGORY,
        type: 'string',
        tooltipTitle: (
          <>
            {`${strings.TOOLTIP_SPECIES_CONSERVATION_CATEGORY} `}
            <a
              target='_blank'
              rel='noopener noreferrer'
              href='https://www.iucnredlist.org/resources/categories-and-criteria'
            >
              {strings.LEARN_MORE}
            </a>
          </>
        ),
      },
      {
        key: 'rare',
        name: strings.RARE,
        type: 'boolean',
        tooltipTitle: strings.TOOLTIP_SPECIES_RARE,
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
  }, [activeLocale]);

  const filterColumns = useMemo<FilterField[]>(
    () =>
      activeLocale
        ? [
            { name: 'growthForm', label: strings.GROWTH_FORM, type: 'multiple_selection' },
            { name: 'conservationCategory', label: strings.CONSERVATION_CATEGORY, type: 'multiple_selection' },
            { name: 'rare', label: strings.RARE, type: 'multiple_selection' },
            { name: 'seedStorageBehavior', label: strings.SEED_STORAGE_BEHAVIOR, type: 'multiple_selection' },
            { name: 'ecosystemTypes.ecosystemType', label: strings.ECOSYSTEM_TYPE, type: 'multiple_selection' },
          ]
        : [],
    [activeLocale]
  );

  const [filters, setFilters] = useState<Record<string, any>>({});
  const [filterOptions, setFilterOptions] = useState<FieldOptionsMap>({});

  useEffect(() => {
    const getApiSearchResults = async () => {
      const searchParams: SearchRequestPayload = {
        prefix: 'species',
        fields: [
          'id',
          'growthForm',
          'seedStorageBehavior',
          'ecosystemTypes.ecosystemType',
          'conservationCategory',
          'rare',
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
        sortOrder: [{ field: 'id', direction: 'Ascending' }],
        count: 1000,
      };

      const data = await SearchService.search(searchParams);
      const result = (data ?? []).reduce((acc, d) => {
        return Object.keys(d).reduce((innerAcc, k) => {
          const isEcosystemTypes = k === 'ecosystemTypes';
          const newKey = isEcosystemTypes ? 'ecosystemTypes.ecosystemType' : k;
          if (!innerAcc[newKey]) {
            innerAcc[newKey] = { partial: false, values: [] };
          }
          const value = isEcosystemTypes ? (d[k] as any[]).map((et) => et.ecosystemType) : d[k];
          if (Array.isArray(value)) {
            (innerAcc[newKey] as Record<string, any>).values.push(...value);
          } else {
            (innerAcc[newKey] as Record<string, any>).values.push(value);
          }
          return innerAcc;
        }, acc);
      }, {}) as FieldOptionsMap;
      result.rare = { partial: false, values: [strings.YES, strings.NO] };
      setFilterOptions(result);
    };
    getApiSearchResults();
  }, [selectedOrganization, results]);

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

  const getParams = useCallback(() => {
    const params: SearchNodePayload = {
      prefix: 'species',
      fields: [...BE_SORTED_FIELDS, 'id', 'rare', 'ecosystemTypes.ecosystemType', 'organization_id'],
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

      const commonNameNode: FieldNodePayload = {
        operation: 'field',
        field: 'commonName',
        type: 'Fuzzy',
        values: [debouncedSearchTerm],
      };
      searchValueChildren.push(commonNameNode);

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

    if (filters.rare) {
      const searchValues: (string | null)[] = [];
      const selectedValues = filters.rare.values as string[];
      if (selectedValues.find((s) => s === strings.YES)) {
        searchValues.push(strings.BOOLEAN_TRUE);
      }
      if (selectedValues.find((s) => s === strings.NO)) {
        searchValues.push(strings.BOOLEAN_FALSE);
        searchValues.push(null);
      }
      const newNode: FieldNodePayload = {
        operation: 'field',
        field: 'rare',
        type: 'Exact',
        values: searchValues,
      };
      params.search.children.push(newNode);
    }

    if (filters.conservationCategory) {
      params.search.children.push(filters.conservationCategory);
    }
    if (filters.growthForm) {
      params.search.children.push(filters.growthForm);
    }
    if (filters.seedStorageBehavior) {
      params.search.children.push(filters.seedStorageBehavior);
    }
    if (filters['ecosystemTypes.ecosystemType']) {
      params.search.children.push(filters['ecosystemTypes.ecosystemType']);
    }

    return params;
  }, [filters, debouncedSearchTerm, selectedOrganization, searchSortOrder]);

  const onApplyFilters = useCallback(
    async (reviewErrors?: boolean) => {
      const params: SearchNodePayload = getParams();

      if (species) {
        // organization id filter will always exist
        const requestId = Math.random().toString();
        setRequestId('searchSpecies', requestId);
        const searchResults = await SearchService.search(params);
        if (getRequestId('searchSpecies') === requestId) {
          const speciesResults: SpeciesSearchResultRow[] = [];
          searchResults?.forEach((result) => {
            speciesResults.push({
              id: result.id as number,
              problems: species.find((sp) => sp.id.toString() === (result.id as string))?.problems,
              scientificName: result.scientificName as string,
              commonName: result.commonName as string,
              familyName: result.familyName as string,
              growthForm: result.growthForm as string,
              seedStorageBehavior: result.seedStorageBehavior as string,
              ecosystemTypes: (result.ecosystemTypes as any[])?.map((et) => et.ecosystemType) as string[],
              rare: result.rare === strings.BOOLEAN_TRUE ? 'true' : 'false',
              conservationCategory: result.conservationCategory as string,
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
    if (activeLocale) {
      setFilters({});
      setSelectedColumns(columns);
    }
  }, [columns, setSelectedColumns, activeLocale]);

  useEffect(() => {
    const shouldCheckData = query.has('checkData');
    if (shouldCheckData) {
      query.delete('checkData');
      setCheckDataModalOpen(true);
      history.replace({ pathname: APP_PATHS.SPECIES, search: query.toString() });
    }
  }, [query, setCheckDataModalOpen, history]);

  useEffect(() => {
    onApplyFilters();
  }, [onApplyFilters]);

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
    const speciesResponse = await SpeciesService.getSpecies(speciesId, selectedOrganization.id);
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
          await SpeciesService.deleteSpecies(iSelectedSpecies.id, selectedOrganization.id);
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
    params.fields = CSV_FIELDS;
    const apiResponse = await SearchService.searchCsv(params);

    if (apiResponse !== null) {
      const csvContent = 'data:text/csv;charset=utf-8,' + apiResponse;
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', `species.csv`);
      link.click();
    }
  };

  const onRemoveFilter = (key: string) => {
    if (filters[key]) {
      const newFilters = { ...filters };
      delete newFilters[key];
      setFilters(newFilters);
    }
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
      if (!_.isEqual(selectedColumns, newColumns)) {
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

  const onOptionItemClick = (optionItem: DropdownItem) => {
    switch (optionItem.value) {
      case 'checkData': {
        onCheckData();
        break;
      }
      case 'import': {
        onImportSpecies();
        break;
      }
    }
  };

  const getFilterPillData = (): PillListItem<string>[] => {
    const result = [];
    if (filters.conservationCategory) {
      result.push({
        id: 'conservationCategory',
        label: strings.CONSERVATION_CATEGORY,
        value: filters.conservationCategory.values?.join(', ') ?? '',
        onRemove: () => onRemoveFilter('conservationCategory'),
      });
    }
    if (filters.rare) {
      result.push({
        id: 'rare',
        label: strings.RARE,
        value: filters.rare.values?.join(', ') ?? '',
        onRemove: () => onRemoveFilter('rare'),
      });
    }
    if (filters.growthForm) {
      result.push({
        id: 'growthForm',
        label: strings.GROWTH_FORM,
        value: filters.growthForm.values?.join(', ') ?? '',
        onRemove: () => onRemoveFilter('growthForm'),
      });
    }
    if (filters.seedStorageBehavior) {
      result.push({
        id: 'seedStorageBehavior',
        label: strings.SEED_STORAGE_BEHAVIOR,
        value: filters.seedStorageBehavior.values?.join(', ') ?? '',
        onRemove: () => onRemoveFilter('seedStorageBehavior'),
      });
    }
    if (filters['ecosystemTypes.ecosystemType']) {
      result.push({
        id: 'ecosystemTypes.ecosystemType',
        label: strings.ECOSYSTEM_TYPE,
        value: filters['ecosystemTypes.ecosystemType'].values?.join(', ') ?? '',
        onRemove: () => onRemoveFilter('ecosystemTypes.ecosystemType'),
      });
    }

    return result;
  };

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
      {editSpeciesModalOpen && (
        <AddSpeciesModal
          open={editSpeciesModalOpen}
          onClose={onCloseEditSpeciesModal}
          initialSpecies={selectedSpecies}
        />
      )}
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
                <OptionsMenu
                  onOptionItemClick={onOptionItemClick}
                  optionItems={[
                    { label: strings.CHECK_DATA, value: 'checkData' },
                    { label: strings.IMPORT, value: 'import' },
                  ]}
                />
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
            <Tooltip title={strings.FILTER}>
              <Button
                id='filterSpecies'
                onClick={(event) => event && handleFilterClick(event)}
                type='passive'
                priority='ghost'
                icon='filter'
              />
            </Tooltip>
            <Popover
              id='simple-popover'
              open={Boolean(filterAnchorEl)}
              anchorEl={filterAnchorEl}
              onClose={handleFilterClose}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'center',
              }}
              transformOrigin={{
                vertical: 'top',
                horizontal: 'center',
              }}
              className={classes.popoverContainer}
            >
              <FilterGroup
                initialFilters={filters}
                fields={filterColumns}
                values={filterOptions || {}}
                onConfirm={(fs) => {
                  handleFilterClose();
                  setFilters(fs);
                }}
                onCancel={handleFilterClose}
              />
            </Popover>
            <Tooltip title={strings.EXPORT}>
              <Button
                id='downladSpeciesReport'
                onClick={() => downloadReportHandler()}
                type='passive'
                priority='ghost'
                icon='iconExport'
              />
            </Tooltip>
          </Grid>
          <Grid item xs={12} className={classes.pillList}>
            <PillList data={getFilterPillData()} />
          </Grid>
          {species && species.length ? (
            <Grid item xs={12}>
              {results && (
                <Table
                  setColumns={(columnsToSet: TableColumnType[]) => {
                    // show the check-data error column only if it was already exposed
                    const showProblemsColumn = selectedColumns.find((column) => column.key === problemsColumn.key);
                    setSelectedColumns(
                      columnsToSet.filter((column) => showProblemsColumn || column.key !== problemsColumn.key)
                    );
                  }}
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
