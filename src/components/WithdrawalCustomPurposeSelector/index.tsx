import React, { type JSX, useCallback, useMemo } from 'react';

import { SxProps } from '@mui/material';
import { ValueType } from '@terraware/web-components/components/Autocomplete/Autocomplete';

import Autocomplete from 'src/components/common/Autocomplete';
import useWithdrawalCustomPurposes from 'src/hooks/useWithdrawalCustomPurposes';
import { useLocalization } from 'src/providers';
import {
  CUSTOM_PURPOSE_MAX_LENGTH,
  isCustomPurposeTooLong,
  normalizeCustomPurposeName,
} from 'src/utils/withdrawalCustomPurposes';

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
      // Truncating here would leave the field showing text the withdrawal wouldn't save, since the
      // component keeps its own input text once the value it is given stops changing.
      onChange={(newValue) => onChange(String(newValue ?? ''))}
      errorText={
        isCustomPurposeTooLong(value)
          ? (strings.formatString(strings.NAME_MAXIMUM_LENGTH_X, CUSTOM_PURPOSE_MAX_LENGTH) as string)
          : undefined
      }
      filterOptions={filterOptions}
      sx={sx}
    />
  );
};

export default WithdrawalCustomPurposeSelector;
