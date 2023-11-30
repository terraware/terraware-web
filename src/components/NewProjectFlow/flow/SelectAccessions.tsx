import React, { useState } from 'react';
import { Container, Grid, Typography, useTheme } from '@mui/material';
import PageForm from 'src/components/common/PageForm';
import { useDeviceInfo } from '@terraware/web-components/utils';
import strings from 'src/strings';
import { TableColumnType } from '@terraware/web-components';
import Table from 'src/components/common/table';
import { CreateProjectRequest } from 'src/types/Project';
import { Accession } from 'src/types/Accession';

type SelectAccessionsProps = {
  onNext: (accessionsId: number[]) => void;
  project: CreateProjectRequest;
  onCancel: () => void;
  saveText: string;
  accessions: Accession[];
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

export default function SelectAccessions(props: SelectAccessionsProps): JSX.Element {
  const { onNext, onCancel, saveText, project, accessions } = props;
  const theme = useTheme();
  const { isMobile } = useDeviceInfo();
  const [selectedRows, setSelectedRows] = useState<any[]>([]);

  const onNextHandler = () => {
    onNext(selectedRows.map((sr) => sr.id));
  };

  return (
    <PageForm
      cancelID='cancelSelectAccessions'
      saveID='saveSelectAccessions'
      onCancel={onCancel}
      onSave={onNextHandler}
      saveButtonText={saveText}
    >
      <Container
        maxWidth={false}
        sx={{
          paddingBottom: isMobile ? '185px' : '105px',
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
          <Table
            columns={columns}
            rows={accessions}
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
