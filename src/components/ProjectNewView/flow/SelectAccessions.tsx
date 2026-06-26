import React, { type JSX, useCallback, useMemo } from 'react';

import { Box, Container, Grid, Typography, useTheme } from '@mui/material';
import { FormButton, Message, TableColumnType } from '@terraware/web-components';
import { RendererProps } from '@terraware/web-components/components/table/types';
import { useDeviceInfo } from '@terraware/web-components/utils';

import { FlowStates } from 'src/components/ProjectNewView';
import { EntitySpecificFilterConfig } from 'src/components/ProjectNewView/flow/ProjectEntityFilter';
import ProjectEntitySearch, {
  PillListItemWithEmptyValue,
} from 'src/components/ProjectNewView/flow/ProjectEntitySearch';
import {
  ProjectEntityFilters,
  useProjectEntitySelection,
} from 'src/components/ProjectNewView/flow/useProjectEntitySelection';
import Card from 'src/components/common/Card';
import PageForm from 'src/components/common/PageForm';
import Table from 'src/components/common/table';
import CellRenderer from 'src/components/common/table/TableCellRenderer';
import { useLocalization, useOrganization } from 'src/providers';
import { useLazySearchAccessionsQuery } from 'src/queries/search/accessions';
import strings from 'src/strings';
import { ACCESSION_2_STATES, AccessionState } from 'src/types/Accession';
import { stateName } from 'src/types/Accession';
import { CreateProjectRequest } from 'src/types/Project';
import { SearchCriteria, SearchNodePayload, SearchResponseElement, SearchSortOrder } from 'src/types/Search';
import { getDateTimeDisplayValue } from 'src/utils/dateFormatter';
import { getAllSeedBanks } from 'src/utils/organization';
import { useLocationTimeZone } from 'src/utils/useTimeZoneUtils';

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
  { key: 'collectedTime', name: strings.COLLECTION_TIME, type: 'string' },
  { key: 'collectionSiteName', name: strings.COLLECTION_SITE, type: 'string' },
];

const SEARCH_FIELDS_ACCESSIONS: (keyof SearchResponseAccession)[] = [
  'accessionNumber',
  'speciesName',
  'collectedTime',
  'receivedDate',
  'state',
  'id',
  'collectionSiteName',
  'project_name',
  'facility_name',
];

export interface SearchResponseAccession extends SearchResponseElement {
  accessionNumber: string;
  speciesName: string;
  collectedTime: string;
  receivedDate: string;
  state: AccessionState;
  id: string;
  collectionSiteName?: string;
  project_name?: string;
  facility_name?: string;
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
  const { selectedOrganization } = useOrganization();
  const locationTimeZone = useLocationTimeZone();
  const facilityNameToTz = useMemo(
    () =>
      Object.fromEntries(
        (selectedOrganization ? getAllSeedBanks(selectedOrganization) : []).map((sb) => [sb.name, locationTimeZone.get(sb).id])
      ),
    [selectedOrganization, locationTimeZone]
  );
  const [searchAccessions] = useLazySearchAccessionsQuery();

  const getSearchResults = useCallback(
    async (
      organizationId: number,
      searchFields: SearchNodePayload[],
      searchSortOrder?: SearchSortOrder,
      searchFilters?: ProjectEntityFilters
    ) => {
      const searchCriteria: SearchCriteria = searchFields.reduce(
        (acc, curr) => ({
          ...acc,
          [curr.operation]: curr,
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
          values: searchProjectIds.map((id: number | null) => (id === null ? id : `${id}`)),
        };
      }

      try {
        const data = await searchAccessions({
          organizationId,
          fields: SEARCH_FIELDS_ACCESSIONS as string[],
          searchCriteria,
          sortOrder: searchSortOrder,
        }).unwrap();
        return data as SearchResponseAccession[];
      } catch {
        return null;
      }
    },
    [searchAccessions]
  );

  const getSearchFields = useCallback(
    (debouncedSearchTerm: string): SearchNodePayload[] => [
      {
        operation: 'or',
        children: ['accessionNumber', 'speciesName'].map((field: string) => ({
          operation: 'field',
          field,
          type: 'Fuzzy',
          values: [debouncedSearchTerm],
        })),
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

  const renderer = useCallback(
    (rendererProps: RendererProps<SearchResponseAccession>) => {
      if (rendererProps.column.key === 'collectedTime' && rendererProps.value) {
        const ms = new Date(rendererProps.value as string).getTime();
        const tz = rendererProps.row.facility_name ? facilityNameToTz[rendererProps.row.facility_name] : undefined;
        return <span>{getDateTimeDisplayValue(ms, tz)}</span>;
      }
      return CellRenderer(rendererProps);
    },
    [facilityNameToTz]
  );

  const entitySpecificFilterConfigs: EntitySpecificFilterConfig[] = useMemo(
    () => [
      {
        label: strings.STATUS,
        initialSelection: filters.statuses || [],
        filterKey: 'statuses',
        options: ACCESSION_2_STATES,
        renderOption: (value: string | number | null) => stateName(`${value}` as AccessionState),
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
            marginTop: theme.spacing(4),
          }}
        >
          <Card flushMobile>
            <Grid
              container
              sx={{
                backgroundColor: theme.palette.TwClrBg,
              }}
            >
              <Grid item xs={12}>
                <Typography sx={{ fontSize: '20px', fontWeight: 600 }}>
                  {strings.formatString(strings.SELECT_ACCESSIONS_FOR_PROJECT, project.name)}
                </Typography>
                <Typography sx={{ fontSize: '14px', fontWeight: 400, marginBottom: '32px' }}>
                  {strings.formatString(strings.SELECT_ACCESSIONS_FOR_PROJECT_DESCRIPTION, project.name)}
                </Typography>
              </Grid>

              <Grid item xs={12}>
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'flex-start',
                    alignItems: 'center',
                    marginBottom: theme.spacing(0),
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
                <Box marginTop={theme.spacing(0)}>
                  <Table
                    columns={columns}
                    rows={entities}
                    selectedRows={selectedRows}
                    setSelectedRows={setSelectedRows}
                    id='selectAccessionsTable'
                    orderBy='accessionNumber'
                    showCheckbox={true}
                    showTopBar={true}
                    Renderer={renderer}
                  />
                </Box>
              </Grid>
            </Grid>
          </Card>
        </Container>
      </PageForm>
    </>
  );
}
