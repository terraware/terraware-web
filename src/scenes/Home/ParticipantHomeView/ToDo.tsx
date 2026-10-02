import React from 'react';

import { Box, useTheme } from '@mui/material';

import strings from 'src/strings';

import ToDoSection from './ToDoSection';
import useProjectToDos from './useProjectToDos';

const ToDo = () => {
  const theme = useTheme();
  const { toDoItems, upcomingItems } = useProjectToDos();

  return (
    <>
      {((toDoItems && toDoItems.length > 0) || (upcomingItems && upcomingItems.length > 0)) && (
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
          <ToDoSection toDos={toDoItems} section={strings.TODO} />
          <ToDoSection toDos={upcomingItems} section={strings.UPCOMING} />
        </Box>
      )}
    </>
  );
};

export default ToDo;
