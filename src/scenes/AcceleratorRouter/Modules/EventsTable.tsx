import React, { type JSX, useEffect, useMemo, useState } from 'react';

import { Box, Grid, Typography, useTheme } from '@mui/material';
import { Button, TableColumnType } from '@terraware/web-components';

import Table from 'src/components/common/table';
import strings from 'src/strings';
import { Module, ModuleEventPartial } from 'src/types/Module';

import AddEventModal from './AddEventModal';
import EventsCellRenderer from './EventsCellRenderer';

interface EventsTableProps {
  type: 'One-on-One Session' | 'Workshop' | 'Live Session' | 'Recorded Session';
  events?: ModuleEventPartial[];
  eventsToAdd?: ModuleEventPartial[];
  setEventsToAdd?: React.Dispatch<React.SetStateAction<ModuleEventPartial[] | undefined>>;
  eventsToDelete?: ModuleEventPartial[];
  setEventsToDelete?: React.Dispatch<React.SetStateAction<ModuleEventPartial[] | undefined>>;
  module?: Module;
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

export default function EventsTable(props: EventsTableProps): JSX.Element {
  const { type, events, eventsToAdd, setEventsToAdd, eventsToDelete, setEventsToDelete, module } = props;
  const theme = useTheme();
  const [addEventModalOpened, setAddEventModalOpened] = useState(false);
  const [prevEvents, setPrevEvents] = useState<ModuleEventPartial[]>(events || []);
  const [selectedRows, setSelectedRows] = useState<ModuleEventPartial[]>([]);
  const [eventToEdit, setEventToEdit] = useState<ModuleEventPartial>();

  const onAddEvent = (eventToAdd: ModuleEventPartial) => {
    let newEventToAdd = { ...eventToAdd };
    if (eventToAdd.id === -1 && !eventToAdd.feId) {
      newEventToAdd = { ...eventToAdd, feId: Symbol() };
    }
    if (setEventsToAdd) {
      setEventsToAdd((prev) => {
        if (prev) {
          return [...prev, newEventToAdd];
        } else {
          return [newEventToAdd];
        }
      });
    }
  };

  const editNewEvent = (editedEvent: ModuleEventPartial) => {
    if (!(setEventsToDelete && setEventsToAdd)) {
      return;
    }
    const eventsToAddWithNoIds = eventsToAdd?.filter((ev) => ev.id === -1);
    const feIds = eventsToAddWithNoIds?.map((ev) => ev.feId);
    if (feIds?.includes(editedEvent.feId)) {
      const found = eventsToAdd?.find((eventToAdd) => eventToAdd.feId === editedEvent.feId);
      if (found) {
        const newEventsToAdd = eventsToAdd?.filter((etAdd) => etAdd.feId !== editedEvent.feId);
        newEventsToAdd?.push(editedEvent);
        setEventsToAdd(newEventsToAdd);
      }
    }
  };

  const editExistingEvent = (editedEvent: ModuleEventPartial) => {
    if (!(setEventsToDelete && setEventsToAdd)) {
      return;
    }
    // When editing a event, first we remove the old entrance and then we add it again
    const eventsToAddIds = eventsToAdd?.map((mta) => mta.id).filter((id) => id !== -1);
    if (eventsToAddIds?.includes(editedEvent.id)) {
      const found = eventsToAdd?.find((eventToAdd) => eventToAdd.id === editedEvent.id);
      if (found) {
        const newEventsToAdd = eventsToAdd?.filter((etAdd) => etAdd.id !== editedEvent.id);
        newEventsToAdd?.push(editedEvent);
        setEventsToAdd(newEventsToAdd);
      }
    } else {
      const found = prevEvents?.find((eventToAdd) => eventToAdd.id?.toString() === editedEvent.id?.toString());
      if (found) {
        setEventsToDelete((prev) => {
          if (prev && found) {
            return [...prev, found];
          }
          if (found) {
            return [found];
          }
          return [];
        });
        setEventsToAdd((prev) => {
          if (prev) {
            return [...prev, editedEvent];
          } else {
            return [editedEvent];
          }
        });
      }
    }
  };

  const onEditedEvent = (editedEvent: ModuleEventPartial) => {
    if (editedEvent.id === -1) {
      editNewEvent(editedEvent);
    } else {
      editExistingEvent(editedEvent);
    }
  };

  const deleteEvents = () => {
    if (setEventsToDelete && setEventsToAdd) {
      const toDelete = selectedRows.filter((sr) => sr.id?.toString() !== '-1');
      setEventsToDelete((prev) => {
        return prev ? [...prev, ...toDelete] : toDelete;
      });

      const newEventsToAdd = eventsToAdd?.filter((etAdd) => !selectedRows.includes(etAdd));
      setEventsToAdd(newEventsToAdd);

      setSelectedRows([]);
    }
  };

  useEffect(() => {
    if (events) {
      setPrevEvents(events);
    }
  }, [events]);

  const onEditHandler = (clickedEvent: ModuleEventPartial) => {
    setEventToEdit(clickedEvent);
    setAddEventModalOpened(true);
  };

  const onCloseModalHandler = () => {
    setEventToEdit(undefined);
    setAddEventModalOpened(false);
  };

  const onModalSaveHandler = (eventToSave: ModuleEventPartial) => {
    if (eventToEdit) {
      setEventToEdit(undefined);
      onEditedEvent(eventToSave);
    } else {
      onAddEvent(eventToSave);
    }
    setAddEventModalOpened(false);
  };

  const allEvents = useMemo(() => {
    return prevEvents.concat(eventsToAdd || []).filter((evn) => {
      if (eventsToDelete?.includes(evn)) {
        const found = eventsToDelete?.find((e) => e === evn);
        if (found) {
          return false;
        }
      } else {
        return true;
      }
    });
  }, [prevEvents, eventsToAdd, eventsToDelete]);

  return (
    <>
      {addEventModalOpened && module && (
        <AddEventModal
          onClose={onCloseModalHandler}
          onSave={onModalSaveHandler}
          eventToEdit={eventToEdit}
          moduleId={module?.id}
          moduleName={module?.name}
          type={type}
        />
      )}
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Box dangerouslySetInnerHTML={{ __html: events?.[0]?.description || '' }} />
        </Grid>
        <Grid item xs={12}>
          <Box
            alignItems='center'
            display='flex'
            flexDirection='row'
            justifyContent='space-between'
            marginBottom={theme.spacing(2)}
            width='100%'
          >
            <Typography sx={{ fontSize: '20px', fontWeight: 600 }}>{strings.EVENTS}</Typography>

            <Button
              icon='plus'
              id='add-module'
              label={strings.ADD}
              onClick={() => setAddEventModalOpened(true)}
              priority='secondary'
              size='medium'
            />
          </Box>
        </Grid>
        <Grid item xs={12}>
          <Table
            id='modules-table'
            columns={columns}
            rows={allEvents}
            orderBy='startDate'
            showCheckbox={true}
            showTopBar={true}
            selectedRows={selectedRows}
            setSelectedRows={setSelectedRows}
            topBarButtons={[
              {
                buttonText: strings.REMOVE,
                buttonType: 'destructive',
                onButtonClick: () => deleteEvents(),
                icon: 'iconTrashCan',
              },
            ]}
            Renderer={EventsCellRenderer}
            controlledOnSelect={true}
            onSelect={onEditHandler}
            isClickable={() => false}
          />
        </Grid>
      </Grid>
    </>
  );
}
