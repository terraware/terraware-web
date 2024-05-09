import React, { Box, Typography, useTheme } from '@mui/material';

import { ToDoItem } from 'src/types/ProjectToDo';

import ToDoRow from './ToDoRow';

interface ToDoSectionProps {
  toDos: ToDoItem[];
  section: string;
}

const ToDoSection = ({ toDos, section }: ToDoSectionProps) => {
  const theme = useTheme();

  if (toDos.length === 0) {
    return null;
  }

  return (
    <Box display={'flex'} flexDirection={'column'} marginTop={theme.spacing(2)}>
      <Typography fontSize={'20px'} fontWeight={600} lineHeight={'28px'}>
        {section}
      </Typography>
      <Box
        flexGrow={1}
        sx={{
          borderBottom: `1px solid ${theme.palette.TwClrBaseGray100}`,
          height: '1px',
          padding: theme.spacing(1),
        }}
      />
      {toDos.map((toDo, index) => (
        <ToDoRow toDo={toDo} key={index} />
      ))}
    </Box>
  );
};

export default ToDoSection;
