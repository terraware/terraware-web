import React from 'react';

import { Box, Grid, Typography, useTheme } from '@mui/material';
import { useDeviceInfo } from '@terraware/web-components/utils';

import Button from 'src/components/common/button/Button';
import useNavigateTo from 'src/hooks/useNavigateTo';
import strings from 'src/strings';
import { ProjectModule } from 'src/types/Module';
import { getDateRangeString } from 'src/utils/dateFormatter';

interface ModuleEntryProps {
  index: number;
  module: ProjectModule;
  projectId: number;
}

const ModuleEntry = ({ module, projectId }: ModuleEntryProps) => {
  const theme = useTheme();
  const { goToModule } = useNavigateTo();
  const { isDesktop, isMobile } = useDeviceInfo();

  return (
    <Box
      borderBottom={`1px solid ${theme.palette.TwClrBgTertiary}`}
      paddingY={theme.spacing(3)}
      sx={{ '&:last-child': { border: 'none' } }}
    >
      <Grid container display={'flex'} justifyContent={'space-between'} marginBottom={theme.spacing(1)}>
        <Grid item xs={isDesktop ? undefined : 12}>
          <Typography
            component={'span'}
            fontSize={'20px'}
            fontWeight={600}
            lineHeight={'28px'}
            marginRight={theme.spacing(3)}
            whiteSpace={'nowrap'}
          >
            {module.title}
          </Typography>

          {isMobile && <br />}

          {module?.startDate && module?.endDate && (
            <Typography component={'span'} fontSize={'16px'} fontWeight={400} lineHeight={'24px'} whiteSpace={'nowrap'}>
              {getDateRangeString(module?.startDate, module?.endDate)}
            </Typography>
          )}
        </Grid>

        <Grid item xs={isDesktop ? undefined : 12}>
          <Button
            onClick={() => goToModule(projectId, module.id)}
            label={strings.VIEW}
            priority={'secondary'}
            style={isMobile ? { width: '100%' } : {}}
          />
        </Grid>
      </Grid>

      <Box marginBottom={theme.spacing(1)}>
        <Typography fontSize={'24px'} fontWeight={600} lineHeight={'32px'}>
          {module.name}
        </Typography>
      </Box>

      <Box dangerouslySetInnerHTML={{ __html: module.overview || '' }} />
    </Box>
  );
};

export default ModuleEntry;
