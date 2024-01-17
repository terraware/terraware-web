import React, { useCallback } from 'react';
import { Box, Container, Grid, Typography, useTheme } from '@mui/material';
import { useDeviceInfo } from '@terraware/web-components/utils';
import { FormButton, Message, TableColumnType } from '@terraware/web-components';
import PageForm from 'src/components/common/PageForm';
import strings from 'src/strings';
import Table from 'src/components/common/table';
import { CreateProjectRequest } from 'src/types/Project';
import { PlantingSiteSearchResult } from 'src/types/Tracking';
import { TrackingService } from 'src/services';
import { FieldNodePayload, SearchNodePayload, SearchSortOrder } from 'src/types/Search';
import { FlowStates } from 'src/components/ProjectNewView';
import {
  ProjectEntityFilters,
  useProjectEntitySelection,
} from 'src/components/ProjectNewView/flow/useProjectEntitySelection';
import ProjectEntitySearch from 'src/components/ProjectNewView/flow/ProjectEntitySearch';

type SelectPlantingSitesProps = {
  project: CreateProjectRequest;
  flowState: FlowStates;
  onNext: () => void;
  onCancel: () => void;
  saveText: string;
  pageFormRightButtons: FormButton[];
  setProjectPlantingSites: (plantingSites: PlantingSiteSearchResult[]) => void;
  setHasPlantingSites: (value: boolean) => void;
};

const columns = (): TableColumnType[] => [
  {
    key: 'name',
    name: strings.NAME,
    type: 'string',
  },
  {
    key: 'project_name',
    name: strings.PROJECT,
    type: 'string',
  },
  {
    key: 'numPlantingZones',
    name: strings.PLANTING_ZONES,
    type: 'string',
  },
  {
    key: 'numPlantingSubzones',
    name: strings.SUBZONES,
    type: 'string',
  },
];

export default function SelectPlantingSites(props: SelectPlantingSitesProps): JSX.Element | null {
  const {
    project,
    flowState,
    onNext,
    onCancel,
    saveText,
    pageFormRightButtons,
    setProjectPlantingSites,
    setHasPlantingSites,
  } = props;

  const theme = useTheme();
  const { isMobile } = useDeviceInfo();

  const getSearchResults = useCallback(
    (
      organizationId: number,
      searchFields: SearchNodePayload[],
      searchSortOrder?: SearchSortOrder,
      searchFilters?: ProjectEntityFilters
    ) => {
      const fields = [...searchFields];
      const projectIds = searchFilters?.projectIds || [];

      if (projectIds.length > 0) {
        fields.push({
          field: 'project_id',
          operation: 'field',
          type: 'Exact',
          values: projectIds.map((projectId: number) => `${projectId}`),
        });
      }

      return TrackingService.searchPlantingSites(organizationId, fields, searchSortOrder);
    },
    []
  );

  const getSearchFields = useCallback(
    (debouncedSearchTerm: string): FieldNodePayload[] => [
      {
        operation: 'field',
        field: 'name',
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
  } = useProjectEntitySelection<PlantingSiteSearchResult>({
    currentFlowState: flowState,
    thisFlowState: 'plantingSites',
    setHasEntities: setHasPlantingSites,
    setProjectEntities: setProjectPlantingSites,
    onNext,
    getSearchResults,
    getSearchFields,
  });

  if (flowState !== 'plantingSites') {
    return null;
  }

  return (
    <>
      {showAssignmentWarning && (
        <Box sx={{ marginTop: 5, marginBottom: 1 }}>
          <Message
            type='page'
            title={strings.EXISTING_PROJECT_PLANTING_SITES_TITLE}
            priority={'info'}
            body={strings.formatString(strings.EXISTING_PROJECT_PLANTING_SITES_BODY, project.name)}
          />
        </Box>
      )}

      <PageForm
        cancelID='cancelSelectPlantingSites'
        saveID='saveSelectPlantingSites'
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
                {strings.formatString(strings.SELECT_PLANTING_SITES_FOR_PROJECT, project.name)}
              </Typography>
              <Typography sx={{ fontSize: '14px', fontWeight: 400 }}>
                {strings.formatString(strings.SELECT_PLANTING_SITES_FOR_PROJECT_DESCRIPTION, project.name)}
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
                  entitySpecificFilterConfigs={[]}
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
                id='selectPlantingSitesTable'
                orderBy='name'
                showCheckbox={true}
                showTopBar={true}
              />
            </Grid>
          </Grid>
        </Container>
      </PageForm>
    </>
  );
}
