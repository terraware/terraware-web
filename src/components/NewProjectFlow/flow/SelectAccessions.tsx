import React, { useCallback, useEffect, useState } from 'react';
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
import { AccessionState } from 'src/types/Accession';
import { FlowStates } from '../index';
import { useProjectEntitySelection } from './useProjectEntitySelection';
import Search from './Search';

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

  const getSearchResults = useCallback(
    (organizationId: number, searchFields: SearchNodePayload[], searchSortOrder?: SearchSortOrder) => {
      const searchCriteria: SearchCriteria = searchFields.reduce(
        (acc, curr) => ({
          ...acc,
          [curr.field]: curr,
        }),
        {} as SearchCriteria
      );

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
                <Search
                  searchValue={temporalSearchValue || ''}
                  onSearch={(val) => setTemporalSearchValue(val)}
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
                  id={'selectAccessionsTable'}
                  orderBy={'accessionNumber'}
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
