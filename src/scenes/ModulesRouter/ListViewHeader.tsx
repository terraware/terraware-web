import React, { useMemo } from 'react';

import { Typography } from '@mui/material';
import { Dropdown, DropdownItem } from '@terraware/web-components';

import useNavigateTo from 'src/hooks/useNavigateTo';
import { useParticipantData } from 'src/providers/Participant/ParticipantContext';

const ListViewHeader = () => {
  const { currentAcceleratorProject, projectsWithModules, setCurrentAcceleratorProject } = useParticipantData();
  const { goToModules } = useNavigateTo();

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

  return options?.length > 1 ? (
    <Dropdown
      onChange={(id) => {
        const projectId = +id;
        if (projectId !== currentAcceleratorProject?.id) {
          setCurrentAcceleratorProject(projectId);
          goToModules(projectId);
        }
      }}
      options={options}
      selectStyles={selectStyles}
      selectedValue={currentAcceleratorProject?.id}
    />
  ) : (
    <Typography sx={selectStyles.input}>{options[0]?.label}</Typography>
  );
};

export default ListViewHeader;
