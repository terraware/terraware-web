import { Grid, Typography, useTheme } from '@mui/material';

import TextTruncated from 'src/components/common/TextTruncated';

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
      <Grid item>
        <ToDoStatusBadge status={toDo.status} />
      </Grid>
      <Grid item>
        <ToDoDate toDo={toDo} />
      </Grid>
      <Grid item>
        <Typography fontSize={'16px'} fontWeight={600} lineHeight={'24px'} component={'span'} whiteSpace={'nowrap'}>
          {toDo.type}
        </Typography>
      </Grid>
      {/* These values might change when the tablet and mobile designs are implemented */}
      <Grid item xs={3} sm={3} md={3} lg={5} xl={7}>
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
      <Grid item marginLeft={'auto'}>
        <ToDoCta toDo={toDo} />
      </Grid>
    </Grid>
  );
};

export default ToDoRow;
