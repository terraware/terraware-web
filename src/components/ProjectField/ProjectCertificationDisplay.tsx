import React from 'react';

import { Box, Grid, Typography, useTheme } from '@mui/material';

import strings from 'src/strings';
import { CarbonCertifications } from 'src/types/AcceleratorProject';

const ProjectCertificationDisplay = ({ certifications }: { certifications?: CarbonCertifications }) => {
  const theme = useTheme();

  if (!certifications?.length) {
    return null;
  }

  const getImageSource = (certification: string) => {
    switch (certification) {
      case 'CCB Standard':
      default:
        return '/assets/carbon/CcbStandard.png';
    }
  };

  return (
    <>
      {certifications.map((certification) => (
        <Grid item md={4} key={certification} paddingX={theme.spacing(2)} marginY={theme.spacing(1)}>
          <Box marginBottom={theme.spacing(1)}>
            <Typography fontSize='16px' fontWeight={400} lineHeight='24px' component={'span'}>
              {strings.CERTIFICATION}
            </Typography>
          </Box>
          <div>
            <img src={getImageSource(certification)} alt={certification} width='200px' />
          </div>
        </Grid>
      ))}
    </>
  );
};

export default ProjectCertificationDisplay;
