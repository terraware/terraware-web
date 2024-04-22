import React from 'react';

import { Box, Grid, Typography, useTheme } from '@mui/material';
import { Button } from '@terraware/web-components';

import strings from 'src/strings';

const ModuleEventSessionCard = ({
  label,
  leftBorder = true,
  onClickButton,
  value,
}: {
  label: string;
  leftBorder?: boolean;
  onClickButton?: () => void;
  value: string;
}) => {
  const theme = useTheme();

  return (
    <Grid
      item
      xs={12}
      md={3}
      marginBottom={`${theme.spacing(3)}`}
      sx={{
        borderLeft: leftBorder ? `1px solid ${theme.palette.TwClrBaseGray100}` : 0,
        minWidth: '300px',
        textWrap: 'nowrap',
      }}
    >
      <Box paddingX={theme.spacing(2)}>
        <Typography fontSize={'20px'} lineHeight={'28px'} fontWeight={600} marginBottom={theme.spacing(1)}>
          {label}
        </Typography>

        <Typography marginBottom={theme.spacing(1)}>{value}</Typography>

        {onClickButton && <Button label={strings.MORE_INFO} onClick={onClickButton} priority='secondary' />}
      </Box>
    </Grid>
  );
};

export default ModuleEventSessionCard;
