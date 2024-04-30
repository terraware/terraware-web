import React, { Box, Grid, Typography, useTheme } from '@mui/material';

import Button from 'src/components/common/button/Button';
import useNavigateTo from 'src/hooks/useNavigateTo';
import { useLocalization } from 'src/providers';
import strings from 'src/strings';
import { Module } from 'src/types/Module';
import { getDateRangeString } from 'src/utils/dateFormatter';

interface ModuleEntryProps {
  index: number;
  module: Module;
  projectId: number;
}

const ModuleEntry = ({ module, projectId }: ModuleEntryProps) => {
  const { activeLocale } = useLocalization();
  const theme = useTheme();
  const { goToModule } = useNavigateTo();

  return (
    <Box
      borderBottom={`1px solid ${theme.palette.TwClrBgTertiary}`}
      paddingY={theme.spacing(3)}
      sx={{ '&:last-child': { border: 'none' } }}
    >
      <Grid container display={'flex'} justifyContent={'space-between'} marginBottom={theme.spacing(1)}>
        <Grid item>
          <Typography
            component={'span'}
            fontSize={'20px'}
            fontWeight={600}
            lineHeight={'28px'}
            marginRight={theme.spacing(3)}
          >
            {module.title}
          </Typography>

          {module?.startDate && module?.endDate && activeLocale && (
            <Typography component={'span'}>
              {getDateRangeString(module?.startDate, module?.endDate, activeLocale)}
            </Typography>
          )}
        </Grid>

        <Grid item>
          <Button onClick={() => goToModule(projectId, module.id)} label={strings.VIEW} priority={'secondary'} />
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
