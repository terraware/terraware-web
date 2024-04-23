import React, { Theme, Typography, useTheme } from '@mui/material';
import { Property } from 'csstype';

import strings from 'src/strings';

import { ToDoType } from './ToDo';

interface ToDoDateProps {
  toDo: ToDoType;
}

const getDateColor = (status: ToDoType['status'], theme: Theme): Property.Color | undefined => {
  switch (status) {
    case 'Overdue':
      return theme.palette.TwClrTxtDanger;
    default:
      return theme.palette.TwClrTxtWarning;
  }
};

const ToDoDate = ({ toDo }: ToDoDateProps) => {
  const theme = useTheme();

  const dateLabel = toDo.type === 'Deliverable' ? strings.formatString(strings.DUE, toDo.dueDate) : toDo.dueDate;

  return (
    <Typography
      color={getDateColor(toDo.status, theme)}
      fontSize={'16px'}
      fontWeight={600}
      lineHeight={'24px'}
      component={'span'}
      whiteSpace={'nowrap'}
    >
      {dateLabel}
    </Typography>
  );
};

export default ToDoDate;
