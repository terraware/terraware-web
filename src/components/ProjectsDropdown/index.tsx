import React, { useMemo } from 'react';

import { Dropdown, DropdownItem } from '@terraware/web-components';

import { useLocalization } from 'src/providers';
import strings from 'src/strings';

type ProjectDropdownOption = {
  name: string;
  id: number;
};

type ProjectsDropdownProps<T extends { projectId?: number | string } | undefined> = {
  allowUnselect?: boolean;
  autoComplete?: boolean;
  availableProjects: ProjectDropdownOption[] | undefined;
  label?: string | undefined;
  record: T;
  required?: boolean;
  setRecord: (setFn: (previousValue: T) => T) => void;
  unselectLabel?: string;
};

function ProjectsDropdown<T extends { projectId?: number | string } | undefined>({
  allowUnselect,
  autoComplete,
  availableProjects,
  label,
  record,
  required,
  setRecord,
  unselectLabel,
}: ProjectsDropdownProps<T>) {
  const { activeLocale } = useLocalization();

  const projectOptions = useMemo(() => {
    const options: DropdownItem[] = [];

    if (!activeLocale) {
      return [];
    }

    if (allowUnselect) {
      options.push({
        label: unselectLabel ?? strings.NO_PROJECT,
        value: undefined,
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
      autocomplete={autoComplete}
      id='projectId'
      label={label === '' ? label : strings.PROJECT}
      selectedValue={record?.projectId}
      options={projectOptions}
      onChange={(projectId: string) => {
        setRecord((previousValue) => {
          return {
            ...previousValue,
            projectId: projectId ? Number(projectId) : undefined,
          };
        });
      }}
      fullWidth
      required={required}
      sx={{ backgroundColor: '#fff', minWidth: '240px' }}
    />
  );
}

export default ProjectsDropdown;
