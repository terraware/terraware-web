import React, { useEffect, useState } from 'react';
import { Box, Container, Grid, Typography, useTheme } from '@mui/material';
import { useDeviceInfo } from '@terraware/web-components/utils';
import { FormButton, Message, TableColumnType } from '@terraware/web-components';
import PageForm from 'src/components/common/PageForm';
import strings from 'src/strings';
import Table from 'src/components/common/table';
import { CreateProjectRequest } from 'src/types/Project';
import { PlantingSiteSearchResult } from 'src/types/Tracking';
import { TrackingService } from 'src/services';
import { FlowStates } from '../index';

type SelectPlantingSitesProps = {
  project: CreateProjectRequest;
  organizationId: number;
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
    organizationId,
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

  const [plantingSites, setPlantingSites] = useState<PlantingSiteSearchResult[]>([]);
  const [selectedRows, setSelectedRows] = useState<PlantingSiteSearchResult[]>([]);
  const [showAssignmentWarning, setShowAssignmentWarning] = useState<boolean>(false);

  useEffect(() => {
    const populate = async () => {
      const searchResponse = await TrackingService.searchPlantingSites(organizationId);
      if (searchResponse && searchResponse.length > 0) {
        setPlantingSites(searchResponse);
        if (searchResponse.find((element) => !!element.project_name)) {
          setShowAssignmentWarning(true);
        }
      } else {
        setHasPlantingSites(false);
      }
    };

    void populate();
  }, [setHasPlantingSites, organizationId]);

  useEffect(() => {
    setProjectPlantingSites(selectedRows);
  }, [setProjectPlantingSites, selectedRows]);

  useEffect(() => {
    if (flowState === 'plantingSites' && plantingSites.length === 0) {
      onNext();
    }
  }, [plantingSites, flowState, onNext]);

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
            body={strings.EXISTING_PROJECT_PLANTING_SITES_BODY.replace('{projectName}', project.name)}
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
            <Table
              columns={columns}
              rows={plantingSites}
              selectedRows={selectedRows}
              setSelectedRows={setSelectedRows}
              id={'selectPlantingSitesTable'}
              orderBy={'name'}
              showCheckbox={true}
            />
          </Grid>
        </Container>
      </PageForm>
    </>
  );
}
