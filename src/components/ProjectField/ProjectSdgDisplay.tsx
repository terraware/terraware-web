import React from 'react';

import { Grid, useTheme } from '@mui/material';

import SdgIcon from 'src/components/common/SDG/SdgIcon';
import { SustainableDevelopmentGoal } from 'src/types/Report';

const ProjectSdgDisplay = ({ sdgList }: { sdgList: SustainableDevelopmentGoal[] }) => {
  const theme = useTheme();

  return sdgList.map((sdg, i) => (
    <Grid item md={1} key={`sdg-${i}`} paddingRight={theme.spacing(1)} component={'span'}>
      <SdgIcon goal={sdg} size={128} />
    </Grid>
  ));
};

export default ProjectSdgDisplay;
