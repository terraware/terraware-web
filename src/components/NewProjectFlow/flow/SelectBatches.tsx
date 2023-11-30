import React, { useState } from 'react';
import { Container, Grid, Typography, useTheme } from '@mui/material';
import PageForm from 'src/components/common/PageForm';
import { useDeviceInfo } from '@terraware/web-components/utils';
import strings from 'src/strings';
import { TableColumnType } from '@terraware/web-components';
import Table from 'src/components/common/table';
import { CreateProjectRequest } from 'src/types/Project';
import { Batch } from 'src/types/Batch';

type SelectBatchesProps = {
  onNext: (bastchesId: number[]) => void;
  project: CreateProjectRequest;
  onCancel: () => void;
  saveText: string;
  batches: Batch[];
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

export default function SelectBatches(props: SelectBatchesProps): JSX.Element {
  const { onNext, onCancel, saveText, project, batches } = props;
  const theme = useTheme();
  const { isMobile } = useDeviceInfo();
  const [selectedRows, setSelectedRows] = useState<any[]>([]);

  const onNextHandler = () => {
    onNext(selectedRows.map((sr) => sr.id));
  };

  return (
    <PageForm
      cancelID='cancelSelectBatches'
      saveID='saveSelectBatches'
      onCancel={onCancel}
      onSave={onNextHandler}
      saveButtonText={saveText}
    >
      <Container
        maxWidth={false}
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
            id={'selectAccessionsTable'}
            orderBy={'accessioNumber'}
            showCheckbox={true}
          />
        </Grid>
      </Container>
    </PageForm>
  );
}
