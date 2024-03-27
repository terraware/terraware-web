import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useHistory } from 'react-router';

import { Grid, Popover, Theme } from '@mui/material';
import { makeStyles } from '@mui/styles';
import { DropdownItem, SortOrder } from '@terraware/web-components';
import { PillList, PillListItem, Tooltip } from '@terraware/web-components';
import _ from 'lodash';

import PageSnackbar from 'src/components/PageSnackbar';
import TooltipLearnMoreModal, {
  LearnMoreLink,
  LearnMoreModalContentGrowthForm,
  LearnMoreModalContentSeedStorageBehavior,
  TooltipLearnMoreModalData,
} from 'src/components/TooltipLearnMoreModal';
import Card from 'src/components/common/Card';
import EmptyMessage from 'src/components/common/EmptyMessage';
import FilterGroup, { FilterField } from 'src/components/common/FilterGroup';
import OptionsMenu from 'src/components/common/OptionsMenu';
import PageHeaderWrapper from 'src/components/common/PageHeaderWrapper';
import TfMain from 'src/components/common/TfMain';
import Button from 'src/components/common/button/Button';
import { OrderPreserveableTable as Table } from 'src/components/common/table';
import { TableColumnType } from 'src/components/common/table/types';
import { APP_PATHS } from 'src/constants';
import { useLocalization, useOrganization } from 'src/providers/hooks';
import SearchService from 'src/services/SearchService';
import strings from 'src/strings';
import { FieldNodePayload, FieldOptionsMap, SearchRequestPayload, SearchSortOrder } from 'src/types/Search';
import { Species } from 'src/types/Species';
import { isContributor } from 'src/utils/organization';
import { getRequestId, setRequestId } from 'src/utils/requestsId';
import useDebounce from 'src/utils/useDebounce';
import useDeviceInfo from 'src/utils/useDeviceInfo';
import useForm from 'src/utils/useForm';
import useQuery from 'src/utils/useQuery';

import TextField from '../../components/common/Textfield/Textfield';
import Icon from '../../components/common/icon/Icon';
import CheckDataModal from './CheckDataModal';
import ImportSpeciesModal from './ImportSpeciesModal';
import SpeciesCellRenderer from './TableCellRenderer';
import { SpeciesSearchResultRow } from './types';

type SpeciesListProps = {
  reloadData: () => void;
  species: Species[];
};

const useStyles = makeStyles((theme: Theme) => ({
  mainContainer: {
    padding: theme.spacing(3),
    backgroundColor: theme.palette.TwClrBg,
    borderRadius: '32px',
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

export default function SpeciesListView({ reloadData, species }: SpeciesListProps): JSX.Element {
  const { selectedOrganization } = useOrganization();
  const classes = useStyles();
  const [importSpeciesModalOpen, setImportSpeciesModalOpen] = useState(false);
  const [checkDataModalOpen, setCheckDataModalOpen] = useState(false);
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
        fields: ['growthForm', 'seedStorageBehavior', 'ecosystemTypes_ecosystemType', 'conservationCategory'],
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
        count: 1000,
      };

      const data = await SearchService.searchValues(searchParams);

      const result = (data || {}) as FieldOptionsMap;

      // remap ecosystemTypes to nested field from flattened field
      /* tslint:disable:no-string-literal */
      if (result['ecosystemTypes_ecosystemType']) {
        result['ecosystemTypes.ecosystemType'] = result['ecosystemTypes_ecosystemType'];
        delete result['ecosystemTypes_ecosystemType'];
      }
      /* tslint:enable:no-string-literal */

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
    const params: SearchRequestPayload = {
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
      const params: SearchRequestPayload = getParams();

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

  const onNewSpecies = () => {
    history.push(APP_PATHS.SPECIES_NEW);
  };

  const clearSearch = () => {
    setSearchValue('');
  };

  const onChangeSearch = (id: string, value: unknown) => {
    setSearchValue(value as string);
  };

  const downloadReportHandler = async () => {
    const params = getParams();
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
      </Grid>
      <Card flushMobile>
        <Grid container>
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
                  showTopBar={false}
                  Renderer={SpeciesCellRenderer}
                  controlledOnSelect={true}
                  reloadData={reloadDataProblemsHandler}
                  sortHandler={onSortChange}
                  isPresorted={!!searchSortOrder}
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
        </Grid>
      </Card>
    </TfMain>
  );
}
