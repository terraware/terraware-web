import React from 'react';

import { Grid, Typography, useTheme } from '@mui/material';

import SdgIcon from 'src/components/common/SDG/SdgIcon';
import strings from 'src/strings';
import { SustainableDevelopmentGoal } from 'src/types/Report';

const ProjectSdgDisplay = ({ sdgList }: { sdgList?: SustainableDevelopmentGoal[] }) => {
  const theme = useTheme();

  if (!sdgList || sdgList.length === 0) {
    return <Typography>{strings.NONE_SELECTED}</Typography>;
  }

  return sdgList
    .toSorted((a, b) => Number(a) - Number(b))
    .map((sdg, i) => (
      <Grid item md={1} key={`sdg-${i}`} paddingRight={theme.spacing(1)} component={'span'}>
        <SdgIcon goal={sdg} size={128} />
      </Grid>
    ));
};

export default ProjectSdgDisplay;
