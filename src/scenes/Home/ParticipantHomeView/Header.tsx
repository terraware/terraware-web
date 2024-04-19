import { useMemo } from 'react';

import { Grid, Typography, useTheme } from '@mui/material';
import { Dropdown, DropdownItem } from '@terraware/web-components';

import { useLocalization } from 'src/providers';
import { useParticipantData } from 'src/providers/Participant/ParticipantContext';
import { getDateRangeString } from 'src/utils/dateFormatter';

const Header = () => {
  const { activeLocale } = useLocalization();
  const theme = useTheme();
  const { currentModule, currentParticipantProject, participantProjects, setCurrentParticipantProject } =
    useParticipantData();

  const options: DropdownItem[] = useMemo(
    () =>
      participantProjects.map((project) => ({
        label: project.name,
        value: project.id,
      })),
    [participantProjects]
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
            <Dropdown
              onChange={setCurrentParticipantProject}
              options={options}
              selectStyles={selectStyles}
              selectedValue={currentParticipantProject?.id}
            />
          </Grid>
          <Grid item>
            <Typography fontSize={'20px'} fontWeight={600} lineHeight={'28px'} component={'span'}>
              {currentModule?.name}
            </Typography>
          </Grid>
          <Grid item>
            {currentModule?.startDate && currentModule?.endDate && activeLocale && (
              <Typography fontSize={'16px'} fontWeight={400} lineHeight={'24px'} component={'span'}>
                {getDateRangeString(currentModule?.startDate, currentModule?.endDate, activeLocale)}
              </Typography>
            )}
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  );
};

export default Header;
