import React, { type JSX, useCallback, useState } from 'react';
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
  CreateModuleEventRequestPayload,
  useCreateEventMutation,
  useDeleteEventMutation,
  useLazyGetEventQuery,
  useUpdateEventMutation,
  useUpdateEventProjectsMutation,
} from 'src/queries/generated/moduleEvents';
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
  const [createEvent] = useCreateEventMutation();
  const [updateEvent] = useUpdateEventMutation();
  const [deleteEvent] = useDeleteEventMutation();
  const [updateEventProjects] = useUpdateEventProjectsMutation();
  const [getEvent] = useLazyGetEventQuery();
  const snackbar = useSnackbar();

  const goToEvent = useCallback(() => {
    navigate(APP_PATHS.ACCELERATOR_MODULE_CONTENT.replace(':moduleId', moduleId || ''));
  }, [navigate, moduleId]);

  const createEventWithProjects = useCallback(
    async (event: CreateModuleEventRequestPayload, projectIds: number[]) => {
      const { id } = await createEvent(event).unwrap();
      if (projectIds.length > 0) {
        await updateEventProjects({
          eventId: id,
          updateModuleEventProjectsRequestPayload: { addProjects: projectIds },
        }).unwrap();
      }
    },
    [createEvent, updateEventProjects]
  );

  const setEventProjects = useCallback(
    async (eventId: number, projectIds: number[]) => {
      const { event } = await getEvent(eventId).unwrap();
      const oldProjectIds = event.projects?.map((project) => project.projectId) ?? [];
      await updateEventProjects({
        eventId,
        updateModuleEventProjectsRequestPayload: {
          addProjects: projectIds.filter((projectId) => !oldProjectIds.includes(projectId)),
          removeProjects: oldProjectIds.filter((projectId) => !projectIds.includes(projectId)),
        },
      }).unwrap();
    },
    [getEvent, updateEventProjects]
  );

  const save = async () => {
    const allEventIdsToDelete = eventsToDelete?.map((etd) => etd.id);
    const eventIdsToDelete: number[] = allEventIdsToDelete?.filter((iid): iid is number => iid !== undefined) || [];

    // if we are updating an existing event (id not -1), we don't want to remove it
    const eventsToUpdateIds = eventsToAdd?.filter((eta) => eta.id?.toString() !== '-1').map((ev) => ev.id);
    const filteredIdsToDelete = eventIdsToDelete.filter((id) => !eventsToUpdateIds?.includes(id));

    const requests: Promise<unknown>[] = filteredIdsToDelete.map((id) => deleteEvent(id).unwrap());

    eventsToAdd?.forEach((evta) => {
      if (evta.id?.toString() === '-1') {
        const { projects, ...rest } = evta;
        if (moduleId && rest.startTime) {
          requests.push(
            createEventWithProjects(
              {
                eventType: getType(),
                moduleId: Number(moduleId),
                startTime: DateTime.fromISO(rest.startTime).toString(),
                endTime: rest.endTime ? DateTime.fromISO(rest.endTime).toString() : undefined,
                meetingUrl: rest.meetingUrl,
                recordingUrl: rest.recordingUrl,
                slidesUrl: rest.slidesUrl,
              },
              projects?.map((p) => p.projectId || -1) ?? []
            )
          );
        }
      } else {
        const { id, projects, ...rest } = evta;
        if (id && evta.startTime) {
          requests.push(
            updateEvent({
              eventId: id,
              updateModuleEventRequestPayload: {
                endTime: rest.endTime ? DateTime.fromISO(rest.endTime).toString() : undefined,
                meetingUrl: rest.meetingUrl,
                recordingUrl: rest.recordingUrl,
                slidesUrl: rest.slidesUrl,
                startTime: DateTime.fromISO(evta.startTime).toString(),
              },
            }).unwrap()
          );
        }
        if (id && (projects?.length || 0) > 0) {
          requests.push(setEventProjects(id, projects?.map((p) => p.projectId || -1) || []));
        }
      }
    });

    if (requests.length === 0) {
      return;
    }

    const results = await Promise.allSettled(requests);
    if (results.some((result) => result.status === 'rejected')) {
      snackbar.toastError();
    } else {
      goToEvent();
    }
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
      <PageForm
        cancelID='cancelLiveSession'
        saveID='saveLiveSession'
        onCancel={() => goToEvent()}
        onSave={() => void save()}
      >
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
