import { Box, Typography, useTheme } from '@mui/material';

import strings from 'src/strings';

import ToDoSection from './ToDoSection';

// I am not sure if this will come from a single purpose-built API, or if we need to derive this
// from the deliverable list and module events. For now I am just mocking this in the component
// until the BE is done.
export type ToDoType = {
  deliverableId?: number;
  dueDate: string;
  eventId?: number;
  name: string;
  projectId: number;
  section: 'todo' | 'upcoming';
  status: 'Overdue' | 'Not Submitted' | 'Event';
  type: 'Deliverable' | 'Live Session' | '1:1 Session';
};

const MOCK_TODOS: ToDoType[] = [
  {
    deliverableId: 1,
    dueDate: 'Tuesday, March 1',
    name: 'Feasibility Questions - Kick-Off',
    projectId: 1,
    section: 'todo',
    status: 'Overdue',
    type: 'Deliverable',
  },
  {
    deliverableId: 2,
    dueDate: 'Tuesday, March 10',
    name: 'Feasibility Questions - Introduction to Carbon Projects',
    projectId: 1,
    section: 'todo',
    status: 'Not Submitted',
    type: 'Deliverable',
  },
  {
    dueDate: 'Monday, March 5 at 15:00 PM',
    eventId: 1,
    name: 'Introduction to Carbon Projects',
    projectId: 1,
    section: 'upcoming',
    status: 'Event',
    type: 'Live Session',
  },
  {
    deliverableId: 3,
    dueDate: 'Tuesday, March 17',
    name: 'Feasibility Questions - Legal Eligibility',
    projectId: 1,
    section: 'upcoming',
    status: 'Not Submitted',
    type: 'Deliverable',
  },
  {
    deliverableId: 4,
    dueDate: 'Tuesday, March 21',
    name: 'Feasibility Questions - Proposed Restoration Activies and some more text',
    projectId: 1,
    section: 'upcoming',
    status: 'Not Submitted',
    type: 'Deliverable',
  },
  {
    dueDate: 'Tuesday, March 23',
    eventId: 2,
    name: 'Proposed Restoration Activities Part 1',
    projectId: 1,
    section: 'upcoming',
    status: 'Event',
    type: '1:1 Session',
  },
];

const ToDo = () => {
  const theme = useTheme();

  const toDos = MOCK_TODOS.filter((todo) => todo.section === 'todo');
  const upcoming = MOCK_TODOS.filter((todo) => todo.section === 'upcoming');

  return (
    <Box
      sx={{
        backgroundColor: theme.palette.TwClrBaseWhite,
        borderRadius: theme.spacing(2),
        border: `1px solid ${theme.palette.TwClrBrdrInfo}`,
        padding: theme.spacing(3),
        paddingTop: theme.spacing(2),
        position: 'relative',
        width: '100%',
      }}
    >
      <ToDoSection toDos={toDos} section={strings.TODO} />
      <ToDoSection toDos={upcoming} section={strings.UPCOMING} />
    </Box>
  );
};

export default ToDo;
