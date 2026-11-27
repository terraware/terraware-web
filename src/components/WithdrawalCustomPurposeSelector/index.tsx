import React, { type JSX, useCallback, useMemo } from 'react';

import { SxProps } from '@mui/material';
import { ValueType } from '@terraware/web-components/components/Autocomplete/Autocomplete';

import Autocomplete from 'src/components/common/Autocomplete';
import useWithdrawalCustomPurposes from 'src/hooks/useWithdrawalCustomPurposes';
import { useLocalization } from 'src/providers';
import { normalizeCustomPurposeName } from 'src/utils/withdrawalCustomPurposes';

const CUSTOM_PURPOSE_MAX_LENGTH = 50;

type WithdrawalCustomPurposeSelectorProps = {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  id?: string;
  sx?: SxProps;
};

/**
 * Names an Other withdrawal, picked from the organization's saved purposes or typed in. A typed
 * name that doesn't match a saved one is added to the organization's list by the withdrawal itself.
 */
const WithdrawalCustomPurposeSelector = ({
  value,
  onChange,
  disabled,
  id = 'custom-purpose',
  sx,
}: WithdrawalCustomPurposeSelectorProps): JSX.Element => {
  const { strings } = useLocalization();
  const { customPurposes } = useWithdrawalCustomPurposes();

  const options = useMemo(() => customPurposes.map((customPurpose) => customPurpose.name), [customPurposes]);

  const filterOptions = useCallback(
    (allOptions: ValueType[]) => {
      const query = normalizeCustomPurposeName(value);
      if (query === '') {
        return allOptions;
      }
      return allOptions.filter((option) => normalizeCustomPurposeName(String(option ?? '')).includes(query));
    },
    [value]
  );

  return (
    <Autocomplete
      freeSolo
      disabled={disabled}
      id={id}
      options={options}
      selected={value}
      placeholder={strings.ENTER_OR_SELECT}
      onChange={(newValue) => onChange(String(newValue ?? '').slice(0, CUSTOM_PURPOSE_MAX_LENGTH))}
      filterOptions={filterOptions}
      sx={sx}
    />
  );
};

export default WithdrawalCustomPurposeSelector;
