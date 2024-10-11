import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { Box, Typography, useTheme } from '@mui/material';

import PageSnackbar from 'src/components/PageSnackbar';
import PageForm from 'src/components/common/PageForm';
import TfMain from 'src/components/common/TfMain';
import { APP_PATHS } from 'src/constants';
import useGetModule from 'src/hooks/useGetModule';
import strings from 'src/strings';
import { ModuleEventPartial } from 'src/types/Module';
import useQuery from 'src/utils/useQuery';

import EventsTable from './EventsTable';

export default function EventEditView(): JSX.Element {
  const theme = useTheme();
  const navigate = useNavigate();
  const { moduleId } = useParams<{ moduleId: string }>();
  const { getModule, module, events } = useGetModule();
  const query = useQuery();
  const eventType = query.get('type');
  const [eventsToAdd, setEventsToAdd] = useState<ModuleEventPartial[]>();
  const [eventsToDelete, setEventsToDelete] = useState<ModuleEventPartial[]>();

  useEffect(() => {
    if (moduleId) {
      getModule({ moduleId: Number(moduleId) });
    }
  }, [moduleId]);

  const goToEvents = () => {
    navigate(APP_PATHS.ACCELERATOR_MODULES);
  };

  const save = () => {
    goToEvents();
  };

  const getTitleForType = () => {
    //type: 'One-on-One Session' | 'Workshop' | 'Live Session' | 'Recorded Session';
    switch (eventType) {
      case 'one-on-one': {
        return strings.ONE_ON_ONE_SESSION;
      }
      case 'workshop': {
        return strings.WORKSHOP;
      }
      case 'live': {
        return strings.LIVE_SESSION;
      }
      case 'recorded': {
        return strings.RECORDED_SESSION;
      }
    }
  };

  const getType = () => {
    switch (eventType) {
      case 'one-on-one': {
        return 'One-on-One Session';
      }
      case 'workshop': {
        return 'Workshop';
      }
      case 'live':
      default: {
        return 'Live Session';
      }
      case 'recorded': {
        return 'Recorded Session';
      }
    }
  };

  const getEvents = () => {
    switch (eventType) {
      case 'one-on-one': {
        return events?.filter((ev) => ev.type === 'One-on-One Session');
      }
      case 'workshop': {
        return events?.filter((ev) => ev.type === 'Workshop');
      }
      case 'live':
      default: {
        return events?.filter((ev) => ev.type === 'Live Session');
      }
      case 'recorded': {
        return events?.filter((ev) => ev.type === 'Recorded Session');
      }
    }
  };

  return (
    <TfMain>
      <PageForm cancelID='cancelLiveSession' saveID='saveLiveSession' onCancel={() => goToEvents()} onSave={save}>
        <Box marginBottom={theme.spacing(4)} paddingLeft={theme.spacing(3)}>
          <Typography fontSize='24px' fontWeight={600}>
            {getTitleForType()}
          </Typography>
          <PageSnackbar />
        </Box>
        <Box
          sx={{
            backgroundColor: theme.palette.TwClrBg,
            borderRadius: '32px',
            padding: theme.spacing(3),
            margin: 0,
          }}
        >
          <EventsTable
            type={getType()}
            module={module}
            events={getEvents()}
            eventsToAdd={eventsToAdd}
            setEventsToAdd={setEventsToAdd}
            eventsToDelete={eventsToDelete}
            setEventsToDelete={setEventsToDelete}
          />
        </Box>
      </PageForm>
    </TfMain>
  );
}
