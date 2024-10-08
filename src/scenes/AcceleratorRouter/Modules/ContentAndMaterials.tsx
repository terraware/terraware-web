import React from 'react';

import { Box, Grid, Typography, useTheme } from '@mui/material';
import { TableColumnType } from '@terraware/web-components';

import Card from 'src/components/common/Card';
import Table from 'src/components/common/table';
import strings from 'src/strings';
import { ListDeliverablesElementWithOverdue } from 'src/types/Deliverables';
import { Module } from 'src/types/Module';

interface contentAndMaterialsProps {
  module?: Module;
  deliverables?: ListDeliverablesElementWithOverdue[];
}

const columns = (): TableColumnType[] => [
  {
    key: 'name',
    name: strings.NAME,
    type: 'string',
  },
  {
    key: 'description',
    name: strings.DESCRIPTION,
    type: 'string',
  },
  {
    key: 'id',
    name: strings.ID,
    type: 'string',
  },
  {
    key: 'category',
    name: strings.CATEGORY,
    type: 'string',
  },
  {
    key: 'type',
    name: strings.TYPE,
    type: 'string',
  },
  {
    key: 'position',
    name: strings.POSITION,
    type: 'string',
  },
  {
    key: 'required',
    name: strings.REQUIRED_QUESTION_MARK,
    type: 'string',
  },
  {
    key: 'sensitive',
    name: strings.SENSITIVE_QUESTION_MARK,
    type: 'string',
  },
];

export default function contentAndMaterials({ module, deliverables }: contentAndMaterialsProps): JSX.Element {
  const theme = useTheme();

  return (
    <Card flushMobile style={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
      <Box
        sx={{ display: 'flex', alignItems: 'center', borderBottom: `1px solid ${theme.palette.TwClrBrdrTertiary}` }}
        marginBottom={theme.spacing(3)}
        paddingBottom={theme.spacing(3)}
      >
        <Typography fontSize='20px' fontWeight={600} color={theme.palette.TwClrTxt} sx={{ flexGrow: 1 }}>
          {strings.CONTENT_AND_MATERIALS}
        </Typography>
      </Box>
      <Grid container>
        <Grid item>
          <Typography fontSize='20px' fontWeight={600} color={theme.palette.TwClrTxt}>
            {strings.DELIVERABLES}
          </Typography>
          <Table rows={deliverables || []} columns={columns} id={'module-deliverables'} orderBy={'name'} />
        </Grid>
        <Grid item>
          <Typography fontSize='20px' fontWeight={600} color={theme.palette.TwClrTxt}>
            {strings.PREPARATION_MATERIALS}
          </Typography>
          <Box dangerouslySetInnerHTML={{ __html: module?.preparationMaterials || '' }} />
        </Grid>
        <Grid item>
          <Typography fontSize='20px' fontWeight={600} color={theme.palette.TwClrTxt}>
            {strings.ADDITIONAL_RESOURCES}
          </Typography>
          <Box dangerouslySetInnerHTML={{ __html: module?.additionalResources || '' }} />
        </Grid>
      </Grid>
    </Card>
  );
}
