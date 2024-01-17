import React from 'react';
import { Dropdown } from '@terraware/web-components';
import strings from 'src/strings';
import { Project } from 'src/types/Project';

type ProjectsDropdownProps<T extends { projectId?: number } | undefined> = {
  availableProjects: Project[] | undefined;
  record: T;
  setRecord: (setFn: (previousValue: T) => T) => void;
};

function ProjectsDropdown<T extends { projectId?: number } | undefined>({
  availableProjects,
  record,
  setRecord,
}: ProjectsDropdownProps<T>) {
  return (
    <Dropdown
      id='projectId'
      label={strings.PROJECT}
      selectedValue={record?.projectId}
      options={(availableProjects || []).map((project) => ({
        label: project.name,
        value: project.id,
      }))}
      onChange={(projectId: string) =>
        setRecord((previousValue) => ({
          ...previousValue,
          projectId: Number(projectId),
        }))
      }
      fullWidth
    />
  );
}

export default ProjectsDropdown;
