import React, { useCallback, useMemo } from 'react';
import { Box, Container, Grid, Typography, useTheme } from '@mui/material';
import { useDeviceInfo } from '@terraware/web-components/utils';
import { FormButton, Message, TableColumnType } from '@terraware/web-components';
import PageForm from 'src/components/common/PageForm';
import strings from 'src/strings';
import Table from 'src/components/common/table';
import { CreateProjectRequest } from 'src/types/Project';
import { SeedBankService } from 'src/services';
import {
  FieldNodePayload,
  SearchCriteria,
  SearchNodePayload,
  SearchResponseElement,
  SearchSortOrder,
} from 'src/types/Search';
import { ACCESSION_2_STATES, AccessionState } from 'src/types/Accession';
import { FlowStates } from 'src/components/ProjectNewView';
import {
  ProjectEntityFilters,
  useProjectEntitySelection,
} from 'src/components/ProjectNewView/flow/useProjectEntitySelection';
import ProjectEntitySearch, {
  PillListItemWithEmptyValue,
} from 'src/components/ProjectNewView/flow/ProjectEntitySearch';
import { EntitySpecificFilterConfig } from 'src/components/ProjectNewView/flow/ProjectEntityFilter';
import { stateName } from 'src/types/Accession';
import { useLocalization } from 'src/providers';

type SelectAccessionsProps = {
  project: CreateProjectRequest;
  flowState: FlowStates;
  onNext: () => void;
  onCancel: () => void;
  saveText: string;
  pageFormRightButtons: FormButton[];
  setProjectAccessions: (accessions: SearchResponseAccession[]) => void;
  setHasAccessions: (value: boolean) => void;
};

const columns = (): TableColumnType[] => [
  {
    key: 'accessionNumber',
    name: strings.ACCESSION,
    type: 'string',
  },
  {
    key: 'speciesName',
    name: strings.SPECIES,
    type: 'string',
  },
  {
    key: 'project_name',
    name: strings.PROJECT,
    type: 'string',
  },
  {
    key: 'state',
    name: strings.STATUS,
    type: 'string',
  },
  { key: 'collectedDate', name: strings.COLLECTION_DATE, type: 'string' },
  { key: 'collectionSiteName', name: strings.COLLECTION_SITE, type: 'string' },
];

const SEARCH_FIELDS_ACCESSIONS: (keyof SearchResponseAccession)[] = [
  'accessionNumber',
  'speciesName',
  'collectedDate',
  'receivedDate',
  'state',
  'id',
  'collectionSiteName',
  'project_name',
];

export interface SearchResponseAccession extends SearchResponseElement {
  accessionNumber: string;
  speciesName: string;
  collectedDate: string;
  receivedDate: string;
  state: AccessionState;
  id: string;
  collectionSiteName?: string;
  project_name?: string;
}

export default function SelectAccessions(props: SelectAccessionsProps): JSX.Element | null {
  const {
    project,
    flowState,
    onNext,
    onCancel,
    saveText,
    pageFormRightButtons,
    setProjectAccessions,
    setHasAccessions,
  } = props;

  const theme = useTheme();
  const { isMobile } = useDeviceInfo();
  const { activeLocale } = useLocalization();

  const getSearchResults = useCallback(
    (
      organizationId: number,
      searchFields: SearchNodePayload[],
      searchSortOrder?: SearchSortOrder,
      searchFilters?: ProjectEntityFilters
    ) => {
      const searchCriteria: SearchCriteria = searchFields.reduce(
        (acc, curr) => ({
          ...acc,
          [curr.field]: curr,
        }),
        {} as SearchCriteria
      );

      const searchStatuses = searchFilters?.statuses || [];
      if (searchStatuses.length > 0) {
        searchCriteria.state = {
          field: 'state',
          operation: 'field',
          type: 'Exact',
          values: searchStatuses,
        };
      }

      const searchProjectIds = searchFilters?.projectIds || [];
      if (searchProjectIds.length > 0) {
        searchCriteria.project_id = {
          field: 'project_id',
          operation: 'field',
          type: 'Exact',
          values: searchProjectIds.map((id: number) => `${id}`),
        };
      }

      return SeedBankService.searchAccessions<SearchResponseAccession>({
        organizationId,
        fields: SEARCH_FIELDS_ACCESSIONS as string[],
        searchCriteria,
        sortOrder: searchSortOrder,
      });
    },
    []
  );

  const getSearchFields = useCallback(
    (debouncedSearchTerm: string): FieldNodePayload[] => [
      {
        operation: 'field',
        field: 'accessionNumber',
        type: 'Fuzzy',
        values: [debouncedSearchTerm],
      },
    ],
    []
  );

  const {
    entities,
    selectedRows,
    setSelectedRows,
    showAssignmentWarning,
    temporalSearchValue,
    setTemporalSearchValue,
    filters,
    setFilters,
  } = useProjectEntitySelection<SearchResponseAccession>({
    currentFlowState: flowState,
    thisFlowState: 'accessions',
    setHasEntities: setHasAccessions,
    setProjectEntities: setProjectAccessions,
    onNext,
    getSearchResults,
    getSearchFields,
  });

  const entitySpecificFilterConfigs: EntitySpecificFilterConfig[] = useMemo(
    () => [
      {
        label: strings.STATUS,
        initialSelection: filters.statuses || [],
        filterKey: 'statuses',
        options: ACCESSION_2_STATES,
        renderOption: (value: string | number) => stateName(`${value}` as AccessionState),
        pillModifier: (): PillListItemWithEmptyValue[] => {
          const statuses: AccessionState[] = filters.statuses || [];
          if (statuses.length === 0) {
            return [];
          }

          return activeLocale
            ? [
                {
                  id: 'statuses',
                  label: strings.STATUS,
                  value: statuses.join(','),
                  emptyValue: [],
                },
              ]
            : [];
        },
      },
    ],
    [filters, activeLocale]
  );

  if (flowState !== 'accessions') {
    return null;
  }

  return (
    <>
      {showAssignmentWarning && (
        <Box sx={{ marginTop: 5, marginBottom: 1 }}>
          <Message
            type='page'
            title={strings.EXISTING_PROJECT_ACCESSIONS_TITLE}
            priority={'info'}
            body={strings.formatString(strings.EXISTING_PROJECT_ACCESSIONS_BODY, project.name)}
          />
        </Box>
      )}

      <PageForm
        cancelID='cancelSelectAccessions'
        saveID='saveSelectAccessions'
        onCancel={onCancel}
        onSave={onNext}
        saveButtonText={saveText}
        additionalRightButtons={pageFormRightButtons}
      >
        <Container
          maxWidth={false}
          disableGutters
          sx={{
            paddingBottom: isMobile ? '185px' : '105px',
            minWidth: 'fit-content',
          }}
        >
          <Grid
            container
            minWidth={isMobile ? 0 : 700}
            sx={{
              backgroundColor: theme.palette.TwClrBg,
              borderRadius: theme.spacing(4),
              padding: theme.spacing(3),
              marginTop: theme.spacing(4),
            }}
          >
            <Grid item xs={12}>
              <Typography sx={{ fontSize: '20px', fontWeight: 600 }}>
                {strings.formatString(strings.SELECT_ACCESSIONS_FOR_PROJECT, project.name)}
              </Typography>
              <Typography sx={{ fontSize: '14px', fontWeight: 400 }}>
                {strings.formatString(strings.SELECT_ACCESSIONS_FOR_PROJECT_DESCRIPTION, project.name)}
              </Typography>
            </Grid>

            <Grid item xs={12}>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'flex-start',
                  alignItems: 'center',
                  marginBottom: theme.spacing(2),
                }}
              >
                <ProjectEntitySearch
                  searchValue={temporalSearchValue || ''}
                  onSearch={(value: string) => setTemporalSearchValue(value)}
                  entitySpecificFilterConfigs={entitySpecificFilterConfigs}
                  filters={filters}
                  setFilters={setFilters}
                />
              </Box>
            </Grid>

            <Grid item xs={12}>
              <Box marginTop={theme.spacing(2)}>
                <Table
                  columns={columns}
                  rows={entities}
                  selectedRows={selectedRows}
                  setSelectedRows={setSelectedRows}
                  id='selectAccessionsTable'
                  orderBy='accessionNumber'
                  showCheckbox={true}
                />
              </Box>
            </Grid>
          </Grid>
        </Container>
      </PageForm>
    </>
  );
}
