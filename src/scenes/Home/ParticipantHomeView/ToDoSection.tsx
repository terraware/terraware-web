import { Box, Typography, useTheme } from '@mui/material';

import { ToDoType } from './ToDo';
import ToDoRow from './ToDoRow';

interface ToDoSectionProps {
  toDos: ToDoType[];
  section: string;
}

const ToDoSection = ({ toDos, section }: ToDoSectionProps) => {
  const theme = useTheme();

  if (toDos.length === 0) {
    return null;
  }

  return (
    <Box marginTop={theme.spacing(2)}>
      <Typography fontSize={'20px'} fontWeight={600} lineHeight={'28px'}>
        {section}
      </Typography>
      <Box
        sx={{
          borderBottom: `1px solid ${theme.palette.TwClrBaseGray100}`,
          height: '1px',
          width: '100%',
          padding: theme.spacing(1),
        }}
      />
      {toDos.map((toDo) => (
        <ToDoRow toDo={toDo} />
      ))}
    </Box>
  );
};

export default ToDoSection;
