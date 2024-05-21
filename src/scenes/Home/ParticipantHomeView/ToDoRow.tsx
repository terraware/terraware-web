import React, { Grid, Typography, useTheme } from '@mui/material';
import { useDeviceInfo } from '@terraware/web-components/utils';

import { ToDoItem } from 'src/types/ProjectToDo';

import ToDoCta from './ToDoCta';
import ToDoDate from './ToDoDate';
import ToDoStatusBadge from './ToDoStatusBadge';

interface ToDoRowProps {
  toDo: ToDoItem;
}

const ToDoRow = ({ toDo }: ToDoRowProps) => {
  const theme = useTheme();

  const { isTablet, isMobile } = useDeviceInfo();

  console.log('Tablet: ', isTablet);
  const wrap = () => {
    if (isMobile || isTablet) {
      return 'wrap';
    }
    return 'nowrap';
  };

  const gridSize = () => {
    if (isMobile || isTablet) {
      return 12;
    }
    return 'auto';
  };

  const whiteSpace = () => {
    if (isMobile || isTablet) {
      return 'pre-line';
    }
    return 'nowrap';
  };

  const marginLeft = () => {
    if (isMobile || isTablet) {
      return 0;
    }
    return 'auto';
  };

  return (
    <Grid
      container
      columnSpacing={theme.spacing(2)}
      marginTop={theme.spacing(2)}
      alignItems={'center'}
      justifyContent={'flex-start'}
      flexWrap={wrap()}
    >
      <Grid item flexGrow={0} xs={gridSize()}>
        <ToDoStatusBadge status={toDo.getBadge()} />
      </Grid>
      <Grid item flexGrow={0} xs={gridSize()}>
        <ToDoDate toDo={toDo} />
      </Grid>
      <Grid item flexBasis={'content'} flexGrow={0} overflow={'hidden'} textOverflow={'ellipsis'}>
        <Typography
          display={'inline'}
          fontSize={'16px'}
          fontWeight={600}
          lineHeight={'24px'}
          paddingInlineEnd={theme.spacing(2)}
          whiteSpace={'nowrap'}
        >
          {toDo.getType()}
        </Typography>
        <Typography
          display={'inline'}
          fontSize={'16px'}
          fontWeight={500}
          lineHeight={'24px'}
          component={'p'}
          whiteSpace={whiteSpace()}
        >
          {toDo.getTitle()}
        </Typography>
      </Grid>
      <Grid item flexGrow={0} xs={gridSize()} marginLeft={marginLeft()}>
        <ToDoCta toDo={toDo} />
      </Grid>
    </Grid>
  );
};

export default ToDoRow;
