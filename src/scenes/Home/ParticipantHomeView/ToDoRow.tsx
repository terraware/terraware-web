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
    >
      <Grid item>
        <ToDoStatusBadge status={toDo.status} />
      </Grid>
      <Grid item>
        <ToDoDate toDo={toDo} />
      </Grid>
      <Grid item>
        <Typography fontSize={'16px'} fontWeight={600} lineHeight={'24px'} component={'span'}>
          {toDo.type}
        </Typography>
      </Grid>
      <Grid item>
        {/* TODO this will need a new component to make the truncated text fluid */}
        <TextTruncated fontSize={16} stringList={[toDo.name]} />
      </Grid>
      <Grid item marginLeft={'auto'}>
        <ToDoCta toDo={toDo} />
      </Grid>
    </Grid>
  );
};

export default ToDoRow;
