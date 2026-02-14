import React, { useMemo } from 'react';

import { Grid, Typography, useTheme } from '@mui/material';
import { Dropdown, DropdownItem } from '@terraware/web-components';

import { useParticipantData } from 'src/providers/Participant/ParticipantContext';
import { getDateRangeString } from 'src/utils/dateFormatter';

const Header = () => {
  const theme = useTheme();
  const { currentAcceleratorProject, setCurrentAcceleratorProject, projectsWithModules, modules } =
    useParticipantData();

  const currentModule = useMemo(() => modules?.find((module) => module.isActive), [modules]);

  const options: DropdownItem[] = useMemo(
    () =>
      projectsWithModules.map((project) => ({
        label: project.name,
        value: project.id,
      })),
    [projectsWithModules]
  );

  const selectStyles = {
    arrow: {
      height: '32px',
    },
    input: {
      fontSize: '24px',
      fontWeight: '600',
      lineHeight: '32px',
    },
    inputContainer: {
      border: 0,
      backgroundColor: 'initial',
    },
  };

  return (
    <Grid container>
      <Grid item marginTop={theme.spacing(1)} marginLeft={theme.spacing(1)}>
        <Grid container alignItems={'center'} columnSpacing={theme.spacing(2)}>
          <Grid item>
            {options?.length > 1 ? (
              <Dropdown
                onChange={setCurrentAcceleratorProject}
                options={options}
                selectStyles={selectStyles}
                selectedValue={currentAcceleratorProject?.id}
              />
            ) : (
              <Typography sx={selectStyles.input}>{options[0].label}</Typography>
            )}
          </Grid>

          <Grid item>
            <Typography fontSize={'20px'} fontWeight={600} lineHeight={'28px'} component={'span'}>
              {currentModule && currentModule?.name}
            </Typography>
          </Grid>

          <Grid item>
            {currentModule && currentModule?.startDate && currentModule?.endDate && (
              <Typography fontSize={'16px'} fontWeight={400} lineHeight={'24px'} component={'span'}>
                {getDateRangeString(currentModule?.startDate, currentModule?.endDate)}
              </Typography>
            )}
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  );
};

export default Header;
