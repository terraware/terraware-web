import React, { Theme, Typography, useTheme } from '@mui/material';
import { Property } from 'csstype';

import strings from 'src/strings';
import { ToDoBadge, ToDoItem } from 'src/types/ProjectToDo';

interface ToDoDateProps {
  toDo: ToDoItem;
}

const getDateColor = (status: ToDoBadge, theme: Theme): Property.Color | undefined => {
  switch (status) {
    case 'Not Accepted':
    case 'Overdue':
      return theme.palette.TwClrTxtDanger;
    case 'Completed':
    case 'Event':
    case 'In Review':
    case 'Not Submitted':
    default:
      return theme.palette.TwClrTxtWarning;
  }
};

const ToDoDate = ({ toDo }: ToDoDateProps) => {
  const theme = useTheme();

  const dateLabel = toDo.getDisplayDateTimeString();
  const dateString = toDo.getType() == 'Deliverable' ? strings.formatString(strings.DUE, dateLabel) : dateLabel;

  return (
    <Typography
      color={getDateColor(toDo.getBadge(), theme)}
      fontSize={'16px'}
      fontWeight={600}
      lineHeight={'24px'}
      component={'span'}
      whiteSpace={'nowrap'}
    >
      {dateString}
    </Typography>
  );
};

export default ToDoDate;
