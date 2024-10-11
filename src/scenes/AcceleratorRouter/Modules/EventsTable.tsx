import React, { useEffect, useMemo, useState } from 'react';

import { Box, Grid, Typography, useTheme } from '@mui/material';
import { Button, TableColumnType } from '@terraware/web-components';

import Table from 'src/components/common/table';
import strings from 'src/strings';
import { Module, ModuleEvent } from 'src/types/Module';

import AddEventModal from './AddEventModal';
import EventsCellRenderer from './EventsCellRenderer';

interface EventsTableProps {
  type: 'One-on-One Session' | 'Workshop' | 'Live Session' | 'Recorded Session';
  events?: ModuleEvent[];
  eventsToAdd?: ModuleEvent[];
  setEventsToAdd?: React.Dispatch<React.SetStateAction<ModuleEvent[] | undefined>>;
  eventsToDelete?: ModuleEvent[];
  setEventsToDelete?: React.Dispatch<React.SetStateAction<ModuleEvent[] | undefined>>;
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
  const [prevEvents, setPrevEvents] = useState<ModuleEvent[]>(events || []);
  const [selectedRows, setSelectedRows] = useState<ModuleEvent[]>([]);
  const [eventToEdit, setEventToEdit] = useState<ModuleEvent>();

  const areEventsEqual = (a: ModuleEvent, b: ModuleEvent) => {
    if (a.startTime === b.startTime && a.startTime === b.startTime) {
      return true;
    }
    return false;
  };

  const onAddEvent = (eventToAdd: ModuleEvent) => {
    if (setEventsToAdd) {
      setEventsToAdd((prev) => {
        if (prev) {
          return [...prev, eventToAdd];
        } else {
          return [eventToAdd];
        }
      });
    }
  };

  const onEditedEvent = (editedEvent: ModuleEvent) => {
    if (setEventsToDelete && setEventsToAdd) {
      // When editing a event, first we remove the old entrance and then we add it again
      const eventsToAddIds = eventsToAdd?.map((eta) => eta.id);
      if (eventsToAddIds?.includes(editedEvent.id)) {
        const found = eventsToAdd?.find((eventToAdd) => eventToAdd.id === editedEvent.id);
        if (!(found && areEventsEqual(found, editedEvent))) {
          const newEventsToAdd = eventsToAdd?.filter((etAdd) => etAdd.id !== editedEvent.id);
          newEventsToAdd?.push(editedEvent);
          setEventsToAdd(newEventsToAdd);
        }
      } else {
        const found = prevEvents?.find((eventToAdd) => eventToAdd.id === editedEvent.id);
        if (!(found && areEventsEqual(found, editedEvent))) {
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
    }
  };

  const deleteModules = () => {
    if (setEventsToDelete && setEventsToAdd) {
      const selectedRowsIds = selectedRows.map((sr) => sr.id);
      const eventsToAddIds = eventsToAdd?.map((eta) => eta.id);

      const eventsToDelete = selectedRows.filter((sr) => !eventsToAddIds?.includes(sr.id));
      setEventsToDelete((prev) => {
        return prev ? [...prev, ...eventsToDelete] : eventsToDelete;
      });

      const newEventsToAdd = eventsToAdd?.filter((etAdd) => !selectedRowsIds.includes(etAdd.id));
      setEventsToAdd(newEventsToAdd);

      setSelectedRows([]);
    }
  };

  useEffect(() => {
    if (events) {
      setPrevEvents(events);
    }
  }, [events]);

  const onEditHandler = (clickedEvent: ModuleEvent, fromColumn?: string) => {
    if (fromColumn === 'title') {
      setEventToEdit(clickedEvent);
      setAddEventModalOpened(true);
    }
  };

  const onCloseModalHandler = () => {
    setEventToEdit(undefined);
    setAddEventModalOpened(false);
  };

  const onModalSaveHandler = (eventToSave: ModuleEvent) => {
    if (eventToEdit) {
      setEventToEdit(undefined);
      onEditedEvent(eventToSave);
    } else {
      onAddEvent(eventToSave);
    }
    setAddEventModalOpened(false);
  };

  const allEvents = useMemo(() => {
    const eventsToDeleteIds = eventsToDelete?.map((etd) => etd.id);
    return prevEvents.concat(eventsToAdd || []).filter((evn) => {
      if (eventsToDeleteIds?.includes(evn.id)) {
        const found = eventsToDelete?.find((e) => e.id === evn.id);
        if (found) {
          return !areEventsEqual(evn, found);
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
                onButtonClick: () => deleteModules(),
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
