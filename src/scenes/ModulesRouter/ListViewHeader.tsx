import React, { useMemo } from 'react';

import { Dropdown, DropdownItem } from '@terraware/web-components';

import useNavigateTo from 'src/hooks/useNavigateTo';
import { useParticipantData } from 'src/providers/Participant/ParticipantContext';

const ListViewHeader = () => {
  const { currentParticipantProject, moduleProjects, setCurrentParticipantProject } = useParticipantData();
  const { goToModules } = useNavigateTo();

  const options: DropdownItem[] = useMemo(
    () =>
      moduleProjects.map((project) => ({
        label: project.name,
        value: project.id,
      })),
    [moduleProjects]
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
    <Dropdown
      onChange={(id) => {
        const projectId = +id;
        if (projectId != currentParticipantProject?.id) {
          setCurrentParticipantProject(projectId);
          goToModules(projectId);
        }
      }}
      options={options}
      selectStyles={selectStyles}
      selectedValue={currentParticipantProject?.id}
    />
  );
};

export default ListViewHeader;
