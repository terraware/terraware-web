import React, { type JSX } from 'react';

import { Box, Typography, useTheme } from '@mui/material';

const TitleBar = (props: {
  header?: string;
  title?: string;
  subtitle?: string;
  titleExtraComponent?: JSX.Element;
}): JSX.Element => {
  const { header, title, subtitle, titleExtraComponent } = props;
  const theme = useTheme();

  return (
    <Box
      margin={theme.spacing(3)}
      alignItems='center'
      justifyContent='space-between'
      display='flex'
      flexDirection='row'
    >
      <Box display='flex' flexDirection='column'>
        <Typography fontSize='14px' lineHeight='20px' fontWeight={400} color={theme.palette.TwClrTxt}>
          {header}
        </Typography>
        <Box display='flex'>
          <Typography
            fontSize='24px'
            lineHeight='32px'
            fontWeight={600}
            color={theme.palette.TwClrTxt}
            margin={theme.spacing(1, 0)}
            paddingRight={1}
          >
            {title}
          </Typography>
          {titleExtraComponent}
        </Box>
        <Typography fontSize='14px' lineHeight='20px' fontWeight={400} color={theme.palette.TwClrTxt}>
          {subtitle}
        </Typography>
      </Box>
    </Box>
  );
};

export default TitleBar;
