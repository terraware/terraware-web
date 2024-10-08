import React from 'react';

import { Box, Grid, Typography, useTheme } from '@mui/material';
import { Button, TableColumnType } from '@terraware/web-components';

import Card from 'src/components/common/Card';
import Table from 'src/components/common/table';
import strings from 'src/strings';
import { Module, ModuleEvent } from 'src/types/Module';

interface ModuleEventsProps {
  module?: Module;
  events?: ModuleEvent[];
}

const columns = (): TableColumnType[] => [
  {
    key: 'id',
    name: strings.ID,
    type: 'string',
  },
  {
    key: 'status',
    name: strings.STATUS,
    type: 'string',
  },
  {
    key: 'startTime',
    name: strings.START_TIME,
    type: 'string',
  },
  {
    key: 'endTime',
    name: strings.END_TIME,
    type: 'string',
  },
  {
    key: 'meetingUrl',
    name: strings.MEETING_URL,
    type: 'string',
  },
  {
    key: 'recordingUrl',
    name: strings.RECORDING_URL,
    type: 'string',
  },
  {
    key: 'slidesUrl',
    name: strings.SLIDES_URL,
    type: 'string',
  },
  {
    key: 'projects',
    name: strings.PROJECTS,
    type: 'string',
  },
];

export default function ModuleEvents({ events }: ModuleEventsProps): JSX.Element {
  const theme = useTheme();

  const liveSessions = events?.filter((ev) => ev.type === 'Live Session');
  const oneOnOneSessions = events?.filter((ev) => ev.type === 'One-on-One Session');
  const recordedSessions = events?.filter((ev) => ev.type === 'Recorded Session');
  const workshops = events?.filter((ev) => ev.type === 'Workshop');

  return (
    <Card flushMobile style={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
      <Box
        sx={{ display: 'flex', alignItems: 'center', borderBottom: `1px solid ${theme.palette.TwClrBrdrTertiary}` }}
        marginBottom={theme.spacing(3)}
        paddingBottom={theme.spacing(3)}
      >
        <Typography fontSize='20px' fontWeight={600} color={theme.palette.TwClrTxt} sx={{ flexGrow: 1 }}>
          {strings.EVENTS}
        </Typography>
      </Box>
      <Grid container>
        <Grid item xs={12}>
          <Box display='flex' justifyContent='space-between' alignItems='center' paddingBottom={3}>
            <Typography fontSize='20px' fontWeight={600} color={theme.palette.TwClrTxt}>
              {strings.LIVE_SESSIONS}
            </Typography>
            <Button
              id='edit'
              label={strings.EDIT}
              onClick={() => true}
              icon='iconEdit'
              priority='secondary'
              className='edit-button'
              size='small'
              type='productive'
            />
          </Box>
          <Table rows={liveSessions || []} columns={columns} id={'module-liveSessions'} orderBy={'name'} />
        </Grid>
        <Grid item xs={12}>
          <Box display='flex' justifyContent='space-between' alignItems='center' paddingBottom={3}>
            <Typography fontSize='20px' fontWeight={600} color={theme.palette.TwClrTxt}>
              {strings.ONE_ON_ONE_SESSIONS}
            </Typography>
            <Button
              id='edit'
              label={strings.EDIT}
              onClick={() => true}
              icon='iconEdit'
              priority='secondary'
              className='edit-button'
              size='small'
              type='productive'
            />
          </Box>
          <Table rows={oneOnOneSessions || []} columns={columns} id={'module-oneOnOneSessions'} orderBy={'name'} />
        </Grid>
        <Grid item xs={12}>
          <Box display='flex' justifyContent='space-between' alignItems='center' paddingBottom={3}>
            <Typography fontSize='20px' fontWeight={600} color={theme.palette.TwClrTxt}>
              {strings.RECORDED_SESSIONS}
            </Typography>
            <Button
              id='edit'
              label={strings.EDIT}
              onClick={() => true}
              icon='iconEdit'
              priority='secondary'
              className='edit-button'
              size='small'
              type='productive'
            />
          </Box>
          <Table rows={recordedSessions || []} columns={columns} id={'module-recordedSessions'} orderBy={'name'} />
        </Grid>
        <Grid item xs={12}>
          <Box display='flex' justifyContent='space-between' alignItems='center' paddingBottom={3}>
            <Typography fontSize='20px' fontWeight={600} color={theme.palette.TwClrTxt}>
              {strings.WORKSHOPS}
            </Typography>
            <Button
              id='edit'
              label={strings.EDIT}
              onClick={() => true}
              icon='iconEdit'
              priority='secondary'
              className='edit-button'
              size='small'
              type='productive'
            />
          </Box>
          <Table rows={workshops || []} columns={columns} id={'module-workshops'} orderBy={'name'} />
        </Grid>
      </Grid>
    </Card>
  );
}
