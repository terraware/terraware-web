import React, { useEffect, useState } from 'react';
import { Box, Container, Grid, Typography, useTheme } from '@mui/material';
import { useDeviceInfo } from '@terraware/web-components/utils';
import { FormButton, Message, TableColumnType } from '@terraware/web-components';
import PageForm from 'src/components/common/PageForm';
import strings from 'src/strings';
import Table from 'src/components/common/table';
import { CreateProjectRequest } from 'src/types/Project';
import { NurseryBatchService } from 'src/services';
import { SearchResponseBatches } from 'src/services/NurseryBatchService';
import { FlowStates } from '../index';

type SelectBatchesProps = {
  project: CreateProjectRequest;
  organizationId: number;
  flowState: FlowStates;
  onNext: () => void;
  onCancel: () => void;
  saveText: string;
  pageFormRightButtons: FormButton[];
  setProjectBatches: (batches: SearchResponseBatches[]) => void;
  setHasBatches: (value: boolean) => void;
};

const columns = (): TableColumnType[] => [
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
    name: strings.GERMINATING,
    type: 'string',
  },
  {
    key: 'notReadyQuantity',
    name: strings.NOT_READY,
    type: 'string',
  },
  {
    key: 'readyQuantity',
    name: strings.READY,
    type: 'string',
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
];

export default function SelectBatches(props: SelectBatchesProps): JSX.Element | null {
  const {
    project,
    organizationId,
    flowState,
    onNext,
    onCancel,
    saveText,
    pageFormRightButtons,
    setProjectBatches,
    setHasBatches,
  } = props;

  const theme = useTheme();
  const { isMobile } = useDeviceInfo();

  const [batches, setBatches] = useState<SearchResponseBatches[]>([]);
  const [selectedRows, setSelectedRows] = useState<SearchResponseBatches[]>([]);
  const [showAssignmentWarning, setShowAssignmentWarning] = useState<boolean>(false);

  useEffect(() => {
    const populate = async () => {
      const searchResponse = await NurseryBatchService.getAllBatches(organizationId);
      if (searchResponse && searchResponse.length > 0) {
        setBatches(searchResponse);
        if (searchResponse.find((element) => !!element.project_name)) {
          setShowAssignmentWarning(true);
        }
      } else {
        setHasBatches(false);
      }
    };

    void populate();
  }, [setHasBatches, organizationId]);

  useEffect(() => {
    setProjectBatches(selectedRows);
  }, [setProjectBatches, selectedRows]);

  useEffect(() => {
    if (flowState === 'batches' && batches.length === 0) {
      onNext();
    }
  }, [batches, flowState, onNext]);

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
            body={strings.EXISTING_PROJECT_BATCHES_BODY.replace('{projectName}', project.name)}
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
                {strings.formatString(strings.SELECT_SEEDLINGS_BATCHES_FOR_PROJECT, project.name)}
              </Typography>
              <Typography sx={{ fontSize: '14px', fontWeight: 400 }}>
                {strings.formatString(strings.SELECT_SEEDLINGS_BATCHES_FOR_PROJECT_DESCRIPTION, project.name)}
              </Typography>
            </Grid>
            <Table
              columns={columns}
              rows={batches}
              selectedRows={selectedRows}
              setSelectedRows={setSelectedRows}
              id={'selectBatchesTable'}
              orderBy={'batchNumber'}
              showCheckbox={true}
            />
          </Grid>
        </Container>
      </PageForm>
    </>
  );
}
