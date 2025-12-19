import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { Box, Grid, useTheme } from '@mui/material';
import { DropdownItem, SortOrder, Tooltip } from '@terraware/web-components';
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
import { FilterField } from 'src/components/common/FilterGroup';
import OptionsMenu from 'src/components/common/OptionsMenu';
import PageHeaderWrapper from 'src/components/common/PageHeaderWrapper';
import SearchFiltersWrapperV2, { FilterConfig } from 'src/components/common/SearchFiltersWrapperV2';
import TfMain from 'src/components/common/TfMain';
import Button from 'src/components/common/button/Button';
import { OrderPreserveableTable as Table } from 'src/components/common/table';
import TableSettingsButton from 'src/components/common/table/TableSettingsButton';
import { TableColumnType } from 'src/components/common/table/types';
import { APP_PATHS } from 'src/constants';
import { DEFAULT_SEARCH_DEBOUNCE_MS } from 'src/constants';
import { useSyncNavigate } from 'src/hooks/useSyncNavigate';
import { useParticipantData } from 'src/providers/Participant/ParticipantContext';
import { useLocalization, useOrganization } from 'src/providers/hooks';
import { selectProjects } from 'src/redux/features/projects/projectsSelectors';
import { useAppSelector } from 'src/redux/store';
import SearchService from 'src/services/SearchService';
import strings from 'src/strings';
import { Project } from 'src/types/Project';
import { FieldNodePayload, FieldOptionsMap, SearchRequestPayload, SearchSortOrder } from 'src/types/Search';
import { Species } from 'src/types/Species';
import { downloadCsv } from 'src/utils/csv';
import { isContributor } from 'src/utils/organization';
import { getRequestId, setRequestId } from 'src/utils/requestsId';
import { parseSearchTerm } from 'src/utils/search';
import useDebounce from 'src/utils/useDebounce';
import useDeviceInfo from 'src/utils/useDeviceInfo';
import useForm from 'src/utils/useForm';
import useQuery from 'src/utils/useQuery';

import Icon from '../../components/common/icon/Icon';
import CheckDataModal from './CheckDataModal';
import ImportSpeciesModal from './ImportSpeciesModal';
import SpeciesCellRenderer from './TableCellRenderer';
import { SpeciesSearchResultRow } from './types';

type SpeciesListProps = {
  reloadData: () => void;
  species: Species[];
};

const BE_SORTED_FIELDS = ['scientificName', 'commonName', 'conservationCategory', 'familyName', 'seedStorageBehavior'];

// These need to be in the same order as in the import template.
const CSV_FIELDS = [
  'scientificName',
  'commonName',
  'familyName',
  'conservationCategory',
  'rare',
  'growthForms.growthForm',
  'seedStorageBehavior',
  'ecosystemTypes.ecosystemType',
];

export default function SpeciesListView({ reloadData, species }: SpeciesListProps): JSX.Element {
  const { selectedOrganization } = useOrganization();
  const theme = useTheme();
  const [importSpeciesModalOpen, setImportSpeciesModalOpen] = useState(false);
  const [checkDataModalOpen, setCheckDataModalOpen] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const debouncedSearchTerm = useDebounce(searchValue, DEFAULT_SEARCH_DEBOUNCE_MS);
  const [results, setResults] = useState<SpeciesSearchResultRow[]>();
  const query = useQuery();
  const navigate = useSyncNavigate();
  const projects = useAppSelector(selectProjects);
  const { orgHasParticipants } = useParticipantData();

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
      ...(orgHasParticipants
        ? ([
            {
              key: 'participantProjects',
              name: strings.PROJECTS,
              type: 'string',
            },
          ] as TableColumnType[])
        : []),
      {
        key: 'conservationCategory',
        name: strings.CONSERVATION_CATEGORY,
        type: 'string',
        tooltipTitle: strings.TOOLTIP_SPECIES_CONSERVATION_CATEGORY,
      },
      {
        key: 'rare',
        name: strings.RARE,
        type: 'boolean',
        tooltipTitle: strings.TOOLTIP_SPECIES_RARE,
      },
      {
        key: 'growthForms',
        name: strings.GROWTH_FORM,
        type: 'string',
        tooltipTitle: strings.TOOLTIP_SPECIES_GROWTH_FORM,
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
  }, [activeLocale, orgHasParticipants]);

  const filterColumns = useMemo<FilterField[]>(
    () =>
      activeLocale
        ? [
            { name: 'growthForms.growthForm', label: strings.GROWTH_FORM, type: 'multiple_selection' },
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

  const featuredFilters: FilterConfig[] = useMemo(() => {
    const _filters: FilterConfig[] = [
      {
        field: 'participantProjectSpecies.project.name',
        label: strings.PROJECT,
        options: (projects || [])?.map((project: Project) => `${project.name}`),
      },
    ];

    return activeLocale && orgHasParticipants ? _filters : [];
  }, [activeLocale, orgHasParticipants, projects]);

  const iconFilters: FilterConfig[] = useMemo(() => {
    const _filters = filterColumns.map((filter) => ({
      field: filter.name,
      label: filter.label,
      options: filterOptions?.[filter.name]?.values || [],
    }));

    return activeLocale ? _filters : [];
  }, [activeLocale, filterColumns, filterOptions]);

  useEffect(() => {
    if (!selectedOrganization) {
      return;
    }
    const getApiSearchResults = async () => {
      const searchParams: SearchRequestPayload = {
        prefix: 'species',
        fields: [
          'growthForms_growthForm',
          'seedStorageBehavior',
          'ecosystemTypes_ecosystemType',
          'conservationCategory',
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
        count: 1000,
      };

      const data = await SearchService.searchValues(searchParams);

      const result = (data || {}) as FieldOptionsMap;

      // remap ecosystemTypes to nested field from flattened field
      if (result.ecosystemTypes_ecosystemType) {
        result['ecosystemTypes.ecosystemType'] = result.ecosystemTypes_ecosystemType;
        delete result.ecosystemTypes_ecosystemType;
      }
      if (result.growthForms_growthForm) {
        result['growthForms.growthForm'] = result.growthForms_growthForm;
        delete result.growthForms_growthForm;
      }

      result.rare = { partial: false, values: [strings.YES, strings.NO] };
      setFilterOptions(result);
    };
    void getApiSearchResults();
  }, [selectedOrganization, results]);

  const [selectedColumns, setSelectedColumns] = useForm(columns);
  const [handleProblemsColumn, setHandleProblemsColumn] = useState<boolean>(false);
  const [hasNewData, setHasNewData] = useState<boolean>(false);
  const [problemsColumn] = useState<TableColumnType>({
    key: 'problems',
    name: (
      <Box component='span' sx={{ marginLeft: '12px' }}>
        <Icon name='warning' style={{ fill: theme.palette.TwClrIcnSecondary }} />
      </Box>
    ),
    type: 'string',
  });
  const userCanEdit = !isContributor(selectedOrganization);
  const { isMobile } = useDeviceInfo();

  const getParams = useCallback(() => {
    if (!selectedOrganization) {
      // Return empty params if no organization is selected
      return {
        prefix: 'species',
        fields: [],
        search: { operation: 'and', children: [] },
        count: 0,
      } as SearchRequestPayload;
    }

    const params: SearchRequestPayload = {
      prefix: 'species',
      fields: [
        ...BE_SORTED_FIELDS,
        'id',
        'createdTime',
        'modifiedTime',
        'rare',
        'growthForms.growthForm',
        'ecosystemTypes.ecosystemType',
        'organization_id',
        'participantProjectSpecies.project.id',
        'participantProjectSpecies.project.name',
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
      const { type, values } = parseSearchTerm(debouncedSearchTerm);
      const searchValueChildren: FieldNodePayload[] = [];
      const nameNode: FieldNodePayload = {
        operation: 'field',
        field: 'scientificName',
        type,
        values,
      };
      searchValueChildren.push(nameNode);

      const commonNameNode: FieldNodePayload = {
        operation: 'field',
        field: 'commonName',
        type,
        values,
      };
      searchValueChildren.push(commonNameNode);

      const familyNode: FieldNodePayload = {
        operation: 'field',
        field: 'familyName',
        type,
        values,
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
    if (filters.seedStorageBehavior) {
      params.search.children.push(filters.seedStorageBehavior);
    }
    if (filters['ecosystemTypes.ecosystemType']) {
      params.search.children.push(filters['ecosystemTypes.ecosystemType']);
    }
    if (filters['growthForms.growthForm']) {
      params.search.children.push(filters['growthForms.growthForm']);
    }
    if (filters['participantProjectSpecies.project.name']) {
      params.search.children.push(filters['participantProjectSpecies.project.name']);
    }

    return params;
  }, [filters, debouncedSearchTerm, selectedOrganization, searchSortOrder]);

  const onApplyFilters = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
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
              participantProjects: (result.participantProjectSpecies as any[])?.map(
                (ppsData) => ppsData.project.name
              ) as string[],
              problems: species.find((sp) => sp.id.toString() === (result.id as string))?.problems,
              scientificName: result.scientificName as string,
              commonName: result.commonName as string,
              familyName: result.familyName as string,
              growthForms: (result.growthForms as any[])?.map(
                (growthFormData) => growthFormData.growthForm
              ) as string[],
              seedStorageBehavior: result.seedStorageBehavior as string,
              ecosystemTypes: (result.ecosystemTypes as any[])?.map((et) => et.ecosystemType) as string[],
              rare: result.rare === strings.BOOLEAN_TRUE ? 'true' : 'false',
              conservationCategory: result.conservationCategory as string,
              createdTime: result.createdTime as string,
              modifiedTime: result.modifiedTime as string,
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
      navigate({ pathname: APP_PATHS.SPECIES, search: query.toString() }, { replace: true });
    }
  }, [query, setCheckDataModalOpen, navigate]);

  useEffect(() => {
    void onApplyFilters();
  }, [onApplyFilters]);

  const onNewSpecies = () => {
    navigate(APP_PATHS.SPECIES_NEW);
  };

  const onChangeSearch = (id: string, value: unknown) => {
    setSearchValue(value as string);
  };

  const downloadReportHandler = async () => {
    const params = getParams();
    params.fields = CSV_FIELDS;
    const apiResponse = await SearchService.searchCsv(params);
    if (apiResponse !== null) {
      downloadCsv('species', apiResponse);
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
    void onApplyFilters(true);
  };

  const reloadDataProblemsHandler = async () => {
    setHasNewData(false);
    // eslint-disable-next-line @typescript-eslint/await-thenable
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

  const onSortChange = (order: SortOrder, orderBy: string) => {
    const isClientSorted = BE_SORTED_FIELDS.indexOf(orderBy) === -1;
    setSearchSortOrder(
      isClientSorted
        ? undefined
        : {
            field: orderBy,
            direction: order === 'asc' ? 'Ascending' : 'Descending',
          }
    );
  };

  const goToEditView = useCallback(
    (speciesSel: SpeciesSearchResultRow) => {
      navigate(APP_PATHS.SPECIES_EDIT.replace(':speciesId', speciesSel.id.toString()));
    },
    [navigate]
  );

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
          <Grid
            item
            xs={12}
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingBottom: theme.spacing(4),
              paddingLeft: theme.spacing(3),
            }}
          >
            <h1
              style={{
                fontSize: '24px',
                lineHeight: '32px',
                fontWeight: 600,
                margin: 0,
              }}
            >
              {strings.SPECIES}
            </h1>
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
          <Grid item xs={12} sx={{ display: 'flex', alignItems: 'center' }}>
            <SearchFiltersWrapperV2
              currentFilters={filters}
              featuredFilters={featuredFilters}
              iconFilters={iconFilters}
              onSearch={(value) => onChangeSearch('search', value)}
              search={searchValue}
              searchPlaceholder={strings.SEARCH_BY_NAME_OR_FAMILY}
              setCurrentFilters={setFilters}
              rightComponent={
                <>
                  <Tooltip title={strings.EXPORT}>
                    <Button
                      id='downloadSpeciesReport'
                      // eslint-disable-next-line @typescript-eslint/no-misused-promises
                      onClick={() => downloadReportHandler()}
                      type='passive'
                      priority='ghost'
                      icon='iconExport'
                    />
                  </Tooltip>
                  <TableSettingsButton />
                </>
              }
            />
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
                  // eslint-disable-next-line @typescript-eslint/no-misused-promises
                  reloadData={reloadDataProblemsHandler}
                  sortHandler={onSortChange}
                  isPresorted={!!searchSortOrder}
                  onSelect={goToEditView}
                />
              )}
            </Grid>
          ) : (
            <EmptyMessage
              title={strings.ADD_A_SPECIES}
              text={strings.SPECIES_EMPTY_MSG_BODY}
              buttonText={strings.ADD_SPECIES}
              onClick={onNewSpecies}
              sx={{
                margin: '0 auto',
                width: '50%',
                marginTop: '10%',
              }}
            />
          )}
        </Grid>
      </Card>
    </TfMain>
  );
}
