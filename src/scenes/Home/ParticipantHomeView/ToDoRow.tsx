import { Grid, Typography, useTheme } from '@mui/material';

import { ToDoType } from './ToDo';
import ToDoCta from './ToDoCta';
import ToDoDate from './ToDoDate';
import ToDoStatusBadge from './ToDoStatusBadge';

interface ToDoRowProps {
  toDo: ToDoType;
}

const ToDoRow = ({ toDo }: ToDoRowProps) => {
  const theme = useTheme();

  return (
    <Grid
      container
      columnSpacing={theme.spacing(2)}
      marginTop={theme.spacing(2)}
      alignItems={'center'}
      justifyContent={'flex-start'}
      flexWrap={'nowrap'}
    >
      <Grid item flexBasis={'content'} flexGrow={0}>
        <ToDoStatusBadge status={toDo.status} />
      </Grid>
      <Grid item flexBasis={'content'} flexGrow={0}>
        <ToDoDate toDo={toDo} />
      </Grid>
      <Grid item flexBasis={'content'} flexGrow={0}>
        <Typography fontSize={'16px'} fontWeight={600} lineHeight={'24px'} component={'span'} whiteSpace={'nowrap'}>
          {toDo.type}
        </Typography>
      </Grid>
      <Grid item zeroMinWidth flexGrow={1}>
        <Typography
          fontSize={'16px'}
          fontWeight={500}
          lineHeight={'24px'}
          component={'p'}
          whiteSpace={'nowrap'}
          overflow={'hidden'}
          textOverflow={'ellipsis'}
        >
          {toDo.name}
        </Typography>
      </Grid>
      <Grid item flexBasis={'content'} flexGrow={0} marginLeft={'auto'}>
        <ToDoCta toDo={toDo} />
      </Grid>
    </Grid>
  );
};

export default ToDoRow;
