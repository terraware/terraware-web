import React, { useMemo } from 'react';

import { Dropdown, DropdownItem } from '@terraware/web-components';

import { useLocalization } from 'src/providers';
import strings from 'src/strings';
import { Project } from 'src/types/Project';

type ProjectsDropdownProps<T extends { projectId?: number } | undefined> = {
  allowUnselect?: boolean;
  availableProjects: Project[] | undefined;
  label?: string | undefined;
  record: T;
  setRecord: (setFn: (previousValue: T) => T) => void;
};

function ProjectsDropdown<T extends { projectId?: number } | undefined>({
  allowUnselect,
  availableProjects,
  label,
  record,
  setRecord,
}: ProjectsDropdownProps<T>) {
  const { activeLocale } = useLocalization();

  const projectOptions = useMemo(() => {
    const options: DropdownItem[] = [];

    if (!activeLocale) {
      return [];
    }

    if (allowUnselect) {
      options.push({
        label: strings.NO_PROJECT,
        value: '',
      });
    }

    return [
      ...options,
      ...(availableProjects || []).map((project) => ({
        label: project.name,
        value: project.id,
      })),
    ];
  }, [activeLocale, allowUnselect, availableProjects]);

  return (
    <Dropdown
      id='projectId'
      label={label === '' ? label : strings.PROJECT}
      selectedValue={record?.projectId}
      options={projectOptions}
      onChange={(projectId: string) => {
        setRecord((previousValue) => {
          return {
            ...previousValue,
            projectId: projectId ? Number(projectId) : null,
          };
        });
      }}
      fullWidth
    />
  );
}

export default ProjectsDropdown;
