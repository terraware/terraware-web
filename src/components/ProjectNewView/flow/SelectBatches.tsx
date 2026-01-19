import React, { type JSX, useCallback, useMemo } from 'react';

import { Box, Container, Grid, Typography, useTheme } from '@mui/material';
import { FormButton, Message, TableColumnType } from '@terraware/web-components';
import { useDeviceInfo } from '@terraware/web-components/utils';

import { FlowStates } from 'src/components/ProjectNewView';
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
import { useLocalization, useOrganization } from 'src/providers';
import { NurseryBatchService } from 'src/services';
import { SearchResponseBatches } from 'src/services/NurseryBatchService';
import { CreateProjectRequest } from 'src/types/Project';
import { FieldNodePayload, SearchNodePayload, SearchSortOrder } from 'src/types/Search';
import { getAllNurseries } from 'src/utils/organization';
import { parseSearchTerm } from 'src/utils/search';

import { EntitySpecificFilterConfig } from './ProjectEntityFilter';

type SelectBatchesProps = {
  project: CreateProjectRequest;
  flowState: FlowStates;
  onNext: () => void;
  onCancel: () => void;
  saveText: string;
  pageFormRightButtons: FormButton[];
  setProjectBatches: (batches: SearchResponseBatches[]) => void;
  setHasBatches: (value: boolean) => void;
};

export default function SelectBatches(props: SelectBatchesProps): JSX.Element | null {
  const { project, flowState, onNext, onCancel, saveText, pageFormRightButtons, setProjectBatches, setHasBatches } =
    props;

  const { strings } = useLocalization();
  const { selectedOrganization } = useOrganization();
  const theme = useTheme();
  const { isMobile } = useDeviceInfo();

  const columns = useMemo(
    (): TableColumnType[] => [
      {
        key: 'batchNumber',
        name: strings.SEEDLING_BATCH,
        type: 'string',
      },
      {
        key: 'project_name',
        name: strings.PROJECT,
        type: 'string',
      },
      {
        key: 'germinatingQuantity',
        name: strings.GERMINATION_ESTABLISHMENT,
        type: 'string' as const,
      },
      {
        key: 'activeGrowthQuantity',
        name: strings.ACTIVE_GROWTH,
        type: 'string' as const,
      },
      {
        key: 'hardeningOffQuantity',
        name: strings.HARDENING_OFF,
        type: 'number' as const,
      },
      {
        key: 'readyQuantity',
        name: strings.READY_TO_PLANT,
        type: 'string' as const,
      },
      {
        key: 'totalQuantity',
        name: strings.TOTAL,
        type: 'string',
      },
      {
        key: 'facility_name',
        name: strings.NURSERY,
        type: 'string',
      },
      {
        key: 'readyByDate',
        name: strings.ESTIMATED_READY_DATE,
        type: 'string',
      },
      { key: 'addedDate', name: strings.DATE_ADDED, type: 'string' },
    ],
    [strings]
  );

  const nurseries = useMemo(
    () => (selectedOrganization ? getAllNurseries(selectedOrganization) : []),
    [selectedOrganization]
  );

  const getSearchResults = useCallback(
    (
      organizationId: number,
      searchFields: SearchNodePayload[],
      searchSortOrder?: SearchSortOrder,
      searchFilters?: ProjectEntityFilters
    ) => {
      let facilityIds;
      const query = undefined;
      const fields = [...searchFields];

      const nurseryIds = searchFilters?.nurseryIds || [];
      if (nurseryIds.length > 0) {
        facilityIds = nurseryIds;
      }

      const projectIds = searchFilters?.projectIds || [];
      if (projectIds.length > 0) {
        fields.push({
          field: 'project_id',
          operation: 'field',
          type: 'Exact',
          values: projectIds.map((id: number | null) => (id === null ? id : `${id}`)),
        });
      }

      return NurseryBatchService.getAllBatches(
        organizationId,
        searchSortOrder,
        facilityIds,
        undefined,
        query,
        false,
        fields
      );
    },
    []
  );

  const getSearchFields = useCallback((debouncedSearchTerm: string): FieldNodePayload[] => {
    const { type, values } = parseSearchTerm(debouncedSearchTerm);
    return [
      {
        operation: 'field',
        field: 'batchNumber',
        type,
        values,
      },
    ];
  }, []);

  const {
    entities,
    selectedRows,
    setSelectedRows,
    showAssignmentWarning,
    temporalSearchValue,
    setTemporalSearchValue,
    filters,
    setFilters,
  } = useProjectEntitySelection<SearchResponseBatches>({
    currentFlowState: flowState,
    thisFlowState: 'batches',
    setHasEntities: setHasBatches,
    setProjectEntities: setProjectBatches,
    onNext,
    getSearchResults,
    getSearchFields,
  });

  const entitySpecificFilterConfigs: EntitySpecificFilterConfig[] = useMemo(
    () => [
      {
        label: strings.NURSERY,
        initialSelection: filters.nurseryIds || [],
        filterKey: 'nurseryIds',
        options: nurseries.map((nursery) => nursery.id),
        renderOption: (nurseryId: string | number | null) =>
          nurseries.find((nursery) => nursery.id === nurseryId)?.name || '',
        pillModifier: (): PillListItemWithEmptyValue[] => {
          const nurseryIds = filters.nurseryIds || [];
          if (nurseryIds.length === 0) {
            return [];
          }

          return [
            {
              id: 'nurseryIds',
              label: strings.NURSERY,
              value: (filters.nurseryIds || [])
                .map((nurseryId: number) => nurseries.find((nursery) => nursery.id === nurseryId))
                .map((nursery) => nursery?.name)
                .join(','),
              emptyValue: [],
            },
          ];
        },
      },
    ],
    [filters, nurseries, strings]
  );

  if (flowState !== 'batches') {
    return null;
  }

  return (
    <>
      {showAssignmentWarning && (
        <Box sx={{ marginTop: 5, marginBottom: 1 }}>
          <Message
            type='page'
            title={strings.EXISTING_PROJECT_BATCHES_TITLE}
            priority={'info'}
            body={strings.formatString(strings.EXISTING_PROJECT_BATCHES_BODY, project.name)}
          />
        </Box>
      )}
      <PageForm
        cancelID='cancelSelectBatches'
        saveID='saveSelectBatches'
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
                  {strings.formatString(strings.SELECT_SEEDLINGS_BATCHES_FOR_PROJECT, project.name)}
                </Typography>
                <Typography sx={{ fontSize: '14px', fontWeight: 400, marginBottom: '24px' }}>
                  {strings.formatString(strings.SELECT_SEEDLINGS_BATCHES_FOR_PROJECT_DESCRIPTION, project.name)}
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
                    onSearch={setTemporalSearchValue}
                    entitySpecificFilterConfigs={entitySpecificFilterConfigs}
                    filters={filters}
                    setFilters={setFilters}
                  />
                </Box>
              </Grid>

              <Grid item xs={12}>
                <Table
                  columns={columns}
                  rows={entities}
                  selectedRows={selectedRows}
                  setSelectedRows={setSelectedRows}
                  id='selectBatchesTable'
                  orderBy='batchNumber'
                  showCheckbox={true}
                  showTopBar={true}
                />
              </Grid>
            </Grid>
          </Card>
        </Container>
      </PageForm>
    </>
  );
}
