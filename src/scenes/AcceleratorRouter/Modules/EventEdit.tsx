import React, { type JSX, useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router';

import { Box, Typography, useTheme } from '@mui/material';
import { DateTime } from 'luxon';

import PageSnackbar from 'src/components/PageSnackbar';
import PageForm from 'src/components/common/PageForm';
import TfMain from 'src/components/common/TfMain';
import { APP_PATHS } from 'src/constants';
import useGetModule from 'src/hooks/useGetModule';
import { useSyncNavigate } from 'src/hooks/useSyncNavigate';
import {
  requestCreateModuleEvent,
  requestEventDeleteMany,
  requestEventProjectsUpdate,
  requestEventUpdate,
} from 'src/redux/features/events/eventsAsyncThunks';
import {
  selectCreateModuleEvent,
  selectDeleteManyEvents,
  selectUpdateEvent,
  selectUpdateEventProjects,
} from 'src/redux/features/events/eventsSelectors';
import { useAppDispatch, useAppSelector } from 'src/redux/store';
import strings from 'src/strings';
import { ModuleEventPartial } from 'src/types/Module';
import useQuery from 'src/utils/useQuery';
import useSnackbar from 'src/utils/useSnackbar';

import EventsTable from './EventsTable';

export default function EventEditView(): JSX.Element {
  const theme = useTheme();
  const navigate = useSyncNavigate();
  const { moduleId } = useParams<{ moduleId: string }>();

  const { events, module } = useGetModule(Number(moduleId));

  const query = useQuery();
  const eventType = query.get('type');
  const [eventsToAdd, setEventsToAdd] = useState<ModuleEventPartial[]>();
  const [eventsToDelete, setEventsToDelete] = useState<ModuleEventPartial[]>();
  const [updateEventProjectsRequestId, setUpdateEventProjectsRequestId] = useState('');
  const [createEventRequestId, setCreateEventRequestId] = useState('');
  const [updateEventRequestId, setUpdateEventRequestId] = useState('');
  const [deleteEventRequestId, setDeleteEventRequestId] = useState('');
  const dispatch = useAppDispatch();
  const responseProjects = useAppSelector(selectUpdateEventProjects(updateEventProjectsRequestId));
  const reponseCreate = useAppSelector(selectCreateModuleEvent(createEventRequestId));
  const reponseUpdate = useAppSelector(selectUpdateEvent(updateEventRequestId));
  const responseDelete = useAppSelector(selectDeleteManyEvents(deleteEventRequestId));
  const snackbar = useSnackbar();

  const goToEvent = useCallback(() => {
    navigate(APP_PATHS.ACCELERATOR_MODULE_CONTENT.replace(':moduleId', moduleId || ''));
  }, [navigate, moduleId]);

  useEffect(() => {
    if (responseProjects?.status === 'error') {
      snackbar.toastError();
    }
  }, [responseProjects, snackbar]);

  useEffect(() => {
    if (reponseCreate?.status === 'error') {
      snackbar.toastError();
    }
    if (reponseCreate?.status === 'success') {
      goToEvent();
    }
  }, [reponseCreate, goToEvent, snackbar]);

  useEffect(() => {
    if (reponseUpdate?.status === 'error') {
      snackbar.toastError();
    }
    if (reponseUpdate?.status === 'success') {
      goToEvent();
    }
  }, [reponseUpdate, goToEvent, snackbar]);

  useEffect(() => {
    if (responseDelete?.status === 'error') {
      snackbar.toastError();
    }
    if (responseDelete?.status === 'success') {
      goToEvent();
    }
  }, [responseDelete, goToEvent, snackbar]);

  const save = () => {
    const allEventIdsToDelete = eventsToDelete?.map((etd) => etd.id);
    const eventIdsToDelete: number[] = allEventIdsToDelete?.filter((iid): iid is number => iid !== undefined) || [];

    // if we are updating an existing event (id not -1), we don't want to remove it
    const eventsToUpdateIds = eventsToAdd?.filter((eta) => eta.id?.toString() !== '-1').map((ev) => ev.id);
    const filteredIdsToDelete = eventIdsToDelete.filter((id) => !eventsToUpdateIds?.includes(id));

    if (filteredIdsToDelete.length > 0) {
      const request = dispatch(requestEventDeleteMany({ eventsId: filteredIdsToDelete }));
      setDeleteEventRequestId(request.requestId);
    }

    eventsToAdd?.forEach((evta) => {
      if (evta.id?.toString() === '-1') {
        const { projects, ...rest } = evta;
        if (moduleId && rest.startTime) {
          const request = dispatch(
            requestCreateModuleEvent({
              event: {
                eventType: getType(),
                moduleId: Number(moduleId),
                startTime: DateTime.fromISO(rest.startTime).toString(),
                endTime: rest.endTime ? DateTime.fromISO(rest.endTime).toString() : undefined,
                meetingUrl: rest.meetingUrl,
                recordingUrl: rest.recordingUrl,
                slidesUrl: rest.slidesUrl,
              },
              projectsIds: projects?.map((p) => p.projectId || -1),
            })
          );
          setCreateEventRequestId(request.requestId);
        }
      } else {
        const { id, projects, ...rest } = evta;
        if (id && evta.startTime) {
          const updateRequest = {
            endTime: rest.endTime ? DateTime.fromISO(rest.endTime).toString() : undefined,
            meetingUrl: rest.meetingUrl,
            recordingUrl: rest.recordingUrl,
            slidesUrl: rest.slidesUrl,
            startTime: DateTime.fromISO(evta.startTime).toString(),
          };
          const request = dispatch(requestEventUpdate({ eventId: id, event: updateRequest }));
          setUpdateEventRequestId(request.requestId);
        }
        if (id && (projects?.length || 0) > 0) {
          const request2 = dispatch(
            requestEventProjectsUpdate({ eventId: id, projectIds: projects?.map((p) => p.projectId || -1) || [] })
          );
          setUpdateEventProjectsRequestId(request2.requestId);
        }
      }
    });
  };

  const getTitleForType = () => {
    // type: 'One-on-One Session' | 'Workshop' | 'Live Session' | 'Recorded Session';
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
      <PageForm cancelID='cancelLiveSession' saveID='saveLiveSession' onCancel={() => goToEvent()} onSave={save}>
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
