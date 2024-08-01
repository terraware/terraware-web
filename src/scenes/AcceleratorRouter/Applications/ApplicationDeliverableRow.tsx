import React from 'react';

import { Box, Typography, useTheme } from '@mui/material';
import { Button } from '@terraware/web-components';

import strings from 'src/strings';

type ApplicationDeliverableRowProps = {
  title: string;
  goToDeliverable: () => void;
};

const ApplicationDeliverableRow = ({ title, goToDeliverable }: ApplicationDeliverableRowProps) => {
  const theme = useTheme();

  return (
    <Box display={'flex'} flexDirection={'row'} marginTop={theme.spacing(3)} alignItems={'center'}>
      <Button label={strings.REVIEW} onClick={goToDeliverable} size={'small'} priority={'secondary'} />
      <Typography fontSize={'16px'} fontWeight={500} lineHeight={'24px'} marginLeft={theme.spacing(2)}>
        {title}
      </Typography>
    </Box>
  );
};

export default ApplicationDeliverableRow;
