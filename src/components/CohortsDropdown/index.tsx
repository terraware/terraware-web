import React, { useMemo } from 'react';

import { Dropdown, DropdownItem } from '@terraware/web-components';

import { useLocalization } from 'src/providers';
import strings from 'src/strings';
import { Cohort } from 'src/types/Cohort';

type CohortsDropdownProps<T extends { id?: number } | undefined> = {
  allowUnselect?: boolean;
  availableCohorts: Cohort[] | undefined;
  label?: string | undefined;
  record: T;
  required?: boolean;
  setRecord: (setFn: (previousValue: T) => T) => void;
  unselectLabel?: string;
};

function CohortsDropdown<T extends { id?: number } | undefined>({
  allowUnselect,
  availableCohorts,
  label,
  record,
  required,
  setRecord,
  unselectLabel,
}: CohortsDropdownProps<T>) {
  const { activeLocale } = useLocalization();

  const cohortsOptions = useMemo(() => {
    const options: DropdownItem[] = [];

    if (!activeLocale) {
      return [];
    }

    if (allowUnselect) {
      options.push({
        label: unselectLabel ?? '',
        value: undefined,
      });
    }

    return [
      ...options,
      ...(availableCohorts || []).map((cohort) => ({
        label: cohort.name,
        value: cohort.id,
      })),
    ];
  }, [activeLocale, allowUnselect, availableCohorts, unselectLabel]);

  return (
    <Dropdown
      id='cohortId'
      label={label === '' ? label : strings.COHORT}
      selectedValue={record?.id}
      options={cohortsOptions}
      onChange={(cohortId: string) => {
        setRecord((previousValue: T): T => {
          if (!cohortId) {
            return {
              ...previousValue,
              id: undefined,
            };
          }

          return {
            ...previousValue,
            id: Number(cohortId),
          };
        });
      }}
      fullWidth
      required={required}
    />
  );
}

export default CohortsDropdown;
