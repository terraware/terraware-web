import React, { useState } from 'react';
import { Container, Grid, Typography, useTheme } from '@mui/material';
import PageForm from 'src/components/common/PageForm';
import { useDeviceInfo } from '@terraware/web-components/utils';
import strings from 'src/strings';
import { TableColumnType } from '@terraware/web-components';
import Table from 'src/components/common/table';
import { CreateProjectRequest } from 'src/types/Project';
import { PlantingSite } from 'src/types/Tracking';

type SelectPlantingSitesProps = {
  onNext: (bastchesId: number[]) => void;
  project: CreateProjectRequest;
  onCancel: () => void;
  saveText: string;
  plantingSites: PlantingSite[];
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

export default function SelectPlantingSites(props: SelectPlantingSitesProps): JSX.Element {
  const { onNext, onCancel, saveText, project, plantingSites } = props;
  const theme = useTheme();
  const { isMobile } = useDeviceInfo();
  const [selectedRows, setSelectedRows] = useState<any[]>([]);

  const onNextHandler = () => {
    onNext(selectedRows.map((sr) => sr.id));
  };

  return (
    <PageForm
      cancelID='cancelSelectPlantingSites'
      saveID='saveSelectPlantingSites'
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
            id={'selectAccessionsTable'}
            orderBy={'accessioNumber'}
            showCheckbox={true}
          />
        </Grid>
      </Container>
    </PageForm>
  );
}
