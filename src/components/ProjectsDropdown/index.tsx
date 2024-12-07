import React, { useMemo } from 'react';

import { Dropdown, DropdownItem } from '@terraware/web-components';

import { useLocalization } from 'src/providers';
import strings from 'src/strings';

type ProjectDropdownOption = {
  name: string;
  dealName?: string;
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
  unselectValue?: string;
  useDealName?: boolean;
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
  unselectValue,
  useDealName,
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
        value: unselectValue,
      });
    }

    return [
      ...options,
      ...(availableProjects || [])
        .map((project) => ({
          label: useDealName ? project.dealName : project.name,
          value: project.id,
        }))
        .filter((item): item is DropdownItem => item.label !== undefined),
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
