import React, { Box, Grid, Typography, useTheme } from '@mui/material';

import Button from 'src/components/common/button/Button';
import useNavigateTo from 'src/hooks/useNavigateTo';
import strings from 'src/strings';
import { Module } from 'src/types/Module';

interface ModuleEntryProps {
  module: Module;
  projectId: number;
}

const ModuleEntry = ({ module, projectId }: ModuleEntryProps) => {
  const theme = useTheme();
  const { goToModule } = useNavigateTo();

  return (
    <Box paddingY={theme.spacing(3)} borderBottom={`1px solid ${theme.palette.TwClrBgTertiary}`}>
      <Grid container display={'flex'} justifyContent={'space-between'} marginBottom={theme.spacing(1)}>
        <Grid item>
          <Typography
            fontSize={'20px'}
            fontWeight={600}
            lineHeight={'28px'}
            component={'span'}
            marginRight={theme.spacing(3)}
          >
            {module.name}
          </Typography>
          <Typography component={'span'}>{module.dateRange}</Typography>
        </Grid>
        <Grid item>
          <Button onClick={() => goToModule(projectId, module.id)} label={strings.VIEW} priority={'secondary'} />
        </Grid>
      </Grid>

      <Box marginBottom={theme.spacing(1)}>
        <Typography fontSize={'24px'} fontWeight={600} lineHeight={'32px'}>
          {module.title}
        </Typography>
      </Box>

      <Box dangerouslySetInnerHTML={{ __html: module.description || '' }} />
    </Box>
  );
};

export default ModuleEntry;
